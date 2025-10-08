import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { MapPin, Camera, Users, Heart, Compass, Shield, Sparkles } from "lucide-react";
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import TrailPost from '../components/TrailPost';
import CreatePost from '../components/CreatePost';
import { useAuth } from '../hooks/useAuth';
import InteractiveMap from '../components/InteractiveMap';
import FullPostView from '../components/FullPostView';
import { Plus } from "lucide-react";

const Explore = ({ searchValue, setSearchValue, showSearchInNav, isSelected }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalLocations: 0,
    totalPhotos: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const { isLoggedIn, authLoading } = useAuth();

  const [showFullPost, setShowFullPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

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

  // Fetch platform stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch('http://localhost:5006/api/posts/stats');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
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

  const platformHighlights = [
    { 
      icon: MapPin, 
      number: statsLoading ? "..." : `${stats.totalLocations}+`, 
      label: "Trails Discovered", 
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      icon: Users, 
      number: statsLoading ? "..." : `${stats.totalUsers}+`, 
      label: "Active Explorers", 
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      icon: Camera, 
      number: statsLoading ? "..." : `${stats.totalPhotos}+`, 
      label: "Photos Shared", 
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      icon: Heart, 
      number: statsLoading ? "..." : `${stats.totalPosts}+`, 
      label: "Adventures Posted", 
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  const valueProps = [
    {
      icon: Users,
      title: "Connect with Explorers",
      description: "Join a community of passionate adventurers sharing their journeys across Sri Lanka",
      iconBg: "bg-teal-100/50"
    },
    {
      icon: Sparkles,
      title: "Share Your Adventures",
      description: "Document your travels, inspire others, and create lasting memories of your explorations",
      iconBg: "bg-teal-100/50"
    },
    {
      icon: Compass,
      title: "Discover Hidden Gems",
      description: "Explore off-the-beaten-path destinations and uncover Sri Lanka's best-kept secrets",
      iconBg: "bg-teal-100/50"
    },
    {
      icon: MapPin,
      title: "Plan Your Next Trip",
      description: "Get inspired by real experiences and plan your perfect adventure with insider tips",
      iconBg: "bg-teal-100/50"
    }
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

      {/* Platform Highlights Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Highlights</h2>
            <p className="text-xl text-gray-600">Real-time stats from our growing community</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {platformHighlights.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Join TrailTales Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Join TrailTales</h2>
            <p className="text-xl text-gray-600">Be part of Sri Lanka's premier exploration community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {valueProps.map((prop, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${prop.iconBg} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <prop.icon className={`w-7 h-7 text-teal-800`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{prop.title}</h3>
                <p className="text-gray-600 leading-relaxed">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Adventures */}
      <div className="py-16 bg-white">
        <div className="flex items-center text-center justify-around mb-10">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4 ">Popular Destinations</h2>
            <p className="text-xl text-gray-600">Stories from our explorers</p>
          </div>
        </div>
        <TrailPost 
          onMapClick={(post) => {
            setSelectedPost(post);
            setShowLocationMap(true);
          }}
          endpoint="feed"
        />
      </div>

      {/* Floating Create Post Button */}
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