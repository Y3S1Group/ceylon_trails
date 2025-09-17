import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const UpdateProfile = ({ isOpen, onClose, onProfileUpdated }) => {
    const { user, isLoggedIn } = useAuth();

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Initialize form with current user data
    useEffect(() => {
        if (user && isOpen) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                password: ''
            });
            setError('');
            setSuccess('');
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    if (!user || !isLoggedIn) {
        return null;
    }

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear messages when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');
        setLoading(true);
        
        try {
            // Validation
            if (!profileData.name.trim()) {
                throw new Error('Name is required');
            }
            if (!profileData.email.trim()) {
                throw new Error('Email is required');
            }

            // Prepare update data - only send fields that changed
            const updateData = {};
            
            if (profileData.name.trim() !== user.name) {
                updateData.name = profileData.name.trim();
            }
            
            if (profileData.email.trim() !== user.email) {
                updateData.email = profileData.email.trim();
            }
            
            if (profileData.password.trim()) {
                updateData.password = profileData.password.trim();
            }

            // Check if there are changes to update
            if (Object.keys(updateData).length === 0) {
                throw new Error('No changes to update');
            }

            console.log('Updating profile with:', updateData);

            const response = await fetch('http://localhost:5006/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Success
            setSuccess('Profile updated successfully!');
            
            // Clear password field
            setProfileData(prev => ({
                ...prev,
                password: ''
            }));
            
            if (onProfileUpdated) {
                onProfileUpdated(data);
            }

            // Close modal after 2 seconds
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = () => {
        return (
            profileData.name.trim() !== user.name ||
            profileData.email.trim() !== user.email ||
            profileData.password.trim() !== ''
        );
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-gray-200 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-400">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-6 bg-teal-500 rounded-full"></div>
                        <h2 className="text-lg font-bold text-black">Update Profile</h2>
                        <span className="text-sm text-gray-600">for {user?.name}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-500 flex items-center justify-center text-gray-700 hover:text-white transition-all duration-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mx-5 mt-5 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mx-5 mt-5 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                {/* Content */}
                <div className="p-5">
                    <div className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full pl-9 pr-4 p-2.5 bg-gray-200 border border-gray-500 rounded-xl text-black placeholder-gray-500 focus:border-teal-700 focus:ring-1 focus:ring-teal-400/40 focus:outline-none transition-all duration-200 text-sm"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full pl-9 pr-4 p-2.5 bg-gray-200 border border-gray-500 rounded-xl text-black placeholder-gray-500 focus:border-teal-700 focus:ring-1 focus:ring-teal-400/40 focus:outline-none transition-all duration-200 text-sm"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={profileData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder="Leave blank to keep current password"
                                    className="w-full pl-9 pr-12 p-2.5 bg-gray-200 border border-gray-500 rounded-xl text-black placeholder-gray-500 focus:border-teal-700 focus:ring-1 focus:ring-teal-400/40 focus:outline-none transition-all duration-200 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Only fill this if you want to change your password
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full mt-0.5 flex-shrink-0"></div>
                                <div>
                                    <p className="text-blue-800 text-sm font-medium">Update Information</p>
                                    <ul className="text-blue-700 text-xs mt-1 space-y-1">
                                        <li>• Only changed fields will be updated</li>
                                        <li>• Leave password blank to keep current password</li>
                                        <li>• Email changes may require re-verification</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl transition-all duration-200 font-medium text-sm"
                            >
                                Cancel
                            </button>
                            
                            <div className="relative group">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !hasChanges()}
                                    className={`group flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-200 font-medium shadow-lg text-sm active:scale-95 ${
                                        hasChanges() && !loading
                                            ? 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-teal-600/25'
                                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            Update Profile
                                            <Save className="w-4 h-4 transform transition-transform duration-300 group-hover:scale-110" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateProfile;