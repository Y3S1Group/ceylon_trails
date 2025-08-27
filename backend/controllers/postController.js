import Posts from '../models/Posts.js';
import { 
    uploadMultipleToCloudinary, 
    deleteMultipleFromCloudinary,
    extractPublicId,
    validateCloudinaryConfig 
} from '../config/cloudinary.js';

// Validate Cloudinary config on startup
try {
    validateCloudinaryConfig();
    console.log('Cloudinary configuration validated successfully');
} catch (error) {
    console.error('Cloudinary configuration error:', error.message);
}

export const createPost = async (req, res) => {
    try {
        const { userId, caption, location, tags } = req.body;

        if (!userId || !caption || !location) {
            return res.status(400).json({
                success: false,
                message: 'User ID, caption, location are required'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one image is required'
            });
        }

        if (req.files.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 5 images are allowed per post'
            });
        }

        let processedTags = [];
        if (tags) {
            try {
                const tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
                processedTags = Array.isArray(tagsArray) ? 
                    [...new Set(tagsArray.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0))] : [];
            } catch (e) {
                processedTags = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
            }
        }

        if (processedTags && processedTags.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 tags are allowed per post'
            });
        }

        // Upload images to Cloudinary
        const uploadResults = await uploadMultipleToCloudinary(req.files);
        const imageUrls = uploadResults.map(result => result.url);
        const publicIds = uploadResults.map(result => result.publicId);

        const newPost = new Posts({
            userId, 
            caption, 
            location, 
            imageUrls, 
            cloudinaryPublicIds: publicIds,
            tags: processedTags
        });

        const savedPost = await newPost.save();
        const populatedPost = await Posts.findById(savedPost._id)
            .populate('userId', 'username email')
            .populate('comments.userId', 'username email');

        console.log('Post created successfully');

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: populatedPost
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { caption, location, userId, existingImages, tags } = req.body;

        const post = await Posts.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        if (userId && post.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own posts'
            });
        }

        if (!caption || !location) {
            return res.status(400).json({
                success: false,
                message: 'Caption and location are required'
            });
        }

        let finalImageUrls = [];
        let finalPublicIds = [];

        // Handle existing images
        if (existingImages) {
            try {
                const existingImagesArray = typeof existingImages === 'string' ?
                    JSON.parse(existingImages) : existingImages;
                finalImageUrls = Array.isArray(existingImagesArray) ? existingImagesArray : [];
                
                // Get corresponding public IDs for existing images
                if (post.cloudinaryPublicIds && post.imageUrls) {
                    finalPublicIds = finalImageUrls.map(url => {
                        const index = post.imageUrls.indexOf(url);
                        return index !== -1 ? post.cloudinaryPublicIds[index] : extractPublicId(url);
                    }).filter(id => id !== null);
                }
            } catch (e) {
                finalImageUrls = [];
                finalPublicIds = [];
            }
        }

        // Upload new images if any
        if (req.files && req.files.length > 0) {
            const uploadResults = await uploadMultipleToCloudinary(req.files);
            const newImageUrls = uploadResults.map(result => result.url);
            const newPublicIds = uploadResults.map(result => result.publicId);
            
            finalImageUrls = [...finalImageUrls, ...newImageUrls];
            finalPublicIds = [...finalPublicIds, ...newPublicIds];
        }

        if (finalImageUrls.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one image is required'
            });
        }

        if (finalImageUrls.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 5 images are allowed per post'
            });
        }

        let processedTags = [];
        if (tags) {
            try {
                const tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
                processedTags = Array.isArray(tagsArray) ? 
                    [...new Set(tagsArray.map(tag =>
                        tag.trim().toLowerCase()).filter(tag => tag.length > 0))] : [];
            } catch (e) {
                processedTags = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
            }
        }

        if (processedTags && processedTags.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 tags are allowed per post'
            });
        }

        // Delete removed images from Cloudinary
        if (post.cloudinaryPublicIds && post.cloudinaryPublicIds.length > 0) {
            const removedPublicIds = post.cloudinaryPublicIds.filter(
                id => !finalPublicIds.includes(id)
            );
            
            if (removedPublicIds.length > 0) {
                try {
                    await deleteMultipleFromCloudinary(removedPublicIds);
                } catch (deleteError) {
                    console.error('Error deleting images from Cloudinary:', deleteError);
                }
            }
        }

        const updateData = {
            caption,
            location,
            imageUrls: finalImageUrls,
            cloudinaryPublicIds: finalPublicIds,
            tags: processedTags,
            updatedAt: new Date()
        };

        const updatedPost = await Posts.findByIdAndUpdate(
            postId,
            updateData,
            { new: true, runValidators: true }
        ).populate('userId', 'username email');

        console.log('Post updated successfully');
        res.status(200).json({
            success: true,
            message: 'Post updated successfully',
            data: updatedPost
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body;

        const post = await Posts.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        if (userId && post.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own posts'
            });
        }

        // Delete images from Cloudinary
        if (post.cloudinaryPublicIds && post.cloudinaryPublicIds.length > 0) {
            try {
                await deleteMultipleFromCloudinary(post.cloudinaryPublicIds);
            } catch (deleteError) {
                console.error('Error deleting images from Cloudinary:', deleteError);
            }
        }

        await Posts.findByIdAndDelete(postId);

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, location } = req.query;

        const filter = {};
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        const posts = await Posts.find(filter)
            .populate('userId', 'username email')
            .populate('comments.userId', 'username email')
            .sort({ createdAt: -1})
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Posts.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                current: page,
                pages: Math.ceil(total/ limit),
                total
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getFeedPosts = async (req, res) => {
    try {
        const posts = await Posts.find({})
            .populate('userId', 'username email')
            .populate('comments.userId', 'username email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: posts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;

        const posts = await Posts.find({ userId }) 
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
        
        res.status(200).json({
            success: true,
            data: posts
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getPost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Posts.findById(postId)
            .populate('userId', 'username email')
            .populate('comments.userId', 'username email');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};