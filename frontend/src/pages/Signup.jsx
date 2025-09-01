import React, { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Get login function from auth
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  
  const [emailValid, setEmailValid] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
    color: "red"
  });

  // ✅ Email validation
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ✅ Password strength logic (unchanged)
  const calculatePasswordStrength = (password) => {
    let score = 0;
    const feedback = [];
    if (password.length === 0) {
      return { score: 0, feedback: [], color: "red" };
    }
    if (password.length >= 8) score += 1;
    else feedback.push("At least 8 characters");
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("One uppercase letter");
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("One lowercase letter");
    if (/\d/.test(password)) score += 1;
    else feedback.push("One number");
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push("One special character");

    let color = "red";
    if (score >= 4) color = "green";
    else if (score >= 3) color = "yellow";
    else if (score >= 2) color = "orange";
    return { score, feedback, color };
  };

  useEffect(() => {
    if (formData.email.length > 0) {
      setEmailValid(validateEmail(formData.email));
    } else {
      setEmailValid(null);
    }
  }, [formData.email]);

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Handle Signup + Auto Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (passwordStrength.score < 3) {
      alert("Please choose a stronger password");
      return;
    }

    try {
      const response = await fetch("http://localhost:5006/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;  
      }

      // ✅ Automatically log in after signup
      const result = await login(formData.email, formData.password);

      if (result.success) {
        navigate("/"); // ✅ Now explore will show logged-in view
      } else {
        alert("Signup successful, but login failed. Please log in manually.");
        navigate("/login");
      }

    } catch (err) {
      console.error("Error during signup:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score === 0) return "";
    if (passwordStrength.score <= 2) return "Weak";
    if (passwordStrength.score === 3) return "Fair";
    if (passwordStrength.score === 4) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.color) {
      case "red": return "bg-red-500";
      case "orange": return "bg-orange-500";
      case "yellow": return "bg-yellow-500";
      case "green": return "bg-green-500";
      default: return "bg-gray-300";
    }
  };

  const isFormValid = formData.name.trim().length > 0 && emailValid && passwordStrength.score >= 3;

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

      {/* Signup Form */}
      <motion.div
        className="relative z-10 w-full max-w-md mx px-6 bg-transparent backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-white/80">Sign up to get started with your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-white/60" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white placeholder-white/50 transition duration-200"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email Field */}
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
                className={`block w-full pl-10 pr-10 py-3 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white placeholder-white/50 transition duration-200 ${
                  emailValid === null ? 'border-white/20' :
                  emailValid ? 'border-green-500' : 'border-red-500'
                }`}
                placeholder="Enter your email"
              />
              {emailValid !== null && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {emailValid ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {formData.email.length > 0 && !emailValid && (
              <p className="mt-1 text-sm text-red-400">Please enter a valid email address</p>
            )}
          </div>

          {/* Password Field */}
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-white/60 hover:text-white/80" />
                ) : (
                  <Eye className="h-5 w-5 text-white/60 hover:text-white/80" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/80">Password strength:</span>
                  <span className={`text-sm font-medium ${
                    passwordStrength.color === 'red' ? 'text-red-400' :
                    passwordStrength.color === 'orange' ? 'text-orange-400' :
                    passwordStrength.color === 'yellow' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-white/60 mb-1">Password must include:</p>
                    <ul className="text-xs text-white/60 space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <X className="h-3 w-3 text-red-400 mr-1" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:ring-offset-1 focus:ring-offset-transparent transform transition duration-200 font-medium ${
              isFormValid 
                ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:from-teal-700 hover:to-blue-700 cursor-pointer'
                : 'bg-gray-600/50 text-white/50 cursor-not-allowed'
            }`}
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-white/80 mt-8">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-teal-400 hover:text-teal-300 transition duration-200">
            Sign in here
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;