import express from 'express';
import { createFolder, getUserFolders, deleteFolder, deletePostFromFolder, savePostToFolder } from '../controllers/savedController.js';

const router = express.Router();

// Routes for folder operations
router.post('/folders', createFolder); // Create a new folder
router.get('/folders', getUserFolders); // Get all folders for the user
router.delete('/folders/:folderId', deleteFolder); // Delete a folder
router.delete('/folders/:folderId/posts/:postId', deletePostFromFolder); // Remove a post from a folder
router.post('/folders/save/:postId', savePostToFolder); // Save a post to a folder

export default router;