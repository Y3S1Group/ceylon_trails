import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, RotateCcw, MapPin, Heart, MessageCircle, BotMessageSquare, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const PostCard = ({ post, onPostClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onPostClick(post)}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 transform hover:scale-105"
    >
      <div className="relative">
        <img
          src={post.imageUrls?.[0] || post.image}
          alt={post.caption || post.title}
          className="w-full h-32 object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200?text=Travel+Photo';
          }}
        />
        {(post.imageUrls?.length > 1) && (
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">
            +{post.imageUrls.length - 1}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-2">
          {post.caption || post.title || post.description || 'Travel Experience'}
        </h4>
        <div className="flex items-center text-gray-600 mb-2 text-xs">
          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">{post.location || 'Unknown Location'}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
              <span>{post.userId.name || 0}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

const ChatBot = ({ isOpen, onClose, initialPrompt = "", onPostSelect, onPostClick }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI travel assistant. I can help you discover amazing destinations, plan your trips, and find travel posts from other adventurers. How can I help you today?",
      sender: 'bot', 
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasProcessedInitialPrompt, setHasProcessedInitialPrompt] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Generate session ID when component mounts
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      console.log("Generated session ID:", newSessionId);
    }
  }, [sessionId]);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // Handle initial prompt when chat opens
  useEffect(() => {
    if (isOpen && initialPrompt && !hasProcessedInitialPrompt) {
      const trimmedPrompt = initialPrompt.trim();
      if (trimmedPrompt) {
        // Set the input message and automatically send it
        setInputMessage(trimmedPrompt);
        setTimeout(() => {
          handleSendMessage(trimmedPrompt);
        }, 500); // Small delay to make it feel more natural
      }
      setHasProcessedInitialPrompt(true);
    }
    
    // Reset when chat is closed
    if (!isOpen) {
      setHasProcessedInitialPrompt(false);
    }
  }, [isOpen, initialPrompt, hasProcessedInitialPrompt]);

  // Send message to AI and get structured response
  const sendMessageToAI = async (message) => {
    try {
      const res = await fetch("http://localhost:5006/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message,
          sessionId 
        })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("AI Response:", data); // Debug log
      
      if (data.success) return data;
      throw new Error("AI response failed");
    } catch (err) {
      console.error("AI fetch error:", err);
      throw err;
    }
  };

  // Clear conversation on backend when clearing chat
  const clearConversation = async () => {
    try {
      await fetch("http://localhost:5006/api/chat/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
    } catch (err) {
      console.error("Error clearing conversation:", err);
    }
  };

  // Fetch posts from backend
  const fetchPosts = async (location, tags) => {
    try {
      let url = `http://localhost:5006/api/posts/search?`;
      const params = new URLSearchParams();
      
      if (location && location.trim()) {
        // Clean the location - remove common suffixes and make it more flexible
        const cleanLocation = location.trim().toLowerCase();
        params.append('location', cleanLocation);
      }
      if (tags && Array.isArray(tags) && tags.length > 0) {
        // Add each tag as a separate parameter or combine them
        tags.forEach(tag => {
          if (tag && tag.trim()) {
            params.append('tag', tag.trim().toLowerCase());
          }
        });
      }
      
      const finalUrl = url + params.toString();
      console.log("Fetching posts from:", finalUrl); // Debug log
      console.log("Search params:", { location, tags }); // Debug log
      
      const res = await fetch(finalUrl);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Posts response:", data); // Debug log
      console.log("Number of posts found:", data.data ? data.data.length : 0); 
      
      // Return the posts array directly, whether it's empty or not
      return Array.isArray(data.data) ? data.data : [];
    } catch (err) {
      console.error("Post fetch error:", err);
      return [];
    }
  };

  // Create posts message component
  const createPostsMessage = (posts, location) => {
    if (!posts || posts.length === 0) {
      return {
        id: Date.now() + 2,
        text: `I couldn't find any posts for ${location || 'this location'} right now, but I can still help you plan your trip!`,
        sender: 'bot',
        timestamp: new Date()
      };
    }
    return {
      id: Date.now() + 2,
      text: `Here are some amazing posts from travelers in ${location || 'this area'}:`,
      sender: 'bot',
      timestamp: new Date(),
      posts: posts.slice(0, 3),
      location
    };
  };

  // Handle sending a message
  const handleSendMessage = async (messageText = null) => {
    const messageToSend = messageText || inputMessage;
    if (!messageToSend.trim() || isLoading || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      text: messageToSend,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setHasError(false);

    try {
      const aiData = await sendMessageToAI(messageToSend);
      console.log("Processed AI Data:", aiData); // Debug log

      // Show AI reply
      const botMessage = {
        id: Date.now() + 1,
        text: aiData.reply,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      // Enhanced keyword processing - only fetch posts if explicitly requested
      if (aiData.keywords && aiData.keywords.showPosts) {
        const { location, tags } = aiData.keywords;
        console.log("AI explicitly requested posts. Keywords extracted:", { location, tags }); // Debug log
        
        // Check if we have either location or tags
        const hasLocation = location && typeof location === 'string' && location.trim();
        const hasTags = tags && Array.isArray(tags) && tags.length > 0;
        
        if (hasLocation || hasTags) {
          console.log("Fetching posts with:", { location: hasLocation ? location : null, tags: hasTags ? tags : null });
          
          // Add a small delay to make the interaction feel more natural
          setTimeout(async () => {
            const posts = await fetchPosts(hasLocation ? location : null, hasTags ? tags : null);
            console.log("Fetched posts:", posts); // Debug log
            
            const postsMessage = createPostsMessage(posts, hasLocation ? location : (hasTags ? tags[0] : null));
            setMessages(prev => [...prev, postsMessage]);
          }, 500);
        } else {
          console.log("AI requested posts but no valid keywords found");
        }
      } else {
        console.log("AI did not request posts - showPosts:", aiData.keywords?.showPosts);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setHasError(true);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Sorry, I'm having trouble connecting right now. Please try again later.",
          sender: 'bot',
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = async () => {
    // Clear conversation on backend
    await clearConversation();
    
    // Reset frontend state
    setMessages([
      {
        id: 1,
        text: "Hi! I'm your AI travel assistant. I can help you discover amazing destinations, plan your trips, and find travel posts from other adventurers. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    setHasError(false);
    setInputMessage('');
  };

  const handlePostClick = (post) => {

    const fullPost = {
      _id: post._id || post.id || `temp_${Date.now()}`,
      caption: post.caption || post.title || post.description || '',
      location: post.location || 'Unknown Location',
      imageUrls: post.imageUrls || (post.image ? [post.image] : []),
      userId: post.userId || { name: 'Explorer' },
      createdAt: post.createdAt || new Date().toISOString(),
      likes: post.likes || [],
      comments: post.comments || [],
      tags: post.tags || [],
      coordinates: post.coordinates || null
    };
    
    console.log("Processed post for FullPostView:", fullPost); // Debug log
    
    // Call the parent's onPostClick function to handle the modal
    if (onPostClick) {
      onPostClick(fullPost);
    }
    
    // Also call the original onPostSelect if provided
    if (onPostSelect) onPostSelect(fullPost);
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-30 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Chat Container */}
          <motion.div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full h-full max-w-4xl max-h-[85vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 rounded-t-2xl flex items-center justify-between drop-shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <BotMessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Travel Assistant</h3>
                  <p className="text-sm text-blue-100">{isLoading ? 'Thinking...' : 'Ready to help you explore Sri Lanka'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={clearChat} 
                  className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Clear chat"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col h-full pb-20">
              <div className="flex-1 p-6 overflow-y-auto bg-gray-200" style={{ maxHeight: 'calc(85vh - 140px)' }}>
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-start space-x-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.sender === 'bot' && <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"><Bot className="w-4 h-4 text-white" /></div>}
                        <div className={`max-w-md px-4 py-3 rounded-2xl text-sm shadow-sm ${message.sender === 'user' ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white' : message.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white text-gray-800 border border-gray-200'}`}>
                          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                          <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        {message.sender === 'user' && <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"><User className="w-4 h-4 text-white" /></div>}
                      </motion.div>

                      {message.sender === 'bot' && message.posts && message.posts.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="ml-11 max-w-2xl">
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {message.posts.map((post, index) => (
                              <motion.div key={post._id || post.id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                                <PostCard post={post} onPostClick={handlePostClick} />
                              </motion.div>
                            ))}
                          </div>
                          <div className="mt-3 text-xs text-gray-500 text-center font-medium">Click on any post to view in detail</div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center shadow-md"><Bot className="w-4 h-4 text-white" /></div>
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 rounded-b-2xl">
                {hasError && (
                  <div className="mb-3 flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-sm text-red-600 font-medium">Connection issue</span>
                    <button onClick={clearChat} className="text-sm text-red-600 hover:text-red-700 underline font-medium">Clear chat</button>
                  </div>
                )}
                <div className="flex space-x-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about destinations, get travel tips, or find posts..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    disabled={isLoading}
                  />
                  <motion.button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default ChatBot;