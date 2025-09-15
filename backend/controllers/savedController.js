import mongoose from 'mongoose';
import SavedFolder from '../models/Saved.js';
import Posts from '../models/Posts.js';

// Create a new empty folder
export const createFolder = async (req, res) => {
    const { name, userId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Folder name is required' });
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Valid user ID is required' });
    }

    try {
        const newFolder = new SavedFolder({
            userId,
            name,
            posts: []
        });
        await newFolder.save();
        res.status(201).json({ success: true, message: 'Folder created', folder: newFolder });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Folder name already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Display all saved folders for the user
export const getUserFolders = async (req, res) => {
    const { userId } = req.query; // Use query param for userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Valid user ID is required' });
    }

    try {
        const folders = await SavedFolder.find({ userId })
            .select('name posts createdAt')
            .populate({
                path: 'posts',
                select: 'caption imageUrls userId',
                populate: { path: 'userId', select: 'username profilePic' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, folders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Delete a complete folder
export const deleteFolder = async (req, res) => {
    const { folderId } = req.params;
    const { userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
        return res.status(400).json({ success: false, message: 'Invalid folder ID' });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Valid user ID is required' });
    }

    try {
        const folder = await SavedFolder.findOneAndDelete({
            _id: folderId,
            userId
        });

        if (!folder) {
            return res.status(404).json({ success: false, message: 'Folder not found or not owned by user' });
        }

        res.status(200).json({ success: true, message: 'Folder deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Delete a post from a folder
export const deletePostFromFolder = async (req, res) => {
    const { folderId, postId } = req.params;
    const { userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(folderId) || !mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ success: false, message: 'Invalid folder or post ID' });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Valid user ID is required' });
    }

    try {
        const folder = await SavedFolder.findOne({
            _id: folderId,
            userId
        });

        if (!folder) {
            return res.status(404).json({ success: false, message: 'Folder not found or not owned by user' });
        }

        if (!folder.posts.includes(postId)) {
            return res.status(400).json({ success: false, message: 'Post not found in folder' });
        }

        await SavedFolder.updateOne(
            { _id: folderId, userId },
            { $pull: { posts: postId } }
        );

        res.status(200).json({ success: true, message: 'Post removed from folder' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Save a post to a folder (creates folder if it doesn't exist)
export const savePostToFolder = async (req, res) => {
    const { postId } = req.params;
    const { folderName, userId } = req.body;
    if (!folderName) return res.status(400).json({ success: false, message: 'Folder name is required' });
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Valid user ID is required' });
    }

    try {
        const post = await Posts.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        let folder = await SavedFolder.findOne({ userId, name: folderName });
        if (!folder) {
            folder = new SavedFolder({
                userId,
                name: folderName,
                posts: [postId]
            });
            await folder.save();
            return res.status(201).json({ success: true, message: 'Post saved to new folder', folder });
        }

        await SavedFolder.updateOne(
            { _id: folder._id, userId },
            { $addToSet: { posts: postId } }
        );
        folder = await SavedFolder.findById(folder._id);
        res.status(200).json({ success: true, message: 'Post saved to folder', folder });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Folder name already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};