import express from 'express';
import { checkAuth, deletProfilePic, login, logout, signup, uploadProfilePic } from '../controller/auth.controller.js';
import {  protectedRoute } from '../middleware/auth.middleware.js';
import multer from 'multer';


const storage = multer.memoryStorage();
const upload = multer({ storage })



const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

router.post('/upload-profile', protectedRoute, upload.single("file"), uploadProfilePic);
router.delete('/delete-profile', protectedRoute, deletProfilePic);

router.get('/check', checkAuth)

export default router;
