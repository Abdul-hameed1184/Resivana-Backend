import express from "express";
import {
  addReview,
  deleteReview,
  editReview,
  getReviews,
} from "../controller/review.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// router.post("/:propertyId", protectedRoute, addReview);
router.post("/:agentId", protectedRoute, addReview)
// router.get("/:propertyId", protectedRoute, getReviews);
router.get("/:agentId", protectedRoute, getReviews);
router.put("/:reviewId", protectedRoute, editReview);
router.delete("/:reviewId", protectedRoute, deleteReview);

export default router;
