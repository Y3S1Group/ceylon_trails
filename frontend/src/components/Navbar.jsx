import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, User, Menu, Search, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ searchValue, setSearchValue, showSearchInNav }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setScrolled(scrollTop > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHome = location.pathname === '/';
    
    const navbarBackground = isHome && !scrolled 
        ? 'bg-transparent' 
        : 'bg-white shadow-sm';

    const inactiveTextColor = isHome && !scrolled ? 'text-white/60' : 'text-black/50';
    
    const getLinkClass = (path, isMobile = false) => {
        const isActive = location.pathname === path;
        
        if (isMobile) {
            // For mobile menu, always use black text for readability
            return isActive
                ? 'text-black font-semibold border-b-2 border-teal-500'
                : 'text-black/80 hover:text-black font-medium';
        } else {
            // Desktop link styling
            if (isActive) {
                if (isHome && !scrolled) {
                    return 'text-white font-semibold border-b-2 border-white';
                } else {
                    return 'text-black font-semibold border-b-2 border-teal-500';
                }
            } else {
                return `${inactiveTextColor} hover:text-opacity-100 font-medium`;
            }
        }
    };

    const iconColor = isHome && !scrolled ? 'text-white' : 'text-gray-600';
    const iconHoverColor = isHome && !scrolled ? 'hover:text-white/80 hover:bg-white/10' : 'hover:text-gray-900 hover:bg-gray-100';

    return (
        <>
            <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navbarBackground}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center flex-shrink-0">
                            <img
                                src={isHome && !scrolled ? "src/assets/logo.png" : "src/assets/logoscroll.png"}
                                alt="logo"
                                className="h-7 w-auto transition-all duration-300"
                            />
                        </Link>

                        {/* Center Navigation - Adjusted spacing when search is visible */}
                        <ul className={`hidden md:flex items-center font-medium transition-all duration-300 ${
                            showSearchInNav ? 'space-x-10 ml-30' : 'space-x-8 ml-200'
                        }`}>
                            <Link 
                                to="/" 
                                className={`transition-all duration-200 pb-1 ${getLinkClass('/')}`}
                            >
                                Explore 
                            </Link>
                            <Link 
                                to="/feed" 
                                className={`transition-all duration-200 pb-1 ${getLinkClass('/feed')}`}
                            >
                                Feed
                            </Link>
                            <Link 
                                to="/saved" 
                                className={`transition-all duration-200 pb-1 ${getLinkClass('/saved')}`}
                            >
                                Saved
                            </Link>
                                                        <Link 
                                to='/profile' 
                                className={`transition-all duration-200 pb-1 ${getLinkClass('/profile')}`}
                            >
                                Profile
                            </Link>
                        </ul>

                        {/* Right-side Icons */}
                        <div className="flex items-center flex-shrink-0 space-x-2">
                            {/* Desktop Search Bar */}
                            <AnimatePresence>
                                {showSearchInNav && (
                                    <motion.div 
                                        className="hidden lg:block"
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 'auto', opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    >
                                        <motion.div 
                                            className="relative group"
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, duration: 0.3 }}
                                        >
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-teal-500 transition-colors" />
                                            <input
                                                type="text"
                                                value={searchValue}
                                                onChange={(e) => setSearchValue(e.target.value)}
                                                placeholder="Search destinations..."
                                                className="w-56 xl:w-64 pl-9 pr-12 py-2.5 rounded-full bg-white shadow-lg border border-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 text-sm transition-all hover:shadow-xl"
                                            />
                                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white p-1.5 rounded-full shadow-md transition-all hover:scale-110 focus:ring-2 focus:ring-teal-500/30">
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Mobile Search Toggle */}
                            {showSearchInNav && (
                                <button 
                                    onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                                    className={`lg:hidden p-2 ${iconColor} ${iconHoverColor} rounded-lg transition-colors`}
                                >
                                    {mobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                                </button>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button 
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className={`lg:hidden p-2 ${iconColor} ${iconHoverColor} rounded-lg transition-colors flex-shrink-0`}
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <AnimatePresence>
                    {mobileSearchOpen && showSearchInNav && (
                        <motion.div 
                            className="lg:hidden border-t border-gray-200 bg-white px-6 py-4"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    placeholder="Search destinations, trails..."
                                    className="w-full pl-9 pr-12 py-3 rounded-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 text-sm"
                                />
                                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-full shadow-md transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div 
                            className="lg:hidden border-t border-gray-200 bg-white px-6 py-4"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="space-y-4">
                                <Link 
                                    to="/" 
                                    className={`block py-2 ${getLinkClass('/', true)} text-lg`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Explore 
                                </Link>
                                <Link 
                                    to="/feed" 
                                    className={`block py-2 ${getLinkClass('/feed', true)} text-lg`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Feed
                                </Link>
                                <Link 
                                    to="/saved" 
                                    className={`block py-2 ${getLinkClass('/saved', true)} text-lg`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Saved
                                </Link>
                                                                <Link 
                                    to='/profile' 
                                    className={`block py-2 ${getLinkClass('/profile', true)} text-lg`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Profile
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Overlay for mobile menu */}
            <AnimatePresence>
                {(mobileMenuOpen || mobileSearchOpen) && (
                    <motion.div 
                        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileSearchOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;