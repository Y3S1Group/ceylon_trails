import React, { useState, useEffect } from 'react';
import { X, Image, MapPin, Clock, Hash, Send } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const CreatePost = ({ isOpen, onClose, onPostCreated }) => {
    const { currentUser, isAuthenticated } = useAuth();

    const [postData, setPostData] = useState({
        content: '',
        location: '',
        tags: '',
        visibility: 'Public'
    });

    const [uploadedImages, setUploadedImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = 5 - uploadedImages.length;
        const filesToProcess = files.slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImages(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    src: event.target.result,
                    name: file.name,
                    file: file
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (id) => {
        setUploadedImages(prev => prev.filter(img => img.id !== id));
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        
        try {
            // Validation
            if (!postData.content.trim()) {
                throw new Error('Post content is required');
            }
            if (!postData.location.trim()) {
                throw new Error('Location is required');
            }
            if (uploadedImages.length === 0) {
                throw new Error('At least one image is required');
            }
            if (uploadedImages.length > 5) {
                throw new Error('Maximum 5 images allowed');
            }

            const tags = postData.tags.trim() ? 
                postData.tags.split(/[,]+/)  
                    .map(tag => tag.trim().replace(/^#/, ''))
                    .filter(tag => tag.length > 0)
                    .slice(0, 10)
                : [];

            console.log('=== TAG DEBUG ===');
            console.log('Input string:', `"${postData.tags}"`);
            console.log('After trim:', `"${postData.tags.trim()}"`);
            console.log('Split result:', postData.tags.split(/[,\s]+/));
            console.log('Final tags array:', tags);
            console.log('Count:', tags.length);
            console.log('===============');

            if (tags.length > 10) {
                throw new Error('Maximum 10 tags allowed');
            }

            
            const formData = new FormData();
            formData.append('userId', currentUser?.id);
            formData.append('caption', postData.content.trim());
            formData.append('location', postData.location.trim());
            formData.append('tags', JSON.stringify(tags));

            // Add all images to FormData
            uploadedImages.forEach((img) => {
                formData.append('images', img.file);
            });

            // Single API call with everything
            const response = await fetch('/api/posts/add-post', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create post');
            }

            // Success - reset form
            setPostData({
                content: '',
                location: '',
                tags: '',
                visibility: 'Public'
            });
            setUploadedImages([]);
            
            if (onPostCreated) {
                onPostCreated(data.data);
            }
            
            onClose();

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Dynamic grid layout based on number of images
    const getGridLayout = (imageCount) => {
        if (imageCount === 1) return 'grid-cols-1';
        return 'grid-cols-2';
    };

    // Get image height based on count for better layout
    const getImageHeight = (imageCount) => {
        if (imageCount === 1) return 'h-64';
        if (imageCount === 2) return 'h-48';
        if (imageCount <= 4) return 'h-32';
        return 'h-28';
    };

    if (loading) {
        return (
            <div className='fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-50'>
                <div className='bg-gray-200 rounded-xl p-8'>
                    <div className='text-center'>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-gray-200 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-400">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-6 bg-teal-500 rounded-full"></div>
                        <h2 className="text-lg font-bold text-black">Create New Post</h2>
                        <span className="text-sm text-gray-600">as {currentUser.name}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-500 flex items-center justify-center text-gray-700 hover:text-white transition-all duration-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {error && (
                    <div className="mx-5 mt-5 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Content */}
                <div className="p-5">
                    {/* Main Content - Two Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                        {/* Left Column - Add Photos */}
                        <div className="space-y-5">
                            <div className="h-full flex flex-col">
                                <label className="block text-sm font-medium text-black mb-2">
                                    Add Photos ({uploadedImages.length}/5)
                                </label>

                                {/* Upload Area / Preview Container */}
                                <div className="relative flex-1 min-h-[200px]">
                                    {uploadedImages.length === 0 ? (
                                        // Upload area when no images
                                        <>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="border-2 border-dashed border-gray-500 rounded-xl p-6 text-center h-full hover:border-teal-500/50 hover:bg-gray-800/30 transition-all duration-200 cursor-pointer flex flex-col justify-center">
                                                <Image className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                                <p className="text-gray-500 mb-1 font-medium text-sm">
                                                    Click to upload images
                                                </p>
                                                <p className="text-xs text-gray-500">JPG, PNG or GIF (Max 5 images)</p>
                                            </div>
                                        </>
                                    ) : (
                                        // Image preview grid
                                        <div className="w-full">
                                            {/* Image Grid */}
                                            <div className={`grid ${getGridLayout(uploadedImages.length)} gap-2 mb-3`}>
                                                {uploadedImages.map((image, index) => (
                                                    <div key={image.id} className="relative group">
                                                        <img
                                                            src={image.src}
                                                            alt={image.name}
                                                            className={`w-full ${getImageHeight(uploadedImages.length)} object-cover rounded-lg border-2 border-gray-300`}
                                                        />
                                                        
                                                        {/* Delete button */}
                                                        <button
                                                            onClick={() => removeImage(image.id)}
                                                            className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 hover:bg-red-600 text-white font-medium rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-10"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>

                                                        {/* Image name overlay on hover */}
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
                                                            {image.name}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add more images button (if under 5) */}
                                            {uploadedImages.length < 5 && (
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="w-full py-3 border-2 border-dashed border-gray-400 rounded-lg text-gray-600 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                                                    >
                                                        <Image className="w-4 h-4" />
                                                        Add More Images ({5 - uploadedImages.length} remaining)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Text Content */}
                        <div className="space-y-5 flex flex-col h-full">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">What's on your mind?</label>
                                <textarea
                                    value={postData.content}
                                    onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                                    placeholder="Share your travel experience..."
                                    className="w-full h-32 p-3 bg-gray-200 border border-gray-500 rounded-xl text-black placeholder-gray-500 focus:border-teal-700 focus:ring-1 focus:ring-teal-400/40 focus:outline-none resize-none transition-all duration-200 text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Add Location
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={postData.location}
                                        onChange={(e) =>
                                            setPostData({ ...postData, location: e.target.value })
                                        }
                                        placeholder="Add a location..."
                                        className="w-full pl-9 pr-24 p-2.5 bg-gray-200 border border-gray-500 rounded-xl text-black placeholder-gray-500 focus:border-teal-700 focus:ring-1 focus:ring-teal-400/40 focus:outline-none transition-all duration-200 text-sm"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-500 rounded-lg text-white hover:text-gray-900 hover:bg-teal-500 transition-all duration-200 text-xs font-medium"
                                    >
                                        Pick on Map
                                    </button>
                                </div>
                            </div>

                            {/* Add Tags */}
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Add Tags</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={postData.tags}
                                        onChange={(e) => setPostData({ ...postData, tags: e.target.value })}
                                        placeholder="Add tags..."
                                        className="w-full pl-9 pr-24 p-2.5 bg-gray-200 border border-gray-500 rounded-xl text-black placeholder-gray-500 focus:border-teal-700 focus:ring-1 focus:ring-teal-400/40 focus:outline-none transition-all duration-200 text-sm"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                            </div>
                            <div className='flex-1'></div>
                            <div className='flex justify-end'>
                                <div className='relative group'>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !postData.content.trim() || !postData.location.trim() || uploadedImages.length === 0}
                                        className="group flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-teal-600/25 text-sm active:scale-95"
                                        >
                                           {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        Share Post
                                        <Send className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1 group-active:-rotate-45" />
                                    </>
                                )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;