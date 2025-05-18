import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { createConversation, getConversationMessages, getUserConversations, sendMessage } from "../controller/chat.controller.js";


const router = express.Router();


router.get("/", protectedRoute, getUserConversations)

router.post("/:id/start", protectedRoute, createConversation);

router.post("/send-message", protectedRoute, sendMessage);
// router.get("/messages/:conversationId", protectedRoute, getMessages);
router.get("/:id/messages", protectedRoute, getConversationMessages);




export default router;

