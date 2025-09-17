import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Fetch current user on mount
    useEffect(() => {
    setAuthLoading(true);
    axios.get("http://localhost:5006/api/auth/get-current-user", { withCredentials: true })
        .then(res => {
        if(res.data.loggedIn == true){
            setIsLoggedIn(true);
            setUser(res.data.user);
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
        })
        .catch(() => {
        setIsLoggedIn(false);
        setUser(null);
        })
        .finally(() => setAuthLoading(false));
    }, []);



  // ✅ login function
  const login = async (email, password) => {
    try {
      const res = await axios.post(
        "http://localhost:5006/api/auth/login",
        { email, password },
        { withCredentials: true } // needed for cookie JWT
      );

      if (res.data.success) {
        setIsLoggedIn(true);
        setUser(res.data.user);
        return { success: true ,role: res.data.role};
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: "Login failed" };
    }
  };

  // ✅ logout function
  const logout = async () => {
    try {
      await axios.post("http://localhost:5006/api/auth/logout", {}, { withCredentials: true });
      setIsLoggedIn(false);
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, authLoading  }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
