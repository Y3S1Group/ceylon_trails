import express from 'express';
import { blockUser, deactivateUser, getAllUsers } from '../controllers/admin-userController.js';

const router = express.Router();

router.get('/user-list',getAllUsers)
router.delete('/deactivtae-user/:id', deactivateUser)
router.put('/block-user/:id', blockUser)

export default router;

/* this should be added to user routes
router.get('/:userId/posts', getUserPosts) */