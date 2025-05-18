import express from 'express'
import {  transferToAgent, verifyPayment } from '../controller/payment.controller.js'
import { protectedRoute } from '../middleware/auth.middleware.js';

const router = express.Router()

router.get("/verify/:reference", protectedRoute, verifyPayment);
router.post("/transfer", protectedRoute, transferToAgent);

export default router