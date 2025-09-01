import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Play, ChevronDown, Star, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Hero = ({ searchValue, setSearchValue, showSearchInNav }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const SLIDE_DURATION = 8000;
  const navigate = useNavigate();
  const { isLoggedIn, authLoading } = useAuth();

  const heroSlides = [
    {
      background: "https://images.unsplash.com/photo-1580803834205-0e64baf9d13d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Sigiriya Rock Fortress",
      subtitle: "Ancient Wonder",
      description: "Climb the legendary Lion Rock and witness 1,500 years of history carved in stone. Marvel at the ancient frescoes and panoramic views from the summit.",
      badge: "UNESCO World Heritage"
    },
    {
      background: "https://images.unsplash.com/photo-1580635849305-4399d586ac5c?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Ella Rock Trail",
      subtitle: "Mountain Paradise",
      description: "Journey through emerald tea plantations to reach breathtaking viewpoints. Experience the perfect blend of adventure and serenity in Sri Lanka's hill country.",
      badge: "Most Popular Trail"
    },
    {
      background: "https://images.unsplash.com/photo-1734279135115-6d8984e08206?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Mirissa Whale Watching",
      subtitle: "Ocean Adventure",
      description: "Set sail into the deep blue to encounter majestic blue whales and playful dolphins. Experience Sri Lanka's incredible marine biodiversity up close.",
      badge: "Wildlife Experience"
    },
    {
      background: "https://images.unsplash.com/photo-1653151106766-52f14da3bb68?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Adam's Peak",
      subtitle: "Sacred Summit",
      description: "Embark on a spiritual pilgrimage to Sri Lanka's most sacred mountain. Witness the magical sunrise that has inspired millions of pilgrims for centuries.",
      badge: "Sacred Journey"
    },
    {
      background: "https://media.cntravellerme.com/photos/6679185364c11ffe86eb6eeb/16:9/w_3984,h_2241,c_limit/1150415140",
      title: "Galle Fort",
      subtitle: "Colonial Charm",
      description: "Stroll through the cobblestone streets of this UNESCO World Heritage Site, blending Dutch colonial architecture with vibrant local culture.",
      badge: "Heritage Gem"
    },
    {
      background: "https://travelrebels.com/wp-content/uploads/2024/04/yala-national-park-bezoeken.jpg",
      title: "Yala National Park",
      subtitle: "Wildlife Haven",
      description: "Go on a thrilling safari to spot leopards, elephants, and diverse birdlife in Sri Lanka's most famous wildlife sanctuary.",
      badge: "Wild Adventure"
    },
    {
      background: "https://pohcdn.com/sites/default/files/styles/paragraph__live_banner__lb_image__1880bp/public/live_banner/Nuwara-Eliya.jpg",
      title: "Nuwara Eliya",
      subtitle: "Little England",
      description: "Discover tea estates, cool climates, and colonial-era architecture in Sri Lanka's hill station often called 'Little England'.",
      badge: "Tea Country"
    }
  ];

  // Auto-change slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroSlides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, []);

  // Track scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentSlide = heroSlides[currentImageIndex];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.8
      }
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      filter: "blur(10px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const staggerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  // Enhanced button animation variants
  const loginButtonVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.4
      }
    },
    hover: {
      scale: 1.05,
      backgroundColor: "rgba(20, 184, 165, 0.2)",
      borderColor: "rgba(20, 184, 166, 0.8)",
      boxShadow: "0 10px 25px rgba(20, 184, 165, 0.27)",
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      y: 0,
      transition: {
        duration: 0.1
      }
    }
  };

  const iconVariants = {
    initial: { x: 0 },
    hover: {
      x: [0, 3, -1, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  const textShineVariants = {
    initial: {
      backgroundPosition: "-100% 0"
    },
    hover: {
      backgroundPosition: "100% 0",
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden md:pt-0 pt-20">
      {/* Animated Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${currentSlide.background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </AnimatePresence>

      {/* Enhanced Shadow Overlay with Motion */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        className="absolute inset-0 bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/2 w-24 h-24 bg-white/15 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentImageIndex}-badge`}
            variants={staggerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            custom={0}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 p-2 mb-6 border border-white/20 shadow-2xl"
            whileHover={{
              backgroundColor: "rgba(255, 255, 255, 0.24)",
              transition: { duration: 0.2 }
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-4 h-4 text-white drop-shadow-lg" />
            </motion.div>
            <span className="text-white text-sm font-semibold drop-shadow-lg">
              {currentSlide.badge}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Content with Smooth Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentImageIndex}-content`}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit={{
              opacity: 0,
              y: -30,
              filter: "blur(5px)",
              transition: { duration: 0.4 }
            }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl"
              initial={{ opacity: 0, y: 80, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                {currentSlide.title}
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-white/95 font-light mb-8 drop-shadow-xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              {currentSlide.subtitle}
            </motion.p>

            <motion.p
              className="text-lg text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
            >
              {currentSlide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Conditionally Render Search Bar or Enhanced Login Button */}
        <AnimatePresence>
          {!authLoading && !isLoggedIn ? (
            <motion.div
              className="relative max-w-lg mx-auto mb-10 flex justify-center gap-4"
              variants={staggerVariants}
              custom={3}
              initial="hidden"
              animate="visible"
            >
              <motion.button
                variants={loginButtonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                onClick={() => navigate('/signup')}
                className="group relative overflow-hidden flex items-center gap-4 bg-white/10 backdrop-blur-md border-1 border-white/30 text-white px-8 py-3 rounded-full shadow-lg cursor-pointer select-none font-semibold text-md tracking-wide"
                aria-label="Login to start your travel journey"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255,255,255,0.05) 100%)",
                }}
              >
                {/* Animated background shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Pulsing background effect */}
                <motion.div
                  className="absolute inset-0 bg-teal-500/20 rounded-full"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0.9, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Text with shine effect */}
                <motion.span
                  variants={textShineVariants}
                  initial="initial"
                  whileHover="hover"
                  className="relative z-10 bg-gradient-to-r from-white via-white/80 to-white/80 bg-clip-text text-transparent"
                  style={{
                    backgroundSize: "200% 100%",
                  }}
                >
                  Your Travel Story Starts Here
                </motion.span>
              </motion.button>
            </motion.div>
          ) : (
            !showSearchInNav && (
              <motion.div
                className="relative max-w-lg mx-auto mb-12"
                variants={staggerVariants}
                custom={3}
                initial="hidden"
                animate="visible"
                exit={{
                  opacity: 0,
                  y: -50,
                  scale: 0.9,
                  transition: { duration: 0.4 }
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="relative group"
                  whileFocus={{ scale: 1.05 }}
                >
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 z-1 text-white w-5 h-5 group-focus-within:text-white transition-colors" />
                  <motion.input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search destinations, activities, or travelers..."
                    className="w-full pl-12 pr-14 py-4 rounded-full bg-white/0 border border-white/20 backdrop-blur-sm placeholder-white focus:outline-none focus:ring-1.5 focus:ring-white focus:bg-white/20 shadow-2xl text-sm text-white"
                    transition={{ duration: 0.2 }}
                  />
                  <motion.button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white p-2 px-8 rounded-full shadow-lg"
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    Explore
                  </motion.button>
                </motion.div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </motion.div>

      {/* Scroll Indicator with Bounce */}
      <motion.div
        className="absolute md:flex bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{
          y: [0, -10, 0],
          opacity: 1
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          },
          opacity: {
            delay: 1.5,
            duration: 0.5
          }
        }}
      >
        <span className="text-sm text-white/80">Scroll Down</span>
        <ChevronDown className="w-6 h-6 text-white/80 drop-shadow-lg mt-1" />
      </motion.div>
    </div>
  );
};

export default Hero;