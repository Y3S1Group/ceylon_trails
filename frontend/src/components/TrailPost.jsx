import { Award, Bookmark, Camera, Clock, Compass, HeartHandshake, MapPin, MessageCircle, Mountain, Share2, Star, ChevronLeft, ChevronRight, Plus, Map, Eye } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import FullPostView from './FullPostView';
import SavedPost from './SavedPost';
import { useAuth } from '../hooks/useAuth';

const TrailPost = ({ onMapClick }) => {
    const { isLoggedIn } = useAuth();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showFullPost, setShowFullPost] = useState(false);
    const [liked, setLiked] = useState({});
    const [bookmarked, setBookmarked] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);

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

    const openFullPost = (post) => {
        setSelectedPost(post);
        setShowFullPost(true);
    };

    const closeFullPost = () => {
        setShowFullPost(false);
        setSelectedPost(null);
    };

    const truncateText = (text, maxLength = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const toggleLike = (postId, e) => {
        e.stopPropagation();
        setLiked(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    const toggleBookmark = (postId, e) => {
        e.stopPropagation();
        if (isLoggedIn) {
            setSelectedPostId(postId);
            setModalOpen(true);
            setBookmarked(prev => ({ ...prev, [postId]: true }));
        } else {
            alert('Please log in to save posts');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-8 py-10 ">
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

            {!loading && posts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => {
                        const userInfo = getUserDisplayInfo(post.userId);
                        const postImages = post.imageUrls || [];
                        const previewImage = postImages.length > 0 ? postImages[0] : null;
                        
                        return (
                            <div 
                                key={post._id} 
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                                onClick={() => openFullPost(post)}
                            >
                                {/* Image Preview */}
                                <div className="relative">
                                    {previewImage ? (
                                        <div className="relative">
                                            <img
                                                src={previewImage}
                                                alt="Post preview"
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {postImages.length > 1 && (
                                                <div className="absolute top-2 right-2 bg-black/60 bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                                                    <Camera className="w-3 h-3" />
                                                    <span>{postImages.length}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-48 bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                                            <Mountain className="w-12 h-12 text-teal-600" />
                                        </div>
                                    )}
                                    
                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-2">
                                            <Eye className="w-5 h-5 text-gray-700" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    {/* User Info */}
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {userInfo.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{userInfo.name}</p>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                <span className="truncate">{post.location}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onMapClick) {
                                                    onMapClick(post);
                                                }
                                            }}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <Map className="w-4 h-4 text-gray-600 hover:text-teal-600" />
                                        </button>
                                    </div>

                                    {/* Caption */}
                                    <div className="mb-3">
                                        <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed">
                                            {truncateText(post.caption, 120)}
                                        </p>
                                    </div>

                                    {/* Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {post.tags.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="bg-teal-100 px-2 py-0.5 rounded-full text-black/70 text-xs font-medium">
                                                    #{tag}
                                                </span>
                                            ))}
                                            {post.tags.length > 3 && (
                                                <span className="text-xs text-gray-500 px-2 py-0.5">
                                                    +{post.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Stats and Actions */}
                                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={(e) => toggleLike(post._id, e)}
                                                className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all ${
                                                    liked[post._id]
                                                        ? 'text-red-500 bg-red-50'
                                                        : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                                                }`}
                                            >
                                                <HeartHandshake className={`w-3 h-3 ${liked[post._id] ? 'fill-current' : ''}`} />
                                                <span>{(post.likes?.length || 0) + (liked[post._id] ? 1 : 0)}</span>
                                            </button>
                                            <button
                                                onClick={(e) => toggleBookmark(post._id, e)}
                                                className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all ${
                                                    bookmarked[post._id]
                                                        ? 'text-yellow-500 bg-yellow-50'
                                                        : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'
                                                } ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                disabled={!isLoggedIn}
                                            >
                                                <Bookmark className={`w-3 h-3 ${bookmarked[post._id] ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Full Post Modal */}
            <FullPostView
                post={selectedPost}
                isOpen={showFullPost}
                onClose={closeFullPost}
                onMapClick={onMapClick}
            />

            {/* Save Post Modal */}
            <SavedPost
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                postId={selectedPostId}
            />
        </div>
    );
};

export default TrailPost;