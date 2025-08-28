import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            console.log(' Checking auth status...');
            const response = await fetch('http://localhost:5006/api/auth/get-current-user', {
                method: 'GET', // Make sure it's GET
                credentials: 'include'
            });
            
            const result = await response.json();
            console.log('Auth response:', result);
            
            if (result.success) {
                setCurrentUser(result.data);
                setIsAuthenticated(true);
                console.log(' User authenticated:', result.data);
            } else {
                setCurrentUser(null);
                setIsAuthenticated(false);
                console.log(' User not authenticated');
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
            console.log(' Attempting login...');
            const response = await fetch('http://localhost:5006/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const result = await response.json();
            console.log(' Login response:', result);
            
            if (result.success) {
                // Refresh user data after successful login
                await checkAuthStatus();
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            await fetch('http://localhost:5006/api/auth/logout', {
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
            const response = await fetch('http://localhost:5006/api/auth/register', {
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

export default useAuth;