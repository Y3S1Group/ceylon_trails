import React, { useState, useEffect } from 'react';
import { X, Image, MapPin, Clock, Hash, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LocationInput from './LocationInput';

const CreatePost = ({ isOpen, onClose, onPostCreated }) => {
    const { user, isLoggedIn } = useAuth();

    const [postData, setPostData] = useState({
        content: '',
        location: '',
        visibility: 'Public'
    });


    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCoordinates, setSelectedCoordinates] = useState(null);
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    if (!user || !isLoggedIn) {
        return null;
    }

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

    const handleTagInputChange = (e) => {
        const value = e.target.value;
        setTagInput(value);

        // Check if user pressed space or comma
        if (value.endsWith(' ') || value.endsWith(',')) {
            addTag();
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
            // Remove last tag if input is empty and user presses backspace
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const trimmedInput = tagInput.trim().replace(/[,\s]+$/, ''); // Remove trailing spaces and commas
        if (trimmedInput === '') {
            setTagInput('');
            return;
        }

        // Remove # if present and clean the tag
        const cleanTag = trimmedInput.replace(/^#+/, '').trim();
        
        if (cleanTag && cleanTag.length > 0 && tags.length < 10) {
            // Check if tag already exists (case insensitive)
            const tagExists = tags.some(tag => tag.toLowerCase() === cleanTag.toLowerCase());
            
            if (!tagExists) {
                setTags(prev => [...prev, cleanTag]);
            }
        }
        
        setTagInput('');
    };

    const removeTag = (indexToRemove) => {
        setTags(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        
        try {
            console.log('=== VALIDATION DEBUG ===');
            console.log('postData.location:', `"${postData.location}"`);
            console.log('selectedCoordinates:', selectedCoordinates);
            console.log('uploadedImages.length:', uploadedImages.length);
            console.log('=======================');

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

            if (!selectedCoordinates || !selectedCoordinates.lat || !selectedCoordinates.lon) {
                throw new Error('Please select a location from suggestions');
            }

            const tags = postData.tags.trim() ? 
                postData.tags.split(/[,]+/)  
                    .map(tag => tag.trim().replace(/^#/, ''))
                    .filter(tag => tag.length > 0)
                    .slice(0, 10)
                : [];

            if (tags.length > 10) {
                throw new Error('Maximum 10 tags allowed');
            }

            console.log('=== TAG DEBUG ===');
            console.log('Final tags array:', tags);
            console.log('Count:', tags.length);
            console.log('===============');
            
            const formData = new FormData();
            formData.append('userId', user?.id || user?._id);
            formData.append('caption', postData.content.trim());
            formData.append('location', postData.location.trim());
            formData.append('coordinates', JSON.stringify(selectedCoordinates));
            formData.append('tags', JSON.stringify(tags));

            // Add all images to FormData
            uploadedImages.forEach((img) => {
                formData.append('images', img.file);
            });

            // Single API call with everything
            const response = await fetch('http://localhost:5006/api/posts/add-post', {
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
                visibility: 'Public'
            });
            setTags([]);
            setTagInput('');
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

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-gray-200 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-400">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-6 bg-teal-500 rounded-full"></div>
                        <h2 className="text-lg font-bold text-black">Create New Post</h2>
                        <span className="text-sm text-gray-600">as {user?.name}</span>
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
                                    <LocationInput
                                        value={postData.location}
                                        onChange={({ location, coordinates }) => {
                                            console.log('LocationInput onChange:', { location, coordinates }); // Debug log
                                            setPostData((prev) => ({
                                                ...prev,
                                                location,
                                            }));
                                            setSelectedCoordinates(coordinates);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Add Tags */}
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Add Tags ({tags.length}/10)
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={handleTagInputChange}
                                        onKeyDown={handleTagKeyDown}
                                        placeholder="Type a tag and press space..."
                                        className="w-full pl-9 p-2.5 bg-gray-200 border border-gray-500 rounded-xl text-black placeholder-gray-500 focus:border-teal-700 focus:ring-1 focus:ring-teal-400/40 focus:outline-none transition-all duration-200 text-sm"
                                        disabled={tags.length >= 10}
                                    />
                                </div>
                                
                                {/* Tag Chips Display */}
                                {tags.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {tags.map((tag, index) => (
                                            <div
                                                key={index}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-100 text-teal-800 rounded-full text-xs font-medium border border-teal-200"
                                            >
                                                <span>#{tag}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(index)}
                                                    className="ml-1 w-3 h-3 rounded-full bg-teal-200 hover:bg-red-200 hover:text-red-600 flex items-center justify-center transition-all duration-150"
                                                >
                                                    <X className="w-2 h-2" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <p className="text-xs text-gray-500 mt-1">
                                    Type a tag and press space or enter to add it. Press backspace to remove the last tag.
                                </p>
                            </div>
                            
                            <div className='flex-1'></div>
                            <div className='flex justify-end'>
                                <div className='relative group'>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !postData.content.trim() || !postData.location.trim() || uploadedImages.length === 0}
                                        className="group flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-teal-600/25 text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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