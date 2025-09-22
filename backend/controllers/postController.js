import Posts from '../models/Posts.js';
import { 
    uploadMultipleToCloudinary, 
    deleteMultipleFromCloudinary,
    extractPublicId
} from '../config/cloudinary.js';

export const createPost = async (req, res) => {
    try {
        console.log('=== CREATE POST DEBUG ===');
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        console.log('========================');

        const { userId, caption, location, tags, coordinates } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        if (!caption || !caption.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Post caption is required'
            });
        }

        if (!location || !location.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Location is required'
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

        let parsedCoordinates = null;
        if (coordinates) {
        try {
            const coords = typeof coordinates === 'string'
                 ? JSON.parse(coordinates) : coordinates;

            if (coords.lat && coords.lon) {
                parsedCoordinates = { type: 'Point', coordinates: [coords.lon, coords.lat] };
            }
        } catch (e) {
            console.error('Error parsing coordinates:', e);
        }
        }

        if (!parsedCoordinates) {
            return res.status(400).json({
                success: false,
                message: 'Valid coordinates are required'
            });
        }

        let processedTags = [];
        if (tags) {
            try {
                const tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
                processedTags = Array.isArray(tagsArray) ? 
                    [...new Set(tagsArray.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0))] : [];
            } catch (e) {
                console.error('Error parsing tags:', e);
                processedTags = [];
            }
        }

        if (processedTags && processedTags.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 tags are allowed per post'
            });
        }

        console.log('Uploading images to Cloudinary...');
        const uploadResults = await uploadMultipleToCloudinary(req.files);
        console.log('Upload results:', uploadResults);
        const imageUrls = uploadResults.map(result => result.url);
        const publicIds = uploadResults.map(result => result.publicId);

        const newPost = new Posts({
            userId, 
            caption: caption.trim(), 
            location: location.trim(), 
            imageUrls, 
            cloudinaryPublicIds: publicIds,
            tags: processedTags,
            coordinates: parsedCoordinates
        });

        console.log('Saving post to database...');
        const savedPost = await newPost.save();
        console.log('Post saved:', savedPost._id);

        const populatedPost = await Posts.findById(savedPost._id)
            .populate('userId', 'username email')
            .populate('comments.userId', 'username email');

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: populatedPost
        });

    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating post',
            error: error.message
        });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { caption, location, userId, existingImages, tags, coordinates } = req.body;

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

        let parsedCoordinates = post.coordinates;
        if (coordinates) {
            try {
                const coords = typeof coordinates === 'string' 
                    ? JSON.parse(coordinates) : coordinates;
                    
                if (coords.lat && coords.lon) {
                    parsedCoordinates = { type: 'Point', coordinates: [coords.lon, coords.lat] };
                }
            } catch (e) {
                console.error('Error parsing coordinates in update:', e);
            }
        }

        if (location !== post.location && !parsedCoordinates) {
            return res.status(400).json({
                success: false,
                message: 'Valid coordinates are required when updating location'
            });
        }

        let finalImageUrls = [];
        let finalPublicIds = [];

        if (existingImages) {
            try {
                const existingImagesArray = typeof existingImages === 'string' ?
                    JSON.parse(existingImages) : existingImages;
                finalImageUrls = Array.isArray(existingImagesArray) ? existingImagesArray : [];
                
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
            coordinates: parsedCoordinates,
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
        console.log('Fetching feed posts...');
        
        const posts = await Posts.find({})
            .populate('userId', 'name email')
            .populate('comments.userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);
        console.log('Found posts:', posts.length);
        res.status(200).json({
            success: true,
            data: posts
        });
    } catch (error) {
        console.error('Feed posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching posts',
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

export const searchPosts = async (req, res) => {
  try {
    const { location, tag } = req.query;

    let filter = {};

    // If user gives a location, use case-insensitive regex
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // If user gives a tag, search inside tags array
    if (tag) {
      filter.tags = { $in: [tag.toLowerCase()] };
    }

    const posts = await Posts.find(filter)
      .populate("userId", "name email") // ✅ bring back name + email of post author
      .populate("comments.userId", "name email") // ✅ also bring back comment authors
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    console.error("Error searching posts:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to search posts", 
      error: err.message 
    });
  }
};
