import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Heart, MessageCircle, Plus, Edit, Trash2, X, Save, Camera, ChevronLeft, ChevronRight, Grid, List, MoreHorizontal, Settings, ExternalLink, Image, Hash, LogOut, User, UserX } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import ImageViewer from '../components/ImageViewer';
import LocationInput from '../components/LocationInput';
import UpdateProfile from '../components/UpdateProfile';
import CreatePost from '../components/CreatePost';

const Profile = () => {
  const { user: currentUser, authLoading, isLoggedIn, logout } = useAuth();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteProfileConfirm, setShowDeleteProfileConfirm] = useState(false);
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [editForm, setEditForm] = useState({
    caption: '',
    location: '',
    tags: [],
    existingImages: [],
    newImages: []
  });
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [imageViewer, setImageViewer] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0
  });
  const [activeTab, setActiveTab] = useState('posts');
  const [viewMode, setViewMode] = useState('grid');

  const kebabMenuRef = useRef(null);

  const fetchUserPosts = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5006/api/auth/${userId}/posts`);
      const result = await response.json();
      
      if (result.success) {
        setPosts(result.data);
      } else {
        console.error('Failed to fetch posts:', result.message);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev].slice(0, 5));
  };

  useEffect(() => {
    if (currentUser && (currentUser._id || currentUser.id)) {
      fetchUserPosts(currentUser._id || currentUser.id);
    }
  }, [currentUser]);

  // Close kebab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (kebabMenuRef.current && !kebabMenuRef.current.contains(event.target)) {
        setShowKebabMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from useAuth
      // Optionally, redirect or update state after logout
      window.location.href = '/'; // Redirect to explore page
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Failed to log out. Please try again.');
    }
  };

  const getUserDisplayInfo = () => {
    if (!currentUser) {
      return {
        name: 'Loading...',
        avatar: '?'
      };
    }
    
    return {
      name: currentUser.username || currentUser.name || 'User',
      avatar: (currentUser.username || currentUser.name || 'U').charAt(0).toUpperCase()
    };
  };

  const getAllImages = () => {
    const allImages = [];
    posts.forEach(post => {
      if (post.imageUrls) {
        post.imageUrls.forEach(url => {
          allImages.push({
            url,
            postId: post._id,
            caption: post.caption,
            location: post.location,
            likes: post.likes?.length || 0,
            comments: post.comments?.length || 0
          });
        });
      }
    });
    return allImages;
  };

  const handleEditClick = (post) => {
    setEditingPost(post._id);
    setEditForm({
      caption: post.caption,
      location: post.location,
      tags: post.tags || [],
      existingImages: post.imageUrls,
      newImages: []
    });

    if (post.coordinates && post.coordinates.coordinates) {
      setSelectedCoordinates({
        lat: post.coordinates.coordinates[1],
        lon: post.coordinates.coordinates[0]
      });
    } else {
      setSelectedCoordinates(null);
    }
    setError('');
  };

  const removeExistingImage = (imageUrl) => {
    setEditForm(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter(url => url !== imageUrl)
    }));
  };

  const handleNewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentTotalImages = editForm.existingImages.length + editForm.newImages.length;
    const remainingSlots = 5 - currentTotalImages;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditForm(prev => ({
          ...prev,
          newImages: [...prev.newImages, {
            id: Date.now() + Math.random(),
            src: event.target.result,
            name: file.name,
            file: file
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (id) => {
    setEditForm(prev => ({
      ...prev,
      newImages: prev.newImages.filter(img => img.id !== id)
    }));
  };

  const handleEditSave = async (postId) => {
    try {
      setError('');
      
      if (!editForm.caption.trim()) {
        setError('Caption is required');
        return;
      }
      if (!editForm.location.trim()) {
        setError('Location is required');
        return;
      }
      
      const totalImages = editForm.existingImages.length + editForm.newImages.length;
      if (totalImages === 0) {
        setError('At least one image is required');
        return;
      }
      if (totalImages > 5) {
        setError('Maximum 5 images allowed');
        return;
      }
      const filteredTags = editForm.tags.filter(tag => tag.length > 0);
      if (filteredTags.length > 10) {
        setError('Maximum 10 tags allowed');
        return;
      }

      if (!selectedCoordinates || !selectedCoordinates.lat || !selectedCoordinates.lon) {
        setError('Please select a location from suggestions');
        return;
      }

      const formData = new FormData();
      formData.append('userId', currentUser._id || currentUser.id);
      formData.append('caption', editForm.caption.trim());
      formData.append('location', editForm.location.trim());
      formData.append('tags', JSON.stringify(filteredTags));
      formData.append('existingImages', JSON.stringify(editForm.existingImages));

      if (selectedCoordinates) {
        formData.append('coordinates', JSON.stringify(selectedCoordinates));
      }
      
      editForm.newImages.forEach((img) => {
        formData.append('images', img.file);
      });

      const response = await fetch(`http://localhost:5006/api/posts/${postId}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setPosts(posts.map(post => 
          post._id === result.data._id ? result.data : post
        ));
        setEditingPost(null);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Error updating post');
    }
  };

  const handleDelete = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5006/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: currentUser._id || currentUser.id
        })
      });
      
      if (response.ok) {
        setPosts(posts.filter(post => post._id !== postId));
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5006/api/auth/delete-profile`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Profile deleted successfully!');
        window.location.href = '/'; // Redirect to homepage
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete profile');
      }
    } catch (err) {
      console.error('Error deleting profile:', err);
    }
  };

  const openImageViewer = (images, index = 0) => {
    const imageUrls = images.map(img => (typeof img === 'string' ? img : img.url));
    setImageViewer({
      isOpen: true,
      images: imageUrls,
      currentIndex: index
    });
  };

  const closeImageViewer = () => {
    setImageViewer({
      isOpen: false,
      images: [],
      currentIndex: 0
    });
  };

  const nextImage = () => {
    setImageViewer(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }));
  };

  const prevImage = () => {
    setImageViewer(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 text-white">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-4">Please log in to view your posts</h2>
            <p className="text-gray-600">You need to be logged in to manage your posts.</p>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 text-white">
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const userInfo = getUserDisplayInfo();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 text-white">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-48 md:h-100 bg-gradient-to-r from-teal-400 to-blue-500 relative overflow-hidden -mt-24">
            {currentUser.backgroundImage ? (
              <img
                src={currentUser.backgroundImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-teal-400 to-blue-500 opacity-35" />
            )}
            
            {/* Kebab Menu */}
            <div className="absolute top-44 right-10" ref={kebabMenuRef}>
              <button 
                onClick={() => setShowKebabMenu(!showKebabMenu)}
                className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-black/20 transition-colors duration-200 flex items-center justify-center"
              >
                <MoreHorizontal className="w-6 h-6" />
              </button>
              
              {/* Dropdown Menu */}
              {showKebabMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowEditProfile(true);
                      setShowKebabMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3 text-sm transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Edit Profile
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowDeleteProfileConfirm(true);
                      setShowKebabMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 text-sm transition-colors"
                  >
                    <UserX className="w-4 h-4" />
                    Delete Profile
                  </button>
                  
                  <div className="border-t border-gray-200 my-1"></div>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowKebabMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3 text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="relative -mt-16 md:-mt-20">
              <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar */}
                <div className="relative">
                  {currentUser.profileImage ? (
                    <img
                      src={currentUser.profileImage}
                      alt={userInfo.name}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gray-200 bg-gray-800 object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gray-200 bg-gray-800 flex items-center justify-center text-white font-bold text-2xl md:text-4xl">
                      {userInfo.avatar}
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center">
                    <span className="text-xs text-white">✓</span>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                        {userInfo.name}
                      </h1>
                      <p className="text-gray-200 mb-2">@{currentUser.username || userInfo.name.toLowerCase()}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-700 mb-4 max-w-2xl">
                    {currentUser.bio || "Exploring the world, one trail at a time 🌍✨"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8 mb-10">
          {/* Tabs and View Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'posts'
                    ? 'text-black border-teal-500'
                    : 'text-gray-400 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <List className="w-4 h-4" />
                  <span>Posts</span>
                  <span className="bg-teal-400 text-xs px-2 py-1 rounded-full">
                    {posts.length}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('images')}
                className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'images'
                    ? 'text-black border-teal-500'
                    : 'text-gray-400 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Grid className="w-4 h-4" />
                  <span>Images</span>
                  <span className="bg-teal-400 text-xs px-2 py-1 rounded-full">
                    {getAllImages().length}
                  </span>
                </div>
              </button>
            </div>

            {activeTab === 'posts' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-teal-100 text-teal-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-teal-100 text-teal-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Content based on active tab */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {activeTab === 'posts' && (
                <>
                  {posts.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                      <p className="text-gray-600 mb-6">Share your first adventure to get started!</p>
                    </div>
                  ) : (
                    <div className={`${
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-6'
                    }`}>
                      {posts.map((post) => (
                        <div key={post._id} className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                          {/* Post Image */}
                          <div className="relative">
                            <img
                              src={post.imageUrls[0]}
                              alt={post.caption}
                              className="w-full h-64 object-cover cursor-pointer"
                              onClick={() => openImageViewer(post.imageUrls, 0)}
                            />
                            {post.imageUrls.length > 1 && (
                              <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg text-sm">
                                +{post.imageUrls.length - 1}
                              </div>
                            )}
                            
                            {/* Edit/Delete Controls */}
                            <div className="absolute top-3 left-3 flex space-x-2">
                              <button
                                onClick={() => handleEditClick(post)}
                                className="bg-black/70 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(post._id)}
                                className="bg-black/70 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Post Content */}
                          <div className="p-4">
                            <p className="text-gray-900 text-sm mb-3 line-clamp-2">
                              {post.caption}
                            </p>
                            
                            <div className="flex items-center text-gray-500 text-sm mb-3">
                              <MapPin className="w-4 h-4 mr-1 text-teal-700" />
                              {post.location}
                            </div>

                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="bg-teal-100 px-2.5 py-1 rounded-full text-black/70 text-xs font-medium">
                                    #{tag}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="text-gray-400 text-xs px-2 py-1">
                                    +{post.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Post Stats */}
                            <div className="flex items-center justify-between text-gray-500">
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center">
                                  <Heart className="w-4 h-4 mr-1" />
                                  {post.likes?.length || 0}
                                </div>
                                <div className="flex items-center">
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  {post.comments?.length || 0}
                                </div>
                              </div>
                              <div className="flex items-center text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(post.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'images' && (
                <>
                  {getAllImages().length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Grid className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No images yet</h3>
                      <p className="text-gray-600">Your posted images will appear here</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {getAllImages().map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                          onClick={() => openImageViewer(getAllImages().map(img => img.url), index)}
                        >
                          <img
                            src={image.url}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Edit Post Modal */}
        {editingPost && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-gray-200 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-400">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-teal-500 rounded-full"></div>
                  <h2 className="text-lg font-bold text-black">Edit Post</h2>
                  <span className="text-sm text-gray-600">as {userInfo.name}</span>
                </div>
                <button
                  onClick={() => {
                    setEditingPost(null);
                    setSelectedCoordinates(null);
                  }}
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
                  {/* Left Column - Photo Management */}
                  <div className="space-y-5">
                    <div className="h-full flex flex-col">
                      <label className="block text-sm font-medium text-black mb-2">
                        Manage Photos ({editForm.existingImages.length + editForm.newImages.length}/5)
                      </label>

                      {/* Image Management Area */}
                      <div className="relative flex-1 min-h-[200px]">
                        {editForm.existingImages.length === 0 && editForm.newImages.length === 0 ? (
                          // Upload area when no images
                          <>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleNewImageUpload}
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
                            {/* Combined Image Grid */}
                            <div className={`grid ${
                              (editForm.existingImages.length + editForm.newImages.length) === 1 ? 'grid-cols-1' : 'grid-cols-2'
                            } gap-2 mb-3`}>
                              {/* Existing Images */}
                              {editForm.existingImages.map((imageUrl, index) => (
                                <div key={`existing-${index}`} className="relative group">
                                  <img
                                    src={imageUrl}
                                    alt={`Current ${index + 1}`}
                                    className={`w-full ${
                                      (editForm.existingImages.length + editForm.newImages.length) === 1 ? 'h-64' : 
                                      (editForm.existingImages.length + editForm.newImages.length) === 2 ? 'h-48' :
                                      (editForm.existingImages.length + editForm.newImages.length) <= 4 ? 'h-32' : 'h-28'
                                    } object-cover rounded-lg border-2 border-gray-300`}
                                  />
                                  <button
                                    onClick={() => removeExistingImage(imageUrl)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 hover:bg-red-600 text-white font-medium rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-10"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    Current Image
                                  </div>
                                </div>
                              ))}
                              
                              {/* New Images */}
                              {editForm.newImages.map((image) => (
                                <div key={image.id} className="relative group">
                                  <img
                                    src={image.src}
                                    alt={image.name}
                                    className={`w-full ${
                                      (editForm.existingImages.length + editForm.newImages.length) === 1 ? 'h-64' : 
                                      (editForm.existingImages.length + editForm.newImages.length) === 2 ? 'h-48' :
                                      (editForm.existingImages.length + editForm.newImages.length) <= 4 ? 'h-32' : 'h-28'
                                    } object-cover rounded-lg border-2 border-gray-300`}
                                  />
                                  <button
                                    onClick={() => removeNewImage(image.id)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 hover:bg-red-600 text-white font-medium rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-10"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
                                    {image.name}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Add more images button */}
                            {(editForm.existingImages.length + editForm.newImages.length) < 5 && (
                              <div className="relative">
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handleNewImageUpload}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <button
                                  type="button"
                                  className="w-full py-3 border-2 border-dashed border-gray-400 rounded-lg text-gray-600 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                                >
                                  <Image className="w-4 h-4" />
                                  Add More Images ({5 - editForm.existingImages.length - editForm.newImages.length} remaining)
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
                      <label className="block text-sm font-medium text-black mb-2">
                        What's on your mind?
                      </label>
                      <textarea
                        value={editForm.caption}
                        onChange={(e) => setEditForm(prev => ({ ...prev, caption: e.target.value }))}
                        placeholder="Share the story of your adventure..."
                        className="w-full h-32 p-3 bg-gray-200 border border-gray-500 rounded-xl text-black placeholder-gray-500 focus:border-teal-700 focus:ring-1 focus:ring-teal-400/40 focus:outline-none resize-none transition-all duration-200 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Edit Location
                      </label>
                      <div className="relative">
                        <LocationInput
                          value = {editForm.location}
                          onChange={({ location, coordinates }) => {
                            console.log('Edit LocationInput onChange:', { location, coordinates }); // Debug log
                            setEditForm((prev) => ({
                              ...prev,
                              location,
                            }));
                            setSelectedCoordinates(coordinates);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Edit Tags</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={editForm.tags.join(', ')}
                          onChange={(e) => setEditForm(prev => ({ 
                            ...prev, 
                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                          }))}
                          placeholder="Add tags..."
                          className="w-full pl-9 pr-24 p-2.5 bg-gray-200 border border-gray-500 rounded-xl text-black placeholder-gray-500 focus:border-teal-700 focus:ring-1 focus:ring-teal-400/40 focus:outline-none transition-all duration-200 text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Separate tags with commas, Maximum 10 tags Allowed</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-5 border-t border-gray-300">
                  <button
                    onClick={() => setEditingPost(null)}
                    className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditSave(editingPost)}
                    disabled={loading}
                    className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Update Post
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Post</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/*floating button for create a post*/}
        {!authLoading && isLoggedIn && (
          <button
            className="group fixed bottom-14 right-18 w-14 h-14 bg-teal-600/40 backdrop-blur-xs border border-teal-600 hover:border-teal-800 hover:bg-teal-600/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
            onClick={() => setShowCreatePost(true)}
            aria-label="Add new post"
          >
            <Plus className="w-6 h-6 text-teal-600 group-hover:text-white" />
          </button>
        )}

        {!authLoading && isLoggedIn && (
          <CreatePost
            isOpen={showCreatePost}
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
          />
        )}

        {/* Image Viewer Modal */}
        <ImageViewer
          isOpen={imageViewer.isOpen}
          images={imageViewer.images}
          currentIndex={imageViewer.currentIndex}
          onClose={closeImageViewer}
          onNext={nextImage}
          onPrev={prevImage}
        />
        {showEditProfile && (
          <UpdateProfile
            isOpen={showEditProfile}
            onClose={() => setShowEditProfile(false)}
            onProfileUpdated={() => window.location.reload()}
          />
        )}

        {showDeleteProfileConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Profile</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete your profile? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteProfileConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProfile}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
       
      <Footer/>
    </>
  );
};

export default Profile;