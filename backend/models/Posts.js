import mongoose, { Schema } from "mongoose";

const postsSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    caption: { type: String, required: true },
    loaction: { type: String, required: true },
    imageUrls: [{
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return v.length >= 1 && v.length <= 5
            },
            message: 'Must have between 1 to 5 images'
        }
    }],
    tags: [{
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return v.length >= 1 && v.length <= 10
            },
            message: 'Maximum 10 tags are allowed'
        }
    }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        text: { type:String, required: true },
        date: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

export default mongoose.model('Posts', postsSchema);