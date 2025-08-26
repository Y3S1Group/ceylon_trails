import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export const uploadOptions = {
    resource_type: 'image',
    folder: 'trail_posts',
    tranformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
    ]
};

export const uploadToCloudinary = (buffer, originalname) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                ...uploadOptions,
                public_id: `post_${Date.now()}_${Math.round(Math.random() * 1E9)}`
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                }
            }
        ).end(buffer);
    });
};

export const uploadMultipleToCloudinary = async (files) => {
    const uploadPromises = files.map(file => 
        uploadToCloudinary(file.buffer, file.originalname)
    );
    return Promise.all(uploadPromises);
};

export const deleteFromCloudinary = (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

export const deleteMulitipleFromCloudinary = (publicIds) => {
    return new Promise((resolve, reject) => {
        cloudinary.api.delete_resources(publicIds, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

export const extractPublicId = (imageUrl) => {
    try {
        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicIdWithExtenstion = filename.split('.')[0];
        return `${uploadOptions.folder}/${publicIdWithExtenstion}`;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

export const validateCloudinaryConfig = () => {
    const { cloud_name, api_key, api_secret } = cloudinary.config();

    if (!cloud_name || !api_key || !api_secret) {
        throw new Error('Cloudinary configuration is incomplete. Please check you environment variables');
    }

    return true;
};

export default cloudinary;