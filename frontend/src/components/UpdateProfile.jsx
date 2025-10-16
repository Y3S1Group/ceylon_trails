import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Save, Eye, EyeOff, Camera, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const UpdateProfile = ({ isOpen, onClose, onProfileUpdated }) => {
    const { user, isLoggedIn } = useAuth();

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [backgroundImagePreview, setBackgroundImagePreview] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [backgroundImageFile, setBackgroundImageFile] = useState(null);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState({ profile: false, background: false });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user && isOpen) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                password: ''
            });
            setProfileImagePreview(user.profileImage || null);
            setBackgroundImagePreview(user.backgroundImage || null);
            setProfileImageFile(null);
            setBackgroundImageFile(null);
            setError('');
            setSuccess('');
        }
    }, [user, isOpen]);

    if (!isOpen) return null;
    if (!user || !isLoggedIn) return null;

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleProfileImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBackgroundImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            setBackgroundImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setBackgroundImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadProfileImage = async () => {
        if (!profileImageFile) return;
        
        setImageLoading(prev => ({ ...prev, profile: true }));
        setError('');

        try {
            const formData = new FormData();
            formData.append('image', profileImageFile);

            const response = await fetch('http://localhost:5006/api/auth/upload-profile-image', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload profile image');
            }

            setSuccess('Profile image uploaded successfully!');
            setProfileImageFile(null);
            
            if (onProfileUpdated) {
                onProfileUpdated();
            }

        } catch (error) {
            setError(error.message);
        } finally {
            setImageLoading(prev => ({ ...prev, profile: false }));
        }
    };

    const uploadBackgroundImage = async () => {
        if (!backgroundImageFile) return;
        
        setImageLoading(prev => ({ ...prev, background: true }));
        setError('');

        try {
            const formData = new FormData();
            formData.append('image', backgroundImageFile);

            const response = await fetch('http://localhost:5006/api/auth/upload-background-image', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload background image');
            }

            setSuccess('Background image uploaded successfully!');
            setBackgroundImageFile(null);
            
            if (onProfileUpdated) {
                onProfileUpdated();
            }

        } catch (error) {
            setError(error.message);
        } finally {
            setImageLoading(prev => ({ ...prev, background: false }));
        }
    };

    const deleteProfileImage = async () => {
        setImageLoading(prev => ({ ...prev, profile: true }));
        setError('');

        try {
            const response = await fetch('http://localhost:5006/api/auth/delete-profile-image', {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete profile image');
            }

            setProfileImagePreview(null);
            setProfileImageFile(null);
            setSuccess('Profile image deleted successfully!');
            
            if (onProfileUpdated) {
                onProfileUpdated();
            }

        } catch (error) {
            setError(error.message);
        } finally {
            setImageLoading(prev => ({ ...prev, profile: false }));
        }
    };

    const deleteBackgroundImage = async () => {
        setImageLoading(prev => ({ ...prev, background: true }));
        setError('');

        try {
            const response = await fetch('http://localhost:5006/api/auth/delete-background-image', {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete background image');
            }

            setBackgroundImagePreview(null);
            setBackgroundImageFile(null);
            setSuccess('Background image deleted successfully!');
            
            if (onProfileUpdated) {
                onProfileUpdated();
            }

        } catch (error) {
            setError(error.message);
        } finally {
            setImageLoading(prev => ({ ...prev, background: false }));
        }
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');
        setLoading(true);
        
        try {
            if (!profileData.name.trim()) {
                throw new Error('Name is required');
            }
            if (!profileData.email.trim()) {
                throw new Error('Email is required');
            }

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

            if (Object.keys(updateData).length === 0) {
                throw new Error('No changes to update');
            }

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

            setSuccess('Profile updated successfully!');
            
            setProfileData(prev => ({
                ...prev,
                password: ''
            }));
            
            if (onProfileUpdated) {
                onProfileUpdated(data);
            }

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

    const getDefaultAvatar = (name) => {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=14b8a6&color=fff&size=200`;
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-gray-200 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
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

                <div className="p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Background Image
                                </label>
                                <div className="relative h-32 bg-gradient-to-r from-teal-400 to-blue-500 rounded-xl overflow-hidden border-2 border-gray-400">
                                    {backgroundImagePreview ? (
                                        <img 
                                            src={backgroundImagePreview} 
                                            alt="Background" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white">
                                            <Camera className="w-8 h-8" />
                                        </div>
                                    )}
                                    
                                    <div className="absolute bottom-2 right-2 flex gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleBackgroundImageSelect}
                                            className="hidden"
                                            id="background-upload"
                                        />
                                        <label
                                            htmlFor="background-upload"
                                            className="px-3 py-1.5 bg-white/90 hover:bg-white text-gray-800 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center gap-1"
                                        >
                                            <Camera className="w-3 h-3" />
                                            Change
                                        </label>
                                        {backgroundImagePreview && (
                                            <button
                                                onClick={deleteBackgroundImage}
                                                disabled={imageLoading.background}
                                                className="px-3 py-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                {imageLoading.background ? '...' : 'Remove'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {backgroundImageFile && (
                                    <button
                                        onClick={uploadBackgroundImage}
                                        disabled={imageLoading.background}
                                        className="mt-2 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        {imageLoading.background ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                Upload Background Image
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Profile Image
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-400 bg-gray-300">
                                            <img 
                                                src={profileImagePreview || getDefaultAvatar(user.name)} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfileImageSelect}
                                            className="hidden"
                                            id="profile-upload"
                                        />
                                        <label
                                            htmlFor="profile-upload"
                                            className="absolute bottom-0 right-0 w-7 h-7 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg"
                                        >
                                            <Camera className="w-4 h-4 text-white" />
                                        </label>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {profileImageFile && (
                                            <button
                                                onClick={uploadProfileImage}
                                                disabled={imageLoading.profile}
                                                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                            >
                                                {imageLoading.profile ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4" />
                                                        Upload
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {profileImagePreview && !profileImageFile && (
                                            <button
                                                onClick={deleteProfileImage}
                                                disabled={imageLoading.profile}
                                                className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {imageLoading.profile ? 'Deleting...' : 'Remove Profile Image'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Max file size: 5MB</p>
                            </div>
                        </div>

                        <div className="space-y-5">
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

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <div className="w-4 h-4 bg-blue-500 rounded-full mt-0.5 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-blue-800 text-sm font-medium">Update Information</p>
                                        <ul className="text-blue-700 text-xs mt-1 space-y-1">
                                            <li>• Upload images separately from profile info</li>
                                            <li>• Images are uploaded immediately when you click upload</li>
                                            <li>• Profile info is saved when you click Update Profile</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

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
        </div>
    );
};

export default UpdateProfile;