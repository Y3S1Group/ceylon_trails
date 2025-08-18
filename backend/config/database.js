import mongoose, { mongo } from "mongoose";

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log("MongoDB connected successfully");
    })

    mongoose.connection.on('error', (err) => {
        console.log("MongoDB not connected!");
        console.error("MongoDB connection error:", err);
    });

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`);
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
    }
}

export default connectDB;