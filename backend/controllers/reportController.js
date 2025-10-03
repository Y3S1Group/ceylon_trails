import mongoose from 'mongoose';
import Report from '../models/Report.js';
import Posts from '../models/Posts.js';
import User from '../models/userModel.js';

export const createReport = async (req, res) => {
  const { postId, reason, description, userId } = req.body;

  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ success: false, message: 'Valid post ID is required' });
  }
  if (!reason) {
    return res.status(400).json({ success: false, message: 'Reason is required' });
  }
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: 'Valid user ID is required' });
  }

  try {
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const report = new Report({
      postId,
      postCreator: post.userId,
      reporter: userId,
      reason,
      description
    });

    await report.save();
    res.status(201).json({ success: true, message: 'Report submitted successfully', report });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reported this post' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getSingleReport = async (req, res) => {
  try {
    const { reportId } = req.params; // report ID from URL

    const report = await Report.findById(reportId)
      .populate({
        path: "postId",
        select: "caption imageUrls createdAt userId", // adjust fields
        populate: { path: "userId", select: "username email" } // populate original poster inside post
      })
      .populate("postCreator", "name email role createdAt lastLogin loginCount")
      .populate("reporter", "name email role createdAt lastLogin loginCount");

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getReports = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }

  try {
    const reports = await Report.find()
      .populate({
        path: 'postId',
        select: 'caption imageUrls userId',
        populate: { path: 'userId', select: 'username' }
      })
      .populate('postCreator', 'username')
      .populate('reporter', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateReportStatus = async (req, res) => {
    const { status} = req.body;
    const { reportId } = req.params; // report ID from URL


  if (!reportId || !mongoose.Types.ObjectId.isValid(reportId)) {
    return res.status(400).json({ success: false, message: 'Valid report ID is required' });
  }
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }
  if (!['Pending', 'Reviewed', 'Resolved'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const report = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({ success: true, message: 'Report status updated', report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteReportPost = async (req, res) => {
  try {
    const { reportPostId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(reportPostId)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    // Check if post exists
    const post = await Posts.findById(reportPostId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Delete only the post
    await post.deleteOne();

    res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};