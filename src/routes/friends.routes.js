import express from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { addFriend, getFriends } from '../controller/friends.controller.js';


const router = express.Router();



router.post('/add-friend', protectedRoute, addFriend)
router.get('/friends/:userId', protectedRoute, getFriends)

export default router;