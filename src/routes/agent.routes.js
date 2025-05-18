import express from 'express'
import {
  getAgent,
  getAgentDetails,
  getAgentProperties,
  registerAgent,
} from "../controller/agent.controller.js";
import { protectedRoute } from '../middleware/auth.middleware.js'


const router = express.Router()
router.post('/register', protectedRoute, registerAgent);
router.get('/details/:agentId', protectedRoute, getAgentDetails);
router.get('/property/:id', protectedRoute, getAgentProperties);
router.get('/:agentId', protectedRoute, getAgent);


export default router