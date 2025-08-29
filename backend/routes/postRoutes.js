import express from 'express';
import { createPost, deletePost, getAllPosts, getFeedPosts, getPost, updatePost } from '../controllers/postController.js';

const router = express.Router();

router.post('/add-post', createPost);
router.get('/feed', getFeedPosts);
router.get('/:postId', getPost);
router.get('/all', getAllPosts);
router.put('/:postId', updatePost);
router.delete('/:postId', deletePost);

export default router;

/* this should be added to user routes
router.get('/:userId/posts', getUserPosts) */