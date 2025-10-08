import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Explore from './pages/Explore';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Saved from './pages/Saved';
import Dashboard from './pages/AdminDashboard';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import { AuthProvider, useAuth } from './hooks/useAuth';

function ProtectedRoute({ element }) {
  const { isLoggedIn, authLoading } = useAuth();

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return isLoggedIn ? element : <Navigate to="/login" />;
}

function App() {
  const [searchValue, setSearchValue] = useState('');
  const [showSearchInNav, setShowSearchInNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      setShowSearchInNav(scrollPosition > heroHeight - 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Explore
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                showSearchInNav={showSearchInNav}
              />
            }
          />
          <Route path="/feed" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/saved" element={<ProtectedRoute element={<Saved />} />}/>
          <Route path="/about" element={<AboutUs />} />
          <Route path="/policy" element={<PrivacyPolicy/>} />
          <Route path="/terms" element={<TermsOfService/>} />
          <Route path="/cookie" element={<CookiePolicy/>} />
          <Route
            path="/admin"
            element={<ProtectedRoute element={<Dashboard />} />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;