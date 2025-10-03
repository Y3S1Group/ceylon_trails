import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Search, Plus, Heart, MessageCircle, Share2, MapPin, Clock, Users, Star, ChevronDown, Camera, Compass, Mountain, Waves, TreePine, Sun, ArrowRight, Play, Award, Globe } from "lucide-react";
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import TrailPost from '../components/TrailPost';
import CreatePost from '../components/CreatePost';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import InteractiveMap from '../components/InteractiveMap';
import FullPostView from '../components/FullPostView';

const Explore = ({ searchValue, setSearchValue, showSearchInNav, isSelected }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const { isLoggedIn, authLoading } = useAuth();

  const [showFullPost, setShowFullPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Add handler
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowFullPost(true);
  };

  const closeFullPost = () => {
    setShowFullPost(false);
    setSelectedPost(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        setIsVisible(prev => ({ ...prev, [index]: isVisible }));
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev].slice(0, 5));
  };

  const getUserDisplayInfo = (userObj) => {
    if (userObj && typeof userObj === 'object' && userObj.username) {
      return {
        name: userObj.username,
        avatar: userObj.username.charAt(0).toUpperCase()
      };
    }
  
    return {
      name: 'Explorer',
      avatar: 'E'
    };
  };

  const stats = [
    { icon: Mountain, number: "500+", label: "Trails Mapped", color: "text-blue-600" },
    { icon: Users, number: "12K+", label: "Active Explorers", color: "text-green-600" },
    { icon: Camera, number: "50K+", label: "Photos Shared", color: "text-purple-600" },
    { icon: Award, number: "4.9", label: "Community Rating", color: "text-amber-600" }
  ];

  const categories = [
    { icon: Mountain, name: "Mountain Trails", count: 127, gradient: "from-slate-600 to-slate-800" },
    { icon: Waves, name: "Coastal Paths", count: 89, gradient: "from-blue-600 to-blue-800" },
    { icon: TreePine, name: "Forest Adventures", count: 156, gradient: "from-green-600 to-green-800" },
    { icon: Sun, name: "Cultural Sites", count: 78, gradient: "from-amber-600 to-orange-700" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        showSearchInNav={showSearchInNav}
      />
      <Hero
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        showSearchInNav={showSearchInNav}
        onPostClick={handlePostClick}
      />
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Community</h2>
            <p className="text-xl text-gray-600">Building Sri Lanka's exploration network</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${stat.color} bg-gray-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Categories</h2>
            <p className="text-xl text-gray-600">Find your perfect adventure</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="group cursor-pointer">
                <div className={`bg-gradient-to-br ${category.gradient} rounded-2xl p-6 text-white transform group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                  <category.icon className="w-10 h-10 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.count} trails</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pl-18">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2 ml-16">Featured Adventures</h2>
          <p className="text-xl text-gray-600 ml-16">Stories from our explorers</p>
        </div>
      </div>
      <TrailPost 
        onMapClick={(post) => {
          setSelectedPost(post);
          setShowLocationMap(true);
        }}
        endpoint="feed"
      />

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
      {/*floating button for create a post*/}
      
      <Footer />

      <InteractiveMap
        isOpen={showLocationMap}
        onClose={() => {
          setShowLocationMap(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
      />

      {/* Add FullPostView to JSX */}
      <FullPostView
        post={selectedPost}
        isOpen={showFullPost}
        onClose={closeFullPost}
        onMapClick={(post) => {
          setSelectedPost(post);
          setShowLocationMap(true);
        }}
      />
    </div>
  );
}

export default Explore;