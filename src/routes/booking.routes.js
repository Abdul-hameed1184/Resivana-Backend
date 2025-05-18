import express from 'express';
import { acceptBooking, declineBooking, deleteBooking, getBookings, scheduleVisit } from '../controller/booking.controller.js';
import { protectedRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/schedule', protectedRoute, scheduleVisit)

router.get('/agent/:id', protectedRoute, getBookings)
router.patch('/:id/approve', protectedRoute, acceptBooking)
router.patch('/:id/decline', protectedRoute, declineBooking)
router.delete('/:id', protectedRoute, deleteBooking)


export default router