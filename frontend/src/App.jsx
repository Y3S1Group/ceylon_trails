import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Explore from './pages/Explore';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './hooks/useAuth';

function ProtectedRoute({ element }) {
  const { isLoggedIn, authLoading } = useAuth();

  if (authLoading) {
    return <div>Loading...</div>; // ✅ wait until we know auth status
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
