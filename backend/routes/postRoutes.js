import express from 'express';
import { createPost, deletePost, getAllPosts, getPost, updatePost } from '../controllers/postController';

const router = express.Router();

router.post('/add-post', createPost);
router.get('/:postId', getPost);
router.get('/feed', getAllPosts);
router.put('/:postId', updatePost);
router.delete('/:postId', deletePost);

export default router;

/* this should be added to user routes
router.get('/:userId/posts', getUserPosts) */