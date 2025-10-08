import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const navbarBackground = isHome && !scrolled ? 'bg-transparent' : 'bg-white shadow-sm';
  const inactiveTextColor = isHome && !scrolled ? 'text-white/60' : 'text-black/50';
  const iconColor = isHome && !scrolled ? 'text-white' : 'text-gray-600';
  const iconHoverColor = isHome && !scrolled ? 'hover:text-white/80 hover:bg-white/10' : 'hover:text-gray-900 hover:bg-gray-100';

  const getLinkClass = (path, isMobile = false) => {
    const isActive = location.pathname === path;
    if (isMobile) {
      return isActive
        ? 'text-black font-semibold border-b-2 border-teal-500'
        : 'text-black/80 hover:text-black font-medium';
    } else {
      if (isActive) {
        return isHome && !scrolled
          ? 'text-white font-semibold border-b-2 border-white'
          : 'text-black font-semibold border-b-2 border-teal-500';
      } else {
        return `${inactiveTextColor} hover:text-opacity-100 font-medium`;
      }
    }
  };

  return (
    <>
      <div className={`fixed top-0 pt-1 pb-1 left-0 w-full z-50 transition-all duration-300 ${navbarBackground}`}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img
                src={isHome && !scrolled ? "/src/assets/logo.png" : "/src/assets/logoscroll.png"}
                alt="logo"
                className="h-7 w-auto transition-all duration-300"
              />
            </Link>

            {/* Desktop Links */}
            <ul className="hidden md:flex items-center space-x-8 font-medium">
              <Link to="/" className={`transition-all duration-200 pb-1 ${getLinkClass('/')}`}>Explore</Link>
              <Link to="/feed" className={`transition-all duration-200 pb-1 ${getLinkClass('/feed')}`}>Feed</Link>
              <Link to="/saved" className={`transition-all duration-200 pb-1 ${getLinkClass('/saved')}`}>Saved</Link>
              <Link to="/profile" className={`transition-all duration-200 pb-1 ${getLinkClass('/profile')}`}>Profile</Link>
            </ul>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 ${iconColor} ${iconHoverColor} rounded-lg transition-colors flex-shrink-0`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-gray-200 bg-white px-6 py-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-4">
                <Link to="/" className={`block py-2 text-lg ${getLinkClass('/', true)}`} onClick={() => setMobileMenuOpen(false)}>Explore</Link>
                <Link to="/feed" className={`block py-2 text-lg ${getLinkClass('/feed', true)}`} onClick={() => setMobileMenuOpen(false)}>Feed</Link>
                <Link to="/saved" className={`block py-2 text-lg ${getLinkClass('/saved', true)}`} onClick={() => setMobileMenuOpen(false)}>Saved</Link>
                <Link to="/profile" className={`block py-2 text-lg ${getLinkClass('/profile', true)}`} onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
