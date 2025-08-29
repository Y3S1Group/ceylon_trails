import { Award, Bookmark, Camera, Clock, Compass, Heart, MapPin, MessageCircle, Mountain, Share2, Star, ChevronLeft, ChevronRight, Plus, Map } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import ImageViewer from './ImageViewer';

const TrailPost = () => {
    const [liked, setLiked] = useState({});
    const [bookmarked, setBookmarked] = useState({});
    const [showComments, setShowComments] = useState({});
    const [comment, setComment] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [expandedCaptions, setExpandedCaptions] = useState({});
    const [isCaptionLong, setIsCaptionLong] = useState({});

    // State for backend posts functionality
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [ImageViewerOpen, setImageViewerOpen] = useState(false);
    const [currentImages, setCurrentImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const captionRefs = useRef({});

    // Load posts from backend
    useEffect(() => {
        const loadPosts = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5006/api/posts/feed');
                const data = await response.json();
                
                if (response.ok && data.success) {
                    setPosts(data.data);
                }
            } catch (error) {
                console.error('Error loading posts:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, []);

    // User display logic
    const getUserDisplayInfo = (userObj) => {
        if (userObj && typeof userObj === 'object' && userObj.name) {
            return {
                name: userObj.name,
                avatar: userObj.name.charAt(0).toUpperCase()
            };
        }
    
        return {
            name: 'Explorer',
            avatar: 'E'
        };
    };

    const openImageViewer = (postImages, index) => {
        setCurrentImages(postImages);
        setCurrentImageIndex(index);
        setImageViewerOpen(true);
    };

    const closeImageViewer = () => {
        setImageViewerOpen(false);
        setCurrentImages([]);
        setCurrentImageIndex(0);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
    };

    const toggleCaption = (postId) => {
        setExpandedCaptions(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const toggleLike = (postId) => {
        setLiked(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const toggleBookmark = (postId) => {
        setBookmarked(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const toggleComments = (postId) => {
        setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    useEffect(() => {
        const checkCaptionHeight = () => {
            const updatedIsCaptionLong = {};
            posts.forEach(post => {
                const element = captionRefs.current[post._id];
                if (element) {
                    const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
                    const maxHeight = lineHeight * 2;
                    updatedIsCaptionLong[post._id] = element.scrollHeight > maxHeight;
                }
            });
            setIsCaptionLong(updatedIsCaptionLong);
        };

        if (posts.length > 0) {
            checkCaptionHeight();
            window.addEventListener('resize', checkCaptionHeight);
            return () => window.removeEventListener('resize', checkCaptionHeight);
        }
    }, [posts]);

    return (
        <div className="max-w-5xl mx-auto px-6 py-20">
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {!loading && posts.length === 0 && (
                <div className="text-center py-20">
                    <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-600">Be the first to share your adventure!</p>
                </div>
            )}

            {!loading && posts.map((post) => {
                const userInfo = getUserDisplayInfo(post.userId);
                const postImages = post.imageUrls || [];
                
                return (
                    <div key={post._id} className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 hover:shadow-xl transition-all duration-300">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full flex items-center justify-center text-white font-semibold">
                                            {userInfo.avatar}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h3 className="font-semibold text-gray-900">{userInfo.name}</h3>
                                        </div>
                                        <p className="text-gray-500 text-sm flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {new Date(post.createdAt).toLocaleDateString()} • <MapPin className="w-4 h-4 ml-2 mr-1" /> {post.location}
                                        </p>
                                    </div>
                                </div>
                                <button className='ml-auto px-3 py-1 text-black rounded-xl hover:text-teal-500 '>
                                    <Map className='w-5 h-5'/>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="relative">
                                <p
                                    ref={(el) => (captionRefs.current[post._id] = el)}
                                    className={`text-gray-700 leading-relaxed ${
                                        expandedCaptions[post._id] ? '' : 'line-clamp-2'
                                    }`}
                                >
                                    {post.caption}
                                </p>
                                {isCaptionLong[post._id] && !expandedCaptions[post._id] && (
                                    <button
                                        onClick={() => toggleCaption(post._id)}
                                        className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                                    >
                                        See more...
                                    </button>
                                )}
                                {expandedCaptions[post._id] && (
                                    <button
                                        onClick={() => toggleCaption(post._id)}
                                        className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                                    >
                                        See less
                                    </button>
                                )}
                            </div>
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-0 mt-4">
                                    {post.tags.map((tag, index) => (
                                        <span key={index} className="bg-teal-100 px-2.5 py-0.5 rounded-full text-black/70 text-sm font-medium">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Post Images - Using TrailPost's original layout style */}
                        {postImages.length > 0 && (
                            <div className="grid gap-1 px-6">
                                {postImages.length >= 2 && (
                                    <div className="grid grid-cols-2 gap-1">
                                        {postImages.slice(0, 2).map((img, index) => (
                                            <img
                                                key={index}
                                                src={img}
                                                alt={`Image ${index + 1}`}
                                                className="w-full h-60 object-cover cursor-pointer rounded-lg hover:opacity-90 transition-opacity"
                                                onClick={() => openImageViewer(postImages, index)}
                                            />
                                        ))}
                                    </div>
                                )}
                                {postImages.length === 1 && (
                                    <div className="grid grid-cols-1 gap-1">
                                        <img
                                            src={postImages[0]}
                                            alt="Post image"
                                            className="w-full h-60 object-cover cursor-pointer rounded-lg hover:opacity-90 transition-opacity"
                                            onClick={() => openModal(postImages[0], postImages, 0)}
                                        />
                                    </div>
                                )}
                                {postImages.length > 2 && (
                                    <div className="grid grid-cols-3 gap-1">
                                        {postImages.slice(2, 5).map((img, index) => (
                                            <img
                                                key={index}
                                                src={img}
                                                alt={`Image ${index + 3}`}
                                                className="w-full h-60 object-cover cursor-pointer rounded-lg hover:opacity-90 transition-opacity"
                                                onClick={() => openModal(img, postImages, index + 2)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-6 border-t border-gray-100 mt-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                    <button
                                        onClick={() => toggleLike(post._id)}
                                        className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all ${
                                            liked[post._id]
                                                ? 'text-red-500 bg-red-50'
                                                : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                                        }`}
                                    >
                                        <Heart className={`w-5 h-5 ${liked[post._id] ? 'fill-current' : ''}`} />
                                        <span className="text-sm font-medium">
                                            {liked[post._id] ? 'Liked' : 'Like'} ({(post.likes?.length || 0) + (liked[post._id] ? 1 : 0)})
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => toggleComments(post._id)}
                                        className="flex items-center space-x-2 px-3 py-1 rounded-full text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        <span className="text-sm font-medium">Comment ({post.comments?.length || 0})</span>
                                    </button>
                                    <button
                                        onClick={() => toggleBookmark(post._id)}
                                        className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all ${
                                            bookmarked[post._id]
                                                ? 'text-yellow-500 bg-yellow-50'
                                                : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'
                                        }`}
                                    >
                                        <Bookmark className={`w-5 h-5 ${bookmarked[post._id] ? 'fill-current' : ''}`} />
                                        <span className="text-sm font-medium">Save</span>
                                    </button>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1 rounded-full">
                                        <Star className="w-4 h-4 fill-current text-amber-500" />
                                        <span className="font-semibold text-gray-900 text-sm">4.8</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        {showComments[post._id] && (
                            <div className="px-6 pb-6 border-t border-gray-100">
                                <div className="space-y-4 mt-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                            JS
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm"><span className="font-semibold">John Silva</span> Amazing photos! How long did the hike take?</p>
                                            <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 mt-4">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                        {userInfo.avatar}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="flex-1 px-4 py-2 bg-gray-50 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Modal for image viewing */}
            <ImageViewer
                isOpen={ImageViewerOpen}
                images={currentImages}
                currentIndex={currentImageIndex}
                onClose={closeImageViewer}
                onNext={nextImage}
                onPrev={prevImage}
            />
        </div>
    );
};

export default TrailPost;