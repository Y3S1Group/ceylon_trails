import { Award, Bookmark, Camera, Clock, Compass, Heart, MapPin, MessageCircle, Mountain, Share2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

const TrailPost = () => {
    const [liked, setLiked] = useState({});
    const [bookmarked, setBookmarked] = useState({});
    const [showComments, setShowComments] = useState({});
    const [comment, setComment] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentTrailImages, setCurrentTrailImages] = useState([]);
    const [expandedCaptions, setExpandedCaptions] = useState({});
    const [isCaptionLong, setIsCaptionLong] = useState({});

    const captionRefs = useRef({});

    const trailImages = {
        1: [
            "https://picsum.photos/id/237/400/300",
            "https://picsum.photos/id/238/400/300",
            "https://picsum.photos/id/239/400/300",
            "https://picsum.photos/id/240/400/300",
            "https://picsum.photos/id/241/400/300"
        ],
        2: [
            "https://picsum.photos/id/242/400/300",
            "https://picsum.photos/id/243/400/300",
            "https://picsum.photos/id/244/400/300",
            "https://picsum.photos/id/240/400/300",
            "https://picsum.photos/id/241/400/300"
        ]
    };

    const openModal = (img, trailId, index) => {
        setCurrentImage(img);
        setCurrentTrailImages(trailImages[trailId]);
        setCurrentImageIndex(index);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setCurrentImage(null);
        setCurrentTrailImages([]);
        setCurrentImageIndex(0);
    };

    const nextImage = () => {
        const nextIndex = (currentImageIndex + 1) % currentTrailImages.length;
        setCurrentImageIndex(nextIndex);
        setCurrentImage(currentTrailImages[nextIndex]);
    };

    const prevImage = () => {
        const prevIndex = (currentImageIndex - 1 + currentTrailImages.length) % currentTrailImages.length;
        setCurrentImageIndex(prevIndex);
        setCurrentImage(currentTrailImages[prevIndex]);
    };

    const toggleCaption = (trailId) => {
        setExpandedCaptions(prev => ({ ...prev, [trailId]: !prev[trailId] }));
    };

    const trails = [
        {
            id: 1,
            author: "Amara Perera",
            time: "4 days ago",
            avatar: "AP",
            verified: true,
            title: "Hidden gems of Ella! The view from Little Adam's Peak is absolutely breathtaking. The moderate hike rewards you with panoramic views and the iconic Nine Arch Bridge nearby makes this a perfect day adventure. The trail is well-marked and suitable for most fitness levels, though it can get quite busy during peak tourist season. Early morning visits are recommended for the best lighting and fewer crowds.",
            location: "Little Adam's Peak, Ella",
            likes: 127,
            comments: 23,
            shares: 8,
            rating: 4.8,
            tags: ["#hiking", "#ella", "#srilanka", "#nature", "#photography"]
        },
        {
            id: 2,
            author: "Rohan Silva",
            time: "1 week ago",
            avatar: "RS",
            verified: false,
            title: "Sunrise at Horton Plains was magical! The World's End cliff offers stunning views over the valley. Early morning start is worth it to avoid crowds and witness the incredible sunrise painting the landscape. The mist was incredible and created such a mystical atmosphere. Don't forget to bring warm clothes as it gets quite cold in the early hours!",
            location: "Horton Plains National Park",
            likes: 89,
            comments: 15,
            shares: 12,
            rating: 4.6,
            tags: ["#sunrise", "#hortonplains", "#worldsend", "#nationalpark"]
        }
    ];

    const toggleLike = (trailId) => {
        setLiked(prev => ({ ...prev, [trailId]: !prev[trailId] }));
    };

    const toggleBookmark = (trailId) => {
        setBookmarked(prev => ({ ...prev, [trailId]: !prev[trailId] }));
    };

    const toggleComments = (trailId) => {
        setShowComments(prev => ({ ...prev, [trailId]: !prev[trailId] }));
    };

    useEffect(() => {
        const checkCaptionHeight = () => {
            const updatedIsCaptionLong = {};
            trails.forEach(trail => {
                const element = captionRefs.current[trail.id];
                if (element) {
                    const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
                    const maxHeight = lineHeight * 2;
                    updatedIsCaptionLong[trail.id] = element.scrollHeight > maxHeight;
                }
            });
            setIsCaptionLong(updatedIsCaptionLong);
        };

        checkCaptionHeight();
        window.addEventListener('resize', checkCaptionHeight);
        return () => window.removeEventListener('resize', checkCaptionHeight);
    }, []);

    return (
        <div className="max-w-5xl mx-auto px-6 py-20">
            <style jsx>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>

            {trails.map((trail) => (
                <div key={trail.id} className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 hover:shadow-xl transition-all duration-300">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
                                        {trail.avatar}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-semibold text-gray-900">{trail.author}</h3>
                                        {trail.verified && <span className="text-blue-600 text-xs">Verified</span>}
                                    </div>
                                    <p className="text-gray-500 text-sm flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {trail.time} • <MapPin className="w-4 h-4 ml-2 mr-1" /> {trail.location}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="relative">
                            <p
                                ref={(el) => (captionRefs.current[trail.id] = el)}
                                className={`text-gray-700 leading-relaxed ${
                                    expandedCaptions[trail.id] ? '' : 'line-clamp-2'
                                }`}
                            >
                                {trail.title}
                            </p>
                            {isCaptionLong[trail.id] && !expandedCaptions[trail.id] && (
                                <button
                                    onClick={() => toggleCaption(trail.id)}
                                    className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                                >
                                    See more...
                                </button>
                            )}
                            {expandedCaptions[trail.id] && (
                                <button
                                    onClick={() => toggleCaption(trail.id)}
                                    className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                                >
                                    See less
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-0 mt-4">
                            {trail.tags.map((tag, index) => (
                                <span key={index} className="bg-teal-800/80 text-white px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-1 px-6">
                        <div className="grid grid-cols-2 gap-1">
                            {trailImages[trail.id].slice(0, 2).map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-80 object-cover cursor-pointer rounded-lg hover:opacity-90 transition-opacity"
                                    onClick={() => openModal(img, trail.id, index)}
                                />
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            {trailImages[trail.id].slice(2, 5).map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Image ${index + 3}`}
                                    className="w-full h-60 object-cover cursor-pointer rounded-lg hover:opacity-90 transition-opacity"
                                    onClick={() => openModal(img, trail.id, index + 2)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <button
                                    onClick={() => toggleLike(trail.id)}
                                    className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all ${
                                        liked[trail.id]
                                            ? 'text-red-500 bg-red-50'
                                            : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                                    }`}
                                >
                                    <Heart className={`w-5 h-5 ${liked[trail.id] ? 'fill-current' : ''}`} />
                                    <span className="text-sm font-medium">
                                        {liked[trail.id] ? 'Liked' : 'Like'} ({trail.likes + (liked[trail.id] ? 1 : 0)})
                                    </span>
                                </button>
                                <button
                                    onClick={() => toggleComments(trail.id)}
                                    className="flex items-center space-x-2 px-3 py-1 rounded-full text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Comment ({trail.comments})</span>
                                </button>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 bg-amber-50 px-3 py-1 rounded-full">
                                    <Star className="w-4 h-4 fill-current text-amber-500" />
                                    <span className="font-semibold text-gray-900 text-sm">{trail.rating}</span>
                                </div>
                                <button
                                    onClick={() => toggleBookmark(trail.id)}
                                    className={`p-2 rounded-full transition-all ${
                                        bookmarked[trail.id]
                                            ? 'text-teal-600'
                                            : 'text-gray-600 hover:text-teal-600'
                                    }`}
                                    title={bookmarked[trail.id] ? 'Remove bookmark' : 'Save post'}
                                >
                                    <Bookmark className={`w-5 h-5 ${bookmarked[trail.id] ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {showComments[trail.id] && (
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <div className="space-y-4 mb-4">
                                    <div className="flex space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
                                            SK
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-gray-50 rounded-lg px-4 py-3">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <p className="font-medium text-gray-900 text-sm">Sahan Kumara</p>
                                                    <span className="text-xs text-gray-500">2h</span>
                                                </div>
                                                <p className="text-gray-700 text-sm">Amazing views! How crowded was it during your visit?</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
                                        YU
                                    </div>
                                    <div className="flex-1 flex space-x-2">
                                        <input
                                            type="text"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Add a comment..."
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                        />
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {modalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
                    <div className="relative max-w-5xl w-full h-[90vh] flex items-center justify-center bg-white/20 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-200 hover:text-white transition-colors z-10"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 text-gray-200 hover:text-white transition-colors z-10"
                        >
                            <ChevronLeft className="w-12 h-12" />
                        </button>
                        <img
                            src={currentImage}
                            alt="Full-screen trail"
                            className="w-full h-full object-contain shadow-2xl pt-0.5 pb-0.5"
                        />
                        <button
                            onClick={nextImage}
                            className="absolute right-4 text-gray-200 hover:text-white transition-colors z-10"
                        >
                            <ChevronRight className="w-12 h-12" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrailPost;