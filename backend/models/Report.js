import mongoose, { Schema } from 'mongoose';

const reportSchema = new mongoose.Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Posts',
    required: true
  },
  postCreator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: ['Spam', 'Inappropriate', 'Harassment'],
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Resolved'],
    default: 'Pending'
  }
}, { timestamps: true });

reportSchema.index({ postId: 1, reporter: 1 }, { unique: true });

export default mongoose.model('Report', reportSchema);