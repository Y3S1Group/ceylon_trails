import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  // Animation variants for the form
  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        type: "spring",
        stiffness: 300
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src="/src/assets/loginSignup.mp4"
        />
      </motion.div>

      {/* Shadow Overlay */}
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

      {/* Login Form */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-auto px-6 bg-transparent backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
          <p className="text-white/80">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100/20 border border-red-400/30 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/60" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white placeholder-white/50 transition duration-200"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/60" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white placeholder-white/50 transition duration-200"
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-white/60 hover:text-white/80" />
                ) : (
                  <Eye className="h-5 w-5 text-white/60 hover:text-white/80" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center pl-2">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-white/20 rounded bg-white/5"
                disabled={loading}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-white/90">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-teal-400 hover:text-teal-300 transition duration-200 pr-2">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-teal-700 hover:to-blue-700 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:ring-offset-1 focus:ring-offset-transparent transform transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-white/80 mt-8">
          Don't have an account?{' '}
          <a href="/signup" className="font-medium text-teal-400 hover:text-teal-300 transition duration-200">
            Sign up here
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;