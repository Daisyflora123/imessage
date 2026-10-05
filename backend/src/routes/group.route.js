import express from "express";
import {
    createGroup,
    getMyGroups,
    getGroupMessages,
    sendGroupMessage,
    leaveGroup,
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getMyGroups);
router.post("/create", upload.single("groupPic"), createGroup);
router.get("/:groupId/messages", getGroupMessages);
router.post("/:groupId/send", upload.single("media"), sendGroupMessage);
router.delete("/:groupId/leave", leaveGroup);

export default router;
