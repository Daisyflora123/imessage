import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useGroupStore = create((set, get) => ({
    groups: [],
    groupMessages: [],
    activeGroupId: null,
    isGroupsLoading: false,
    isGroupMessagesLoading: false,
    isSendingGroupMessage: false,
    isCreatingGroup: false,

    // ── Fetch all groups the user belongs to ──────────────────────────────
    getGroups: async () => {
        set({ isGroupsLoading: true });
        try {
            const res = await axiosInstance.get("/groups");
            set({ groups: res.data });
        } catch (error) {
            console.error("Error in getGroups:", error.message);
        } finally {
            set({ isGroupsLoading: false });
        }
    },

    // ── Fetch messages for the active group ───────────────────────────────
    getGroupMessages: async (groupId) => {
        if (!groupId) return;
        set({ isGroupMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/groups/${groupId}/messages`);
            set({ groupMessages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load group messages");
        } finally {
            set({ isGroupMessagesLoading: false });
        }
    },

    // ── Send a text/media message to a group ─────────────────────────────
    sendGroupMessage: async ({ groupId, text, file }) => {
        if (!groupId) return false;

        const payload = file ? (() => {
            const fd = new FormData();
            fd.append("media", file);
            if (text) fd.append("text", text);
            return fd;
        })() : { text };

        set({ isSendingGroupMessage: true });
        try {
            const res = await axiosInstance.post(`/groups/${groupId}/send`, payload);
            set((state) => ({ groupMessages: [...state.groupMessages, res.data] }));
            // Refresh group list so the group floats up in sidebar
            get().getGroups();
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
            return false;
        } finally {
            set({ isSendingGroupMessage: false });
        }
    },

    // ── Create a new group ────────────────────────────────────────────────
    createGroup: async ({ name, description, memberIds, groupPicFile }) => {
        set({ isCreatingGroup: true });
        try {
            const formData = new FormData();
            formData.append("name", name);
            if (description) formData.append("description", description);
            formData.append("memberIds", JSON.stringify(memberIds));
            if (groupPicFile) formData.append("groupPic", groupPicFile);

            const res = await axiosInstance.post("/groups/create", formData);
            set((state) => ({ groups: [res.data, ...state.groups] }));
            toast.success("Group created!");
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create group");
            return null;
        } finally {
            set({ isCreatingGroup: false });
        }
    },

    // ── Leave a group ─────────────────────────────────────────────────────
    leaveGroup: async (groupId) => {
        try {
            await axiosInstance.delete(`/groups/${groupId}/leave`);
            set((state) => ({
                groups: state.groups.filter((g) => g._id !== groupId),
                activeGroupId: state.activeGroupId === groupId ? null : state.activeGroupId,
                groupMessages: state.activeGroupId === groupId ? [] : state.groupMessages,
            }));
            toast.success("Left the group");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to leave group");
        }
    },

    // ── Active group selection ────────────────────────────────────────────
    setActiveGroupId: (groupId) => set({ activeGroupId: groupId, groupMessages: groupId ? get().groupMessages : [] }),

    // ── Real-time: subscribe to incoming group messages ───────────────────
    subscribeToGroupMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newGroupMessage");
        socket.on("newGroupMessage", ({ groupId, message }) => {
            const { activeGroupId } = get();

            // If the message is for the currently open group, append it
            if (activeGroupId === groupId) {
                set((state) => ({ groupMessages: [...state.groupMessages, message] }));
            }

            // Always refresh the groups list (to bump updatedAt order)
            get().getGroups();
        });
    },

    unsubscribeFromGroupMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newGroupMessage");
    },
}));
