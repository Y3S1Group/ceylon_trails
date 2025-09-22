import express from 'express';
import { createPost, deletePost, getAllPosts, getFeedPosts, getPost, updatePost, searchPosts } from '../controllers/postController.js';

const router = express.Router();

router.post("/add-post", createPost);
router.get("/feed", getFeedPosts);
router.get("/all", getAllPosts);

router.get("/search", searchPosts);

router.get("/:postId", getPost);
router.put("/:postId", updatePost);
router.delete("/:postId", deletePost);

export default router;

/* this should be added to user routes
router.get('/:userId/posts', getUserPosts) */