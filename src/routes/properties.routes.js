import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import {
  createProperty,
  deleteProperty,
  getProperties,
  getPropertyById,
  searchProperty,
  updateProperty,
} from "../controller/properties.controller.js";
import multer from "multer";
import { mediaUpload } from "../middleware/propertiesMedia.middleware.js";
import upload from "../controller/upload.controller.js";
// import { deleteMedia, upload } from '../middleware/upload.middleware.js';

const routes = express.Router();

const checkAgent = (req, res, next) => {
  if (req.user.role !== "agent") {
    return res
      .status(403)
      .json({ message: "You are not authorized to create a property" });
  }
  next();
};


routes.post(
  "/create",
  protectedRoute,
  checkAgent,
  upload,
  mediaUpload,
  createProperty
);
routes.get("/", getProperties);
// routes.delete('/delete-image', protectedRoute, deleteImage)
routes.get("/search", searchProperty);
routes.get("/:id", getPropertyById);

// routes.put('/:id', protectedRoute, updateProperty);
routes.delete("/:id", protectedRoute, deleteProperty);

routes.put(
  "/:id",
  protectedRoute,
  checkAgent,
  updateProperty
);

// routes.delete('/:id', protectedRoute, deleteMedia, deleteProperty);

// create , delete, read, update,
export default routes;
