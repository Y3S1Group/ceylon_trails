import Posts from '../models/Posts.js';
import userModel from '../models/userModel.js';
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
        const { page = 1, limit = 10, location, sort = 'recent', search } = req.query;

        const filter = {};
        
        // Handle search parameter (for location and tags)
        if (search) {
            const searchTerm = search.trim();
            
            // Check if it's a tag search (starts with #)
            if (searchTerm.startsWith('#')) {
                const tag = searchTerm.substring(1); // Remove the # symbol
                filter.tags = { $regex: tag, $options: 'i' };
            } else {
                // Search in both location and tags
                filter.$or = [
                    { location: { $regex: searchTerm, $options: 'i' } },
                    { tags: { $regex: searchTerm, $options: 'i' } }
                ];
            }
        }
        
        // Legacy location filter (keep for backward compatibility)
        if (location && !search) {
            filter.location = { $regex: location, $options: 'i' };
        }

        let sortOption = {};
        
        // Define sort options
        switch(sort) {
            case 'popular':
                // For popular, we need to use aggregation to sort by likes count
                const popularPosts = await Posts.aggregate([
                    { $match: filter },
                    {
                        $addFields: {
                            likesCount: { $size: { $ifNull: ['$likes', []] } }
                        }
                    },
                    {
                        $sort: { likesCount: -1, createdAt: -1 }
                    },
                    {
                        $skip: (page - 1) * limit
                    },
                    {
                        $limit: limit * 1
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'userId'
                        }
                    },
                    {
                        $unwind: {
                            path: '$userId',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            'userId.password': 0,
                            'userId.__v': 0
                        }
                    }
                ]);

                const total = await Posts.countDocuments(filter);

                return res.status(200).json({
                    success: true,
                    data: popularPosts,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(total / limit),
                        total
                    }
                });
                
            case 'recent':
            default:
                sortOption = { createdAt: -1 };
                break;
        }

        // For recent and rated, use normal query
        const posts = await Posts.find(filter)
            .populate('userId', 'name email')
            .populate('comments.userId', 'name email')
            .sort(sortOption)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Posts.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
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
            .sort({ 'likes': -1, createdAt: -1 })
            .limit(9);
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

    // If user gives tags, search inside tags array with case-insensitive regex
    if (tag) {
      const tags = Array.isArray(tag) ? tag : [tag];
      filter.tags = { 
        $in: tags.map(t => new RegExp(t, 'i'))
      };
    }

    console.log("Search filter:", JSON.stringify(filter, null, 2)); // Debug log

    const posts = await Posts.find(filter)
      .populate("userId", "name email")
      .populate("comments.userId", "name email")
      .sort({ createdAt: -1 });

    console.log("Posts found:", posts.length); // Debug log

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

// Toggle Like/Unlike
export const toggleLike = async (req, res) => {

    console.log("Toggle like called:", req.userId, req.params.postId);

  try {
    const { postId } = req.params;
    const userId = req.userId; // comes from userAuth middleware

    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already liked the post
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Remove like (unlike)
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Add like
      post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({
      message: isLiked ? "Like removed" : "Post liked",
      likesCount: post.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const userId = req.user?.id || req.body.userId;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        const post = await Posts.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const newComment = {
            userId, text: text.trim(), parentId: null, replies: [], createdAt: new Date() 
        };

        post.comments.push(newComment);
        await post.save();

        await post.populate('comments.userId', 'name email');
        const addedComment = post.comments[post.comments.length - 1];

        res.status(201).json({
            success: true,
            data: addedComment
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const addReply = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { text } = req.body;
        const userId = req.user?.id || req.body.userId;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Reply text is required'
            });
        }

        const post = await Posts.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const parentComment = post.comments.id(commentId);
        if (!parentComment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        const newReply = {
            userId,
            text: text.trim(),
            parentId: commentId,
            replies: [],
            createdAt: new Date()
        }

        post.comments.push(newReply);
        const replyId = post.comments[post.comments.length - 1]._id;

        parentComment.replies.push(replyId);

        await post.save();
        await post.populate('comments.userId', 'name email');

        const addedReply = post.comments.id(replyId);

        res.status(201).json({
            success: true,
            data: addedReply
        });

    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Posts.findById(postId)
            .populate('comments.userId', 'name email');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        res.status(200).json({
            success: true,
            data: post.comments
        });

    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export const getPlatformStats = async (req, res) => {
    try {
        // Total number of posts
        const totalPosts = await Posts.countDocuments();

        // Total number of users
        const totalUsers = await userModel.countDocuments();

        // Total number of unique locations
        const uniqueLocations = await Posts.distinct('location');
        const totalLocations = uniqueLocations.length;

        // Total photos uploaded (sum of all imageUrls)
        const postsWithImages = await Posts.find({}, 'imageUrls');
        const totalPhotos = postsWithImages.reduce((sum, post) => {
            return sum + (post.imageUrls ? post.imageUrls.length : 0);
        }, 0);

        res.status(200).json({
            success: true,
            data: {
                totalPosts,
                totalUsers,
                totalLocations,
                totalPhotos
            }
        });

    } catch (error) {
        console.error('Error fetching platform stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching stats',
          
export const editComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { text } = req.body;
        const userId = req.userId || req.body.userId;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        const post = await Posts.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        const commentUserId =
            typeof comment.userId === "object" ? comment.userId._id : comment.userId;

        if (commentUserId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own comments",
            });
        }
        
        // Update comment text
        comment.text = text.trim();
        comment.updatedAt = new Date();

        await post.save();
        await post.populate('comments.userId', 'name email');

        const updatedComment = post.comments.id(commentId);

        console.log("Editing comment:", { commentId, userId, commentUserId: comment.userId });

        res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: updatedComment
        });

    } catch (error) {
        console.error('Error editing comment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Delete Comment
export const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.userId || req.body.userId;

        const post = await Posts.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        const commentUserId =
            typeof comment.userId === "object" ? comment.userId._id : comment.userId;


        // Check if user owns this comment
        if (commentUserId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own comments",
            });
        }

        // If this is a parent comment with replies, delete all replies
        if (comment.replies && comment.replies.length > 0) {
            comment.replies.forEach((replyId) => {
                post.comments.pull(replyId);
            });
        }

        // If this is a reply, remove it from parent's replies array
        if (comment.parentId) {
            const parentComment = post.comments.id(comment.parentId);
            if (parentComment) {
                parentComment.replies = parentComment.replies.filter(
                    (id) => id.toString() !== commentId.toString()
                );
            }
        }

        // Remove the comment
        post.comments.pull(commentId);

        await post.save();

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};