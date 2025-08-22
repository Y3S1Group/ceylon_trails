import Posts from "../models/Posts";

export const createPost = async (req, res) => {
    try {
        const { userId, caption, location, imageUrls, tags } = req.body;

        if (!userId || !caption || !location || !imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            return res.status(400).json ({
                success: false,
                message: 'User ID, caption, location and at least one image are required'
            });
        }

        if (imageUrls.length > 5) {
            return res.status(400).json ({
                success: false,
                message: 'Maximum 5 images are allowed per post'
            });
        }

        if (tags && tags.length > 10) {
            return res.status(400).json ({
                success: false,
                message: 'Mamimum 10 tags are allowed per post'
            });
        }

        const processedTags = tags ? 
            [...new Set(tags.map(tag => 
                tag.trim().toLowerCase()).filter(tags => tags.length > 0)
            )] : [];

        const newPost = new Posts({
            userId, caption, location, imageUrls, tags: processedTags
        });

        const savedPost = await newPost.save();
        const populatedPost = await Posts.findById(savedPost._id)
            .populate('userId', 'username email')
            .populate('comments.userId', 'username email')
        
        console.log('Post created successfully');

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: populatedPost
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating post',
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
            return res.status(400).json({
                success: false,
                message: 'Post not found'
            });
        }

        return res.status(200).json({
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
            message: 'Error getting for user posts',
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
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page -1 ) * limit);

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
}


