import mongoose, { Schema } from "mongoose";

const savedSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Posts'
    }]
}, { timestamps: true });

savedSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('Saved', savedSchema);