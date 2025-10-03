import mongoose, { Schema } from "mongoose";

const postsSchema = new mongoose.Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    caption: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    imageUrls: {
        type: [String],
        required: true,
        validate: {
            validator: function(arr) {
                return arr.length >= 1 && arr.length <= 5;
            },
            message: 'Must have between 1 to 5 images'
        }
    },
    cloudinaryPublicIds: {
        type: [String],
        required: true
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: function(arr) {
                return arr.length <= 10;
            },
            message: 'Maximum 10 tags are allowed'
        }
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        parentId: { type: Schema.Types.ObjectId, default: null },
        replies: [{ type: Schema.Types.ObjectId }],
        createdAt: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

postsSchema.index({ coordinates: '2dsphere' });

export default mongoose.model('Posts', postsSchema);