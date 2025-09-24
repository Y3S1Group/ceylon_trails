import React, { useState, useEffect } from 'react';
import { Folder, Grid, FolderOpen, Image as ImageIcon, Trash2, Heart, MessageCircle, ChevronLeft, Camera, MapPin, Clock, HeartHandshake, Mountain, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ImageViewer from '../components/ImageViewer';
import FullPostView from '../components/FullPostView'; // Import FullPostView
import { useAuth } from '../hooks/useAuth';

const Saved = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('folders');
  const [imageViewer, setImageViewer] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // Add state for FullPostView
  const [selectedPost, setSelectedPost] = useState(null);
  const [isFullPostOpen, setIsFullPostOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      console.log('User ID:', user.id);
      fetchFolders();
    } else {
      setError('Please log in to view saved posts');
      setLoading(false);
    }
  }, [user]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:5006/api/saved/folders?userId=${user.id}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Fetch folders response:', data);
      if (response.ok && data.success) {
        setFolders(data.folders || []);
      } else {
        setError(data.message || 'Failed to load folders');
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      setError('Error fetching folders');
    } finally {
      setLoading(false);
    }
  };

  // Handle post click to open in full view
  const handlePostClick = (post) => {
    console.log('Post clicked:', post);
    
    // Ensure the post has all required fields for FullPostView
    const fullPost = {
      _id: post._id || `temp_${Date.now()}`,
      caption: post.caption || '',
      location: post.location || 'Unknown Location',
      imageUrls: post.imageUrls || [],
      userId: post.userId || { name: 'Explorer' },
      createdAt: post.createdAt || new Date().toISOString(),
      likes: post.likes || [],
      comments: post.comments || [],
      tags: post.tags || [],
      coordinates: post.coordinates || null
    };
    
    setSelectedPost(fullPost);
    setIsFullPostOpen(true);
  };

  const closeFullPost = () => {
    setIsFullPostOpen(false);
    setSelectedPost(null);
  };

  const deleteFolder = async (folderId) => {
    setShowDeleteConfirm({ type: 'folder', folderId });
  };

  const deletePostFromFolder = async (folderId, postId) => {
    setShowDeleteConfirm({ type: 'post', folderId, postId });
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      if (showDeleteConfirm.type === 'folder') {
        const { folderId } = showDeleteConfirm;
        const response = await fetch(`http://localhost:5006/api/saved/folders/${folderId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId: user.id })
        });
        const data = await response.json();
        console.log('Delete folder response:', data);
        if (response.ok && data.success) {
          setFolders(folders.filter(f => f._id !== folderId));
          if (selectedFolder && selectedFolder._id === folderId) {
            setSelectedFolder(null);
            setViewMode('folders');
          }
        } else {
          setError(data.message || 'Failed to delete folder');
        }
      } else if (showDeleteConfirm.type === 'post') {
        const { folderId, postId } = showDeleteConfirm;
        const response = await fetch(`http://localhost:5006/api/saved/folders/${folderId}/posts/${postId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId: user.id })
        });
        const data = await response.json();
        console.log('Delete post from folder response:', data);
        if (response.ok && data.success) {
          setFolders(prevFolders =>
            prevFolders.map(folder =>
              folder._id === folderId
                ? { ...folder, posts: folder.posts.filter(post => post._id !== postId) }
                : folder
            )
          );
          if (selectedFolder && selectedFolder._id === folderId) {
            setSelectedFolder(prev => ({
              ...prev,
              posts: prev.posts.filter(post => post._id !== postId)
            }));
          }
        } else {
          setError(data.message || 'Failed to remove post from folder');
        }
      }
    } catch (error) {
      console.error(`Error deleting ${showDeleteConfirm.type}:`, error);
      setError(`Error deleting ${showDeleteConfirm.type}`);
    } finally {
      setShowDeleteConfirm(null);
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

  if (loading || !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-24">
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Posts</h1>
            <p className="text-gray-600">Organize and access your saved adventure posts</p>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          {viewMode === 'folders' ? (
            <div>
              <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600">{folders.length}</div>
                      <div className="text-sm text-gray-600">Folders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600">
                        {folders.reduce((total, folder) => total + folder.posts.length, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Saved Posts</div>
                    </div>
                  </div>
                </div>
              </div>

              {folders.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved posts yet</h3>
                  <p className="text-gray-600">Start saving posts to organize your favorite adventures!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {folders.map((folder) => (
                    <div
                      key={folder._id}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedFolder(folder);
                        setViewMode('posts');
                      }}
                    >
                      <div className="relative h-32 bg-gray-100 overflow-hidden">
                        {folder.posts.length > 0 && folder.posts[0].imageUrls ? (
                          folder.posts.length === 1 ? (
                            <img
                              src={folder.posts[0].imageUrls[0]}
                              alt={folder.posts[0].caption}
                              className="object-cover h-full w-full"
                            />
                          ) : (
                            <div className="grid grid-cols-2 gap-0.5 h-full">
                              {folder.posts.slice(0, 4).map((post, index) => (
                                <div key={index} className={`
                                  ${folder.posts.length === 2 && index === 0 ? 'col-span-1' : ''}
                                  ${folder.posts.length === 2 && index === 1 ? 'col-span-1' : ''}
                                  ${folder.posts.length === 3 && index === 0 ? 'col-span-2' : ''}
                                  ${folder.posts.length >= 3 && index > 0 && index <= 2 ? 'col-span-1' : ''}
                                  overflow-hidden
                                `}>
                                  <img
                                    src={post.imageUrls?.[0]}
                                    alt={post.caption || ''}
                                    className="object-cover h-full w-full"
                                  />
                                </div>
                              ))}
                            </div>
                          )
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        
                        {folder.posts.length > 4 && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-sm font-medium">
                            +{folder.posts.length - 4}
                          </div>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFolder(folder._id);
                          }}
                          className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
                          <Folder className="w-5 h-5 text-teal-600 flex-shrink-0" />
                        </div>
                        <p className="text-sm text-gray-600">{folder.posts.length} posts</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created {new Date(folder.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => setViewMode('folders')}
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-semibold"
                >
                  <ChevronLeft />Back to Folders
                </button>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedFolder.name}</h2>
                    <p className="text-gray-600">{selectedFolder.posts.length} saved posts</p>
                  </div>
                </div>
              </div>

              {selectedFolder.posts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Grid className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts in this folder</h3>
                  <p className="text-gray-600">Start saving posts to this folder!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedFolder.posts.map((post) => {
                    const getUserDisplayInfo = (userObj) => {
                      if (userObj && typeof userObj === 'object' && (userObj.name || userObj.username)) {
                        const displayName = userObj.name || userObj.username;
                        return {
                          name: displayName,
                          avatar: displayName.charAt(0).toUpperCase()
                        };
                      }
                      return {
                        name: 'Explorer',
                        avatar: 'E'
                      };
                    };

                    const userInfo = getUserDisplayInfo(post.userId);
                    const postImages = post.imageUrls || [];
                    const previewImage = postImages.length > 0 ? postImages[0] : null;
                    
                    const truncateText = (text, maxLength = 100) => {
                      if (!text || text.length <= maxLength) return text;
                      return text.substring(0, maxLength) + '...';
                    };

                    return (
                      <div 
                        key={post._id} 
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        onClick={() => handlePostClick(post)}
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
                          
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Delete button clicked for post:', post._id); // Debug log
                              deletePostFromFolder(selectedFolder._id, post._id);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            className="absolute top-2 left-2 bg-black/60 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 transition-all duration-300 flex items-center justify-center">
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
                                <span className="truncate">{post.location || 'Unknown Location'}</span>
                              </div>
                            </div>
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
                              <div className="flex items-center space-x-1">
                                <HeartHandshake className="w-3 h-3" />
                                <span>{post.likes?.length || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>{post.comments?.length || 0}</span>
                              </div>
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
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delete {showDeleteConfirm.type === 'folder' ? 'Folder' : 'Post'}
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this {showDeleteConfirm.type === 'folder' ? 'folder and all its posts' : 'post'}? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FullPostView Modal */}
        <FullPostView
          post={selectedPost}
          isOpen={isFullPostOpen}
          onClose={closeFullPost}
        />

        <ImageViewer
          isOpen={imageViewer.isOpen}
          images={imageViewer.images}
          currentIndex={imageViewer.currentIndex}
          onClose={closeImageViewer}
          onNext={nextImage}
          onPrev={prevImage}
        />
      </div>
      <Footer />
    </>
  );
};

export default Saved;