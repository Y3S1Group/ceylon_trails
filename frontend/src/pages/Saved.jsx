import React, { useState, useEffect } from 'react';
import { Folder, Grid, FolderOpen, Image as ImageIcon, Trash2, Heart, MessageCircle, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ImageViewer from '../components/ImageViewer';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // { type: 'folder'/'post', folderId, postId }

  useEffect(() => {
    if (user?.id) {
      console.log('User ID:', user.id); // Debug log
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
      console.log('Fetch folders response:', data); // Debug log
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
        console.log('Delete folder response:', data); // Debug log
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
        console.log('Delete post from folder response:', data); // Debug log
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
                            // Single post - show one image
                            <img
                              src={folder.posts[0].imageUrls[0]}
                              alt={folder.posts[0].caption}
                              className="object-cover h-full w-full"
                            />
                          ) : (
                            // Multiple posts - show grid of up to 4 images
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
                  {selectedFolder.posts.map((post) => (
                    <div key={post._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                        <button
                          onClick={() => deletePostFromFolder(selectedFolder._id, post._id)}
                          className="absolute top-3 left-3 bg-black/70 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-900 text-sm mb-3 line-clamp-2">
                          {post.caption}
                        </p>
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
                        </div>
                        {post.userId && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-medium">
                                  {post.userId.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                @{post.userId.username || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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