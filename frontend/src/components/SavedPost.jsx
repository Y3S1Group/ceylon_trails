import React, { useState, useEffect } from 'react';
import { X, Folder, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SavedPost = ({ isOpen, onClose, postId }) => {
  const { isLoggedIn, user } = useAuth();
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && isLoggedIn && user?.id) {
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
        } catch (err) {
          console.error('Error fetching folders:', err);
          setError('Error fetching folders');
        } finally {
          setLoading(false);
        }
      };
      fetchFolders();
    } else if (isOpen && !isLoggedIn) {
      setError('Please log in to save posts');
    }
  }, [isOpen, isLoggedIn, user]);

  const handleSavePost = async () => {
    if (!selectedFolder) {
      setError('Please select a folder');
      return;
    }
    try {
      setLoading(true);
      setError('');
      // Find folder name from selectedFolder ID
      const folder = folders.find(f => f._id === selectedFolder);
      if (!folder) {
        setError('Selected folder not found');
        return;
      }
      const response = await fetch(`http://localhost:5006/api/saved/folders/save/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ folderName: folder.name, userId: user.id })
      });
      const data = await response.json();
      console.log('Save post response:', data); // Debug log
      if (response.ok && data.success) {
        onClose();
      } else {
        setError(data.message || 'Failed to save post');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      setError('Error saving post');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:5006/api/saved/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newFolderName, userId: user.id })
      });
      const data = await response.json();
      console.log('Create folder response:', data); // Debug log
      if (response.ok && data.success) {
        setFolders([...folders, data.folder]);
        setSelectedFolder(data.folder._id);
        setNewFolderName('');
      } else {
        setError(data.message || 'Failed to create folder');
      }
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Error creating folder');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-2xl flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Save Post</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {loading && (
          <div className="flex justify-center mb-4">
            <div className="w-6 h-6 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Folder</label>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={loading}
          >
            <option value="">Choose a folder</option>
            {folders.map((folder) => (
              <option key={folder._id} value={folder._id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">New Folder</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={loading}
            />
            <button
              onClick={handleCreateFolder}
              disabled={loading}
              className="flex items-center space-x-1 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSavePost}
            disabled={loading || !selectedFolder}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedPost;