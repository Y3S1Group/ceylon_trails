import { Award, Bookmark, Camera, Clock, Compass, HeartHandshake, MapPin, MessageCircle, Mountain, Share2, Star, ChevronLeft, ChevronRight, Plus, Map, X, Flag, AlertTriangle } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import InteractiveMap from './InteractiveMap';
import ImageViewer from './ImageViewer';
import ReportModal from './ReportForm';
import SavedPost from './SavedPost';
import { useAuth } from '../hooks/useAuth';

const FullPostView = ({ post, isOpen, onClose }) => {
    const { isLoggedIn, user } = useAuth();

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post?.likes?.length || 0);

    const [bookmarked, setBookmarked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [expandedCaption, setExpandedCaption] = useState(false);
    const [isCaptionLong, setIsCaptionLong] = useState(false);
    const [ImageViewerOpen, setImageViewerOpen] = useState(false);
    const [currentImages, setCurrentImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportSubmitted, setReportSubmitted] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const captionRef = useRef(null);

    useEffect(() => {
        const checkCaptionHeight = () => {
            const element = captionRef.current;
            if (element) {
                const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
                const maxHeight = lineHeight * 2;
                setIsCaptionLong(element.scrollHeight > maxHeight);
            }
        };

        if (post && user) {
            // Normalize both to strings before comparing
            const userHasLiked = post.likes?.some(
            likeUserId => String(likeUserId) === String(user.id)
            );

            setLiked(userHasLiked);
            setLikeCount(post.likes?.length || 0);
        }

        if (post && isOpen) {
            checkCaptionHeight();
            window.addEventListener('resize', checkCaptionHeight);
            return () => window.removeEventListener('resize', checkCaptionHeight);
        }
    }, [post, isOpen, user]);

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !post) return null;

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

    const toggleCaption = () => {
        setExpandedCaption(prev => !prev);
    };

const toggleLike = async () => {
        if (!isLoggedIn) {
            alert('Please log in to like posts');
            return;
        }

        // Optimistic UI update
        const previousLikedState = liked;
        const previousCount = likeCount;
        
        setLiked(prev => !prev);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);

        try {
            const response = await axios.put(
                `http://localhost:5006/api/posts/${post._id}/like`,
                {},
                { withCredentials: true } // Important: sends cookie with request
            );

            if (response.data) {
                // Update with actual server data
                setLikeCount(response.data.likesCount);
                setLiked(response.data.isLiked);
            }
            
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert optimistic update on error
            setLiked(previousLikedState);
            setLikeCount(previousCount);
            alert('Failed to update like. Please try again.');
        }
    };

    const toggleBookmark = () => {
        if (isLoggedIn) {
            setModalOpen(true);
            setBookmarked(true);
        } else {
            alert('Please log in to save posts');
        }
    };

    const toggleComments = () => {
        setShowComments(prev => !prev);
    };

    const toggleReportModal = () => {
        setShowReportModal(prev => !prev);
        if (!showReportModal) {
            // Reset form when opening
            setReportReason('');
            setReportDescription('');
            setReportSubmitted(false);
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportReason) return;

        try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: post._id,
                    reason: reportReason,
                    description: reportDescription,
                }),
            });

            if (response.ok) {
                setReportSubmitted(true);
                setTimeout(() => {
                    setShowReportModal(false);
                }, 2000);
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit report. Please try again.');
        }
    };

    const userInfo = getUserDisplayInfo(post.userId);
    const postImages = post.imageUrls || [];

    const handleMapClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Map button clicked');
        setShowMapModal(true);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl max-h-[90vh] w-full overflow-y-auto">
                {/* Header with close button */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-20">
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
                        <div className="flex items-center space-x-2">
                        <button
                            onClick={handleMapClick}
                            className='px-3 py-1 text-black rounded-xl hover:text-teal-500 hover:bg-teal-50 transition-colors'
                            title="View location on map"
                        >
                            <Map className='w-5 h-5'/>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="relative">
                        <p
                            ref={captionRef}
                            className={`text-gray-700 leading-relaxed ${
                                expandedCaption ? '' : 'line-clamp-2'
                            }`}
                        >
                            {post.caption}
                        </p>
                        {isCaptionLong && !expandedCaption && (
                            <button
                                onClick={toggleCaption}
                                className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                            >
                                See more...
                            </button>
                        )}
                        {expandedCaption && (
                            <button
                                onClick={toggleCaption}
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

                {/* Images */}
                {postImages.length > 0 && (
                    <div className="px-6">
                        {postImages.length === 1 && (
                            <div className="mb-3">
                                <img
                                    src={postImages[0]}
                                    alt="Post image"
                                    className="w-full max-h-100 object-cover cursor-pointer rounded-lg hover:opacity-90 transition-opacity"
                                    onClick={() => openImageViewer(postImages, 0)}
                                />
                            </div>
                        )}

                        {postImages.length === 2 && (
                            <div className="grid grid-cols-2 gap-1 mb-3">
                                {postImages.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-80 object-cover cursor-pointer rounded-lg hover:opacity-90 transition-opacity"
                                        onClick={() => openImageViewer(postImages, index)}
                                    />
                                ))}
                            </div>
                        )}

                        {postImages.length === 3 && (
                            <div className="space-y-1 mb-3">
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
                                <div>
                                    <img
                                        src={postImages[2]}
                                        alt="Image 3"
                                        className="w-full h-60 object-cover cursor-pointer rounded-lg hover:opacity-90 transition-opacity"
                                        onClick={() => openImageViewer(postImages, 2)}
                                    />
                                </div>
                            </div>
                        )}

                        {postImages.length === 4 && (
                            <div className="space-y-1 mb-3">
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
                                <div className="grid grid-cols-2 gap-1">
                                    {postImages.slice(2, 4).map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`Image ${index + 3}`}
                                            className="w-full h-60 object-cover cursor-pointer rounded-lg hover:opacity-90 transition-opacity"
                                            onClick={() => openImageViewer(postImages, index + 2)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {postImages.length === 5 && (
                            <div className="space-y-1 mb-3">
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
                                <div className="grid grid-cols-3 gap-1">
                                    {postImages.slice(2, 5).map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`Image ${index + 3}`}
                                            className="w-full h-60 object-cover cursor-pointer rounded-lg hover:opacity-90 transition-opacity"
                                            onClick={() => openImageViewer(postImages, index + 2)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 border-t border-gray-100 mt-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            {user ? (
                            // Logged-in user: clickable button
                            <button
                                onClick={toggleLike}
                                className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all ${
                                liked
                                    ? 'text-red-500 bg-red-50'
                                    : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                                }`}
                            >
                                <HeartHandshake className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                                <span className="text-sm font-medium">
                                {liked ? 'Finds Helpful' : 'Helpful'} ({likeCount})
                                </span>
                            </button>
                            ) : (
                            // Logged-out user: just show like count in gray
                            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-gray-600">
                                <HeartHandshake className="w-5 h-5" />
                                <span className="text-sm font-medium">Helpful ({post.likes ? post.likes.length : 0})</span>
                            </div>
                            )}

                            <button
                                onClick={toggleComments}
                                className="flex items-center space-x-2 px-3 py-1 rounded-full text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Comment ({post.comments?.length || 0})</span>
                            </button>
                            <button
                                onClick={toggleBookmark}
                                className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all ${
                                    bookmarked
                                        ? 'text-yellow-500 bg-yellow-50'
                                        : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'
                                } ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!isLoggedIn}
                            >
                                <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
                                <span className="text-sm font-medium">Save</span>
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={toggleReportModal}
                                className="flex items-center space-x-2 px-3 py-1 rounded-full text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                                <Flag className="w-4 h-4" />
                                <span className="text-sm font-medium">Report</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Comments */}
                {showComments && (
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

                <InteractiveMap
                    isOpen={showMapModal}
                    onClose={() => setShowMapModal(false)}
                    post={post}
                    userLocation={userLocation}
                    setUserLocation={setUserLocation}
                />

                <ReportModal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    postId={post._id}
                />

                {/* Modals */}
                <ImageViewer
                    isOpen={ImageViewerOpen}
                    images={currentImages}
                    currentIndex={currentImageIndex}
                    onClose={closeImageViewer}
                    onNext={nextImage}
                    onPrev={prevImage}
                />

                <SavedPost
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    postId={post._id}
                />
            </div>
        </div>
    );
};

export default FullPostView;