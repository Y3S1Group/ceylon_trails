import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status on app load
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/auth/get-current-user', {
                credentials: 'include' // Important: include cookies
            });
            
            const result = await response.json();
            
            if (result.success) {
                setCurrentUser(result.data);
                setIsAuthenticated(true);
            } else {
                setCurrentUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setCurrentUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include' // Important: include cookies
            });

            const result = await response.json();
            
            if (result.success) {
                // Refresh user data after successful login
                await checkAuthStatus();
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setCurrentUser(null);
            setIsAuthenticated(false);
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                await checkAuthStatus();
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: 'Registration failed' };
        }
    };

    return {
        currentUser,
        loading,
        isAuthenticated,
        login,
        logout,
        register,
        refreshAuth: checkAuthStatus
    };
};