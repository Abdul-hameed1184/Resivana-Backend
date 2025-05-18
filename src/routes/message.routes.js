import express from "express";
import multer from "multer";

import { protectedRoute } from "../middleware/auth.middleware.js";
import {
  deleteMessage,
  getMessages,
  getUsersForSidebar,
  sendNewMessage,
} from "../controller/message.controller.js";
import { messageMediaUpload } from "../middleware/message.middleware.js";
import upload from "../controller/upload.controller.js";

const router = express.Router();

// router.get("/users", protectedRoute, getUsersForSidebar);
router.get("/:id", protectedRoute, getMessages);



router.post(
  "/send",
  protectedRoute,
  upload,
  messageMediaUpload,
  sendNewMessage
);

router.delete("/message/:messageId", protectedRoute, deleteMessage);

export default router;
