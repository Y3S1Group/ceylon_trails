import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Heart, MessageCircle, Share2, Edit, Trash2, X, Save, Camera, ChevronLeft, ChevronRight, Grid, List, MoreHorizontal, Settings, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ImageViewer from '../components/ImageViewer';

const Profile = () => {
  const { currentUser, loading: authLoading, isAuthenticated } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);

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

  const fetchUserPosts = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5006/api/auth/user-posts/${userId}`);
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

  useEffect(() => {
    if (currentUser && currentUser._id) {
      fetchUserPosts(currentUser._id);
    }
  }, [currentUser]);

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

      const formData = new FormData();
      formData.append('userId', currentUser._id);
      formData.append('caption', editForm.caption.trim());
      formData.append('location', editForm.location.trim());
      formData.append('tags', JSON.stringify(filteredTags));
      formData.append('existingImages', JSON.stringify(editForm.existingImages));
      
      editForm.newImages.forEach((img) => {
        formData.append('images', img.file);
      });

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        body: formData
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
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser._id
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

  const openImageViewer = (images, index = 0) => {
    const imageUrls = images.map(img => typeof img === 'string' ? img : img.url);
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

  if (authLoading || loading || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 text-white">
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
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

  const userInfo = getUserDisplayInfo();

  return (
    <div className="min-h-screen bg-gray-50 text-white">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 bg-black relative overflow-hidden">
          <img
            src="https://media.cntravellerme.com/photos/6679185364c11ffe86eb6eeb/16:9/w_3984,h_2241,c_limit/1150415140"
            alt="Cover"
            className="w-full h-full object-cover opacity-35"
          />
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
                <p className="text-gray-300 mb-4 max-w-2xl">
                  {currentUser.bio || "Exploring the world, one trail at a time 🌍✨"}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-800 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {currentUser.location || "Earth"}
                  </div>
                  <div className="flex items-center">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {currentUser.website || "No website"}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Joined {currentUser.joinDate || "Recently"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8">
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
                  viewMode === 'grid' ? 'bg-teal-100 text-teal-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-teal-100 text-teal-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Posts Content */}
        {activeTab === 'posts' && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold">
                      {userInfo.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{userInfo.name}</h3>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{post.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(post)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(post._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Images */}
                {post.imageUrls && post.imageUrls.length > 0 && (
                  <div className="relative">
                    {post.imageUrls.length === 1 ? (
                      <img
                        src={post.imageUrls[0]}
                        alt="Post"
                        className="w-full h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => openImageViewer(post.imageUrls, 0)}
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-1">
                        {post.imageUrls.slice(0, 4).map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Post image ${index + 1}`}
                              className="w-full h-32 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={() => openImageViewer(post.imageUrls, index)}
                            />
                            {index === 3 && post.imageUrls.length > 4 && (
                              <div
                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold text-lg cursor-pointer"
                                onClick={() => openImageViewer(post.imageUrls, index)}
                              >
                                +{post.imageUrls.length - 4}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Post Content */}
                <div className="p-4">
                  {editingPost === post._id ? (
                    // Edit Form
                    <div className="space-y-4">
                      {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                        <textarea
                          value={editForm.caption}
                          onChange={(e) => setEditForm({...editForm, caption: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                          rows="3"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                        <input
                          type="text"
                          value={editForm.tags.join(', ')}
                          onChange={(e) => setEditForm({...editForm, tags: e.target.value.split(',').map(tag => tag.trim())})}
                          className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                          placeholder="tag1, tag2, tag3"
                        />
                      </div>

                      {/* Existing Images */}
                      {editForm.existingImages.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
                          <div className="grid grid-cols-3 gap-2">
                            {editForm.existingImages.map((image, index) => (
                              <div key={index} className="relative">
                                <img src={image} alt={`Current ${index}`} className="w-full h-20 object-cover rounded" />
                                <button
                                  type="button"
                                  onClick={() => removeExistingImage(image)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Images */}
                      {editForm.newImages.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Images</label>
                          <div className="grid grid-cols-3 gap-2">
                            {editForm.newImages.map((image) => (
                              <div key={image.id} className="relative">
                                <img src={image.src} alt={image.name} className="w-full h-20 object-cover rounded" />
                                <button
                                  type="button"
                                  onClick={() => removeNewImage(image.id)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add Images */}
                      {(editForm.existingImages.length + editForm.newImages.length) < 5 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Add Images</label>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleNewImageUpload}
                            className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {5 - (editForm.existingImages.length + editForm.newImages.length)} more images allowed
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setEditingPost(null)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditSave(post._id)}
                          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <p className="text-gray-800 mb-3">{post.caption}</p>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-gray-500 text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            <span>{post.likes?.length || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            <span>{post.comments?.length || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <Share2 className="w-4 h-4 mr-1" />
                            <span>Share</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {getAllImages().map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openImageViewer(getAllImages().map(img => img.url), index)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-white text-center">
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {image.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {image.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'posts' && posts.length === 0) || (activeTab === 'images' && getAllImages().length === 0)) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              {activeTab === 'posts' ? (
                <List className="w-8 h-8 text-gray-400" />
              ) : (
                <Grid className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} yet
            </h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'posts' 
                ? "You haven't created any posts yet. Start sharing your adventures!" 
                : "No images to display. Create some posts with photos first!"
              }
            </p>
          </div>
        )}
      </div>

      
      <ImageViewer
        isOpen={imageViewer.isOpen}
        images={imageViewer.images}
        currentIndex={imageViewer.currentIndex}
        onClose={closeImageViewer}
        onNext={nextImage}
        onPrev={prevImage}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Post</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;