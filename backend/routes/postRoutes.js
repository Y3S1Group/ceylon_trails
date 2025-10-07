import express from 'express';
import { 
    createPost, 
    deletePost, 
    getAllPosts, 
    getFeedPosts, 
    getPost, 
    updatePost, 
    searchPosts, 
    toggleLike, 
    addComment, 
    addReply, 
    getPostComments,
    editComment,        // NEW
    deleteComment       // NEW
} from '../controllers/postController.js';
import userAuth from '../middleware/userauth.js';

const router = express.Router();

router.post("/add-post", createPost);
router.get("/feed", getFeedPosts);
router.get("/all", getAllPosts);

router.get("/search", searchPosts);

router.get("/:postId", getPost);
router.put("/:postId", updatePost);
router.delete("/:postId", deletePost);

router.put("/:postId/like", userAuth, toggleLike);

router.post("/:postId/comments", userAuth, addComment);
router.post("/:postId/comments/:commentId/reply", userAuth, addReply);
router.get("/:postId/comments", getPostComments);

// New
// Comment edit and delete routes
router.put("/:postId/comments/:commentId", userAuth, editComment);
router.delete("/:postId/comments/:commentId", userAuth, deleteComment);

export default router;

/* this should be added to user routes
router.get('/:userId/posts', getUserPosts) */