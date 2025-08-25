import React, { useState, useRef, useEffect } from 'react'
import {
  MapPinIcon,
  ImageIcon,
  XIcon,
  TagIcon,
  CalendarIcon,
  ClockIcon,
  ChevronDownIcon,
  SearchIcon,
  UsersIcon,
  HomeIcon,
  PlusIcon,
  UserIcon,
  EditIcon,
  TrashIcon,
  SaveIcon,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })
  return position ? <Marker position={position} /> : null
}

const CeylonTrailsPosts = () => {
  // Main state
  const [currentView, setCurrentView] = useState('feed') // 'feed', 'add', 'myPosts'
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // Edit/Delete states
  const [editingPostId, setEditingPostId] = useState(null)
  const [editForm, setEditForm] = useState({
    caption: '',
    location: '',
    imageUrl: '',
    tags: ''
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePostId, setDeletePostId] = useState(null)

  // User state
  const [currentUser, setCurrentUser] = useState({
    id: '68a4bab4625f34d7ff963fff',
    name: 'Loading...'
  })

  // Create post form state (original form)
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [locationCoords, setLocationCoords] = useState([7.8731, 80.7718])
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [images, setImages] = useState([])
  const [tags, setTags] = useState([])
  const [currentTag, setCurrentTag] = useState('')
  const [privacy, setPrivacy] = useState('public')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  // Simple create post state
  const [newPost, setNewPost] = useState({
    caption: '',
    location: '',
    imageUrl: '',
    tags: ''
  })

  // API Functions
  const fetchUser = async (userId) => {
    try {
      const response = await fetch(`/api/user/${userId}`)
      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  const fetchAllPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/posts/feed')
      const result = await response.json()
      if (result.success) {
        setPosts(result.data)
        setFilteredPosts(result.data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPosts = async (userId) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/posts/user-posts/${userId}`)
      const result = await response.json()
      if (result.success) {
        setPosts(result.data)
        setFilteredPosts(result.data)
      }
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPost = async () => {
    try {
      if (!newPost.caption || !newPost.location || !newPost.imageUrl) {
        alert('Please fill in all required fields')
        return
      }

      const postData = {
        ...newPost,
        userId: currentUser.id,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      const response = await fetch('/api/posts/add-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })

      const result = await response.json()
      
      if (result.success) {
        setNewPost({ caption: '', location: '', imageUrl: '', tags: '' })
        setShowAddForm(false)
        fetchAllPosts()
      } else {
        alert(result.message || 'Error creating post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Error creating post')
    }
  }

  const updatePost = async (postId, postData) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })
      return response.json()
    } catch (error) {
      console.error('Error updating post:', error)
      throw error
    }
  }

  const deletePostAPI = async (postId) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
      return response.json()
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  // Event Handlers
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) =>
        URL.createObjectURL(file),
      )
      setImages([...images, ...newImages])
    }
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag])
      setCurrentTag('')
    }
  }

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleAdvancedSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate post submission delay
    setTimeout(() => {
      console.log({
        caption,
        location,
        locationCoords,
        images,
        tags,
        privacy,
      })
      // Reset form
      setCaption('')
      setLocation('')
      setLocationCoords([7.8731, 80.7718])
      setImages([])
      setTags([])
      setPrivacy('public')
      setIsSubmitting(false)
      alert('Post created successfully!')
      setCurrentView('feed')
    }, 1500)
  }

  // Edit handlers
  const handleEditStart = (post) => {
    setEditingPostId(post._id)
    setEditForm({
      caption: post.caption,
      location: post.location,
      imageUrl: post.imageUrl
    })
  }

  const handleEditSave = async (postId) => {
    try {
      const postData = {
        ...editForm
      }
      
      const result = await updatePost(postId, postData)
      
      if (result.success) {
        setPosts(posts.map(p => 
          p._id === postId ? { ...result.data, userId: p.userId } : p
        ))
        setFilteredPosts(filteredPosts.map(p => 
          p._id === postId ? { ...result.data, userId: p.userId } : p
        ))
        setEditingPostId(null)
      } else {
        alert(result.message || 'Error updating post')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Error updating post')
    }
  }

  const handleEditCancel = () => {
    setEditingPostId(null)
    setEditForm({ caption: '', location: '', imageUrl: '' })
  }

  // Delete handlers
  const handleDeleteConfirm = (postId) => {
    setDeletePostId(postId)
    setShowDeleteModal(true)
  }

  const handleDeleteExecute = async () => {
    try {
      const result = await deletePostAPI(deletePostId)
      
      if (result.success) {
        setPosts(posts.filter(p => p._id !== deletePostId))
        setFilteredPosts(filteredPosts.filter(p => p._id !== deletePostId))
      } else {
        alert(result.message || 'Error deleting post')
      }
      
      setShowDeleteModal(false)
      setDeletePostId(null)
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post')
      setShowDeleteModal(false)
      setDeletePostId(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Effects
  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUser('68a4bab4625f34d7ff963fff')
      if (userData) {
        setCurrentUser({
          id: userData._id,
          name: userData.username
        })
      }
    }
    
    loadUser()
  }, [])

  useEffect(() => {
    let filtered = posts

    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    if (locationFilter) {
      filtered = filtered.filter(post => 
        post.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    setFilteredPosts(filtered)
  }, [posts, searchTerm, locationFilter])

  useEffect(() => {
    if (currentView === 'feed') {
      fetchAllPosts()
    } else if (currentView === 'myPosts') {
      fetchUserPosts(currentUser.id)
    }
  }, [currentView, currentUser.id])

  // Navigation Component
  const Navigation = () => (
    <nav className="fixed top-0 left-0 right-0 bg-[#1a1a1a]/90 backdrop-blur-lg border-b border-white/10 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            TravelShare
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('feed')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentView === 'feed' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <HomeIcon className="h-5 w-5" />
              <span>Feed</span>
            </button>
            <button
              onClick={() => setCurrentView('add')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentView === 'add' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create</span>
            </button>
            <button
              onClick={() => setCurrentView('myPosts')}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                currentView === 'myPosts' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserIcon className="h-5 w-5" />
              <span>My Posts</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )

  // Feed View Component
  const FeedView = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-[#1a1a1a]/70 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>
      </div>

      {/* Quick Add Post */}
      <div className="bg-[#1a1a1a]/70 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full text-left text-gray-400 hover:text-white transition-colors"
        >
          What's on your mind, {currentUser.name}?
        </button>
        
        {showAddForm && (
          <div className="mt-4 space-y-4">
            <textarea
              value={newPost.caption}
              onChange={(e) => setNewPost({...newPost, caption: e.target.value})}
              placeholder="Share your travel experience..."
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[100px]"
            />
            <input
              type="text"
              value={newPost.location}
              onChange={(e) => setNewPost({...newPost, location: e.target.value})}
              placeholder="Location..."
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <input
              type="url"
              value={newPost.imageUrl}
              onChange={(e) => setNewPost({...newPost, imageUrl: e.target.value})}
              placeholder="Image URL..."
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <input
              type="text"
              value={newPost.tags}
              onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
              placeholder="Tags (comma separated)..."
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createPost}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map(post => (
            <div key={post._id} className="bg-[#1a1a1a]/70 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {post.userId?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-white font-medium">{post.userId?.username || 'Unknown User'}</p>
                      <p className="text-gray-400 text-sm">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  {post.userId?._id === currentUser.id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditStart(post)}
                        className="p-2 text-gray-400 hover:text-emerald-400 transition-colors"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(post._id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {editingPostId === post._id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editForm.caption}
                      onChange={(e) => setEditForm({...editForm, caption: e.target.value})}
                      className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[100px]"
                    />
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <input
                      type="url"
                      value={editForm.imageUrl}
                      onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})}
                      className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleEditCancel}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSave(post._id)}
                        className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
                      >
                        <SaveIcon className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-white mb-4">{post.caption}</p>
                    {post.imageUrl && (
                      <img 
                        src={post.imageUrl} 
                        alt="Post content" 
                        className="w-full h-64 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="flex items-center space-x-4 text-gray-400 text-sm">
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{post.location}</span>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <TagIcon className="h-4 w-4" />
                          <span>{post.tags.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Advanced Create Form (your original form)
  const AdvancedCreateForm = () => (
    <form onSubmit={handleAdvancedSubmit} className="space-y-6">
      {/* Caption */}
      <div className="bg-[#1a1a1a]/70 backdrop-blur-lg rounded-xl border border-white/10 p-6 shadow-lg">
        <label className="block text-gray-300 text-sm font-medium mb-3">
          What's on your mind?
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[120px]"
          placeholder="Share your travel experience..."
          required
        />
      </div>

      {/* Images */}
      <div className="bg-[#1a1a1a]/70 backdrop-blur-lg rounded-xl border border-white/10 p-6 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-gray-300 text-sm font-medium">
            Add Photos
          </label>
          <span className="text-xs text-gray-400">
            {images.length}/10 images
          </span>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {images.map((image, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          className="flex items-center justify-center border-2 border-dashed border-white/20 rounded-lg p-6 cursor-pointer hover:border-emerald-500/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <ImageIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-300">Click to upload images</p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG or GIF • Max 10 images
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>
      </div>

      {/* Location */}
      <div className="bg-[#1a1a1a]/70 backdrop-blur-lg rounded-xl border border-white/10 p-6 shadow-lg">
        <label className="block text-gray-300 text-sm font-medium mb-3">
          Add Location
        </label>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Add a location..."
            />
          </div>
          <button
            type="button"
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
          >
            {showLocationPicker ? 'Hide Map' : 'Pick on Map'}
          </button>
        </div>
        {showLocationPicker && (
          <div className="mt-4 h-[300px] rounded-lg overflow-hidden border border-white/10 relative">
            <MapContainer
              center={locationCoords}
              zoom={8}
              style={{
                height: '100%',
                width: '100%',
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker
                position={locationCoords}
                setPosition={setLocationCoords}
              />
            </MapContainer>
            <div className="bg-[#1a1a1a]/90 backdrop-blur-sm p-2 absolute bottom-0 left-0 right-0 text-xs text-gray-300 z-[1000]">
              Click on the map to set your location. Current coordinates:{' '}
              {locationCoords[0].toFixed(4)}, {locationCoords[1].toFixed(4)}
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="bg-[#1a1a1a]/70 backdrop-blur-lg rounded-xl border border-white/10 p-6 shadow-lg">
        <label className="block text-gray-300 text-sm font-medium mb-3">
          Add Tags
        </label>
        <div className="flex items-center space-x-2 mb-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <TagIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault,
                  addTag()
                }
              }}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Add a tag..."
            />
          </div>
          <button
            type="button"
            onClick={addTag}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-emerald-300 hover:text-white"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Settings */}
      <div className="bg-[#1a1a1a]/70 backdrop-blur-lg rounded-xl border border-white/10 p-6 shadow-lg">
        <label className="block text-gray-300 text-sm font-medium mb-3">
          Privacy
        </label>
        <div className="relative">
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
          >
            <option value="public">🌍 Public</option>
            <option value="friends">👥 Friends Only</option>
            <option value="private">🔒 Only Me</option>
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !caption.trim()}
          className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Posting...</span>
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4" />
              <span>Share Post</span>
            </>
          )}
        </button>
      </div>
    </form>
  )

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900/20 to-blue-900/20">
      <Navigation />
      
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          {currentView === 'feed' && <FeedView />}
          {currentView === 'add' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Post</h2>
              <AdvancedCreateForm />
            </div>
          )}
          {currentView === 'myPosts' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">My Posts</h2>
              <FeedView />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-md mx-4">
            <div className="text-center">
              <TrashIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Delete Post</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteExecute}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CeylonTrailsPosts;