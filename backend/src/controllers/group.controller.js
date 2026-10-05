import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { io, userSocketMap } from "../lib/socket.js";

// POST /api/groups/create
export async function createGroup(req, res) {
    try {
        const { name, description, memberIds } = req.body;
        const adminId = req.user._id;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Group name is required" });
        }

        // Parse memberIds — could arrive as a JSON string or an array
        let parsedMemberIds = [];
        if (memberIds) {
            parsedMemberIds = typeof memberIds === "string" ? JSON.parse(memberIds) : memberIds;
        }

        // Admin is always a member
        const uniqueMembers = [...new Set([String(adminId), ...parsedMemberIds.map(String)])];

        let groupPic = "";
        if (req.file) {
            if (!hasImageKitConfig()) {
                return res.status(500).json({ message: "Media upload is not configured" });
            }
            groupPic = await uploadChatMedia(req.file);
        }

        const group = new Group({
            name: name.trim(),
            description: description?.trim() ?? "",
            groupPic,
            admin: adminId,
            members: uniqueMembers,
        });

        await group.save();

        // Populate so the client receives full user objects for members
        await group.populate("members", "-clerkId");
        await group.populate("admin", "-clerkId");

        res.status(201).json(group);
    } catch (error) {
        console.error("Error in createGroup:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET /api/groups  — all groups the current user belongs to
export async function getMyGroups(req, res) {
    try {
        const userId = req.user._id;

        const groups = await Group.find({ members: userId })
            .populate("members", "-clerkId")
            .populate("admin", "-clerkId")
            .sort({ updatedAt: -1 });

        res.status(200).json(groups);
    } catch (error) {
        console.error("Error in getMyGroups:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET /api/groups/:groupId/messages
export async function getGroupMessages(req, res) {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        // Make sure the requester is actually a member
        const group = await Group.findOne({ _id: groupId, members: userId });
        if (!group) {
            return res.status(403).json({ message: "Not a member of this group" });
        }

        const messages = await GroupMessage.find({ groupId })
            .populate("senderId", "-clerkId")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getGroupMessages:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

// POST /api/groups/:groupId/send
export async function sendGroupMessage(req, res) {
    try {
        const { groupId } = req.params;
        const { text } = req.body;
        const senderId = req.user._id;

        const group = await Group.findOne({ _id: groupId, members: senderId });
        if (!group) {
            return res.status(403).json({ message: "Not a member of this group" });
        }

        let imageUrl;
        let videoUrl;

        if (req.file) {
            if (!hasImageKitConfig()) {
                return res.status(500).json({ message: "Media upload is not configured" });
            }
            const url = await uploadChatMedia(req.file);
            if (req.file.mimetype.startsWith("video/")) videoUrl = url;
            else imageUrl = url;
        }

        const newMessage = new GroupMessage({
            groupId,
            senderId,
            text,
            image: imageUrl,
            video: videoUrl,
        });

        await newMessage.save();
        await newMessage.populate("senderId", "-clerkId");

        // Broadcast to every online member of the group except the sender
        group.members.forEach((memberId) => {
            if (String(memberId) === String(senderId)) return;
            const socketId = userSocketMap[String(memberId)];
            if (socketId) {
                io.to(socketId).emit("newGroupMessage", { groupId: String(groupId), message: newMessage });
            }
        });

        // Also update the group's updatedAt so it floats to the top in sidebar
        await Group.findByIdAndUpdate(groupId, { updatedAt: new Date() });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error in sendGroupMessage:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

// DELETE /api/groups/:groupId/leave  — leave a group (admin must transfer or delete)
export async function leaveGroup(req, res) {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findOne({ _id: groupId, members: userId });
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isAdmin = String(group.admin) === String(userId);
        const remainingMembers = group.members.filter((m) => String(m) !== String(userId));

        if (isAdmin && remainingMembers.length > 0) {
            // Transfer admin to next member
            group.admin = remainingMembers[0];
        }

        if (remainingMembers.length === 0) {
            // Nobody left — delete the whole group
            await Group.findByIdAndDelete(groupId);
            await GroupMessage.deleteMany({ groupId });
            return res.status(200).json({ message: "Group deleted (no members left)" });
        }

        group.members = remainingMembers;
        await group.save();

        res.status(200).json({ message: "Left group successfully" });
    } catch (error) {
        console.error("Error in leaveGroup:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
