import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import './App.css'
import Explore from './pages/Explore'
import Feed from './pages/Feed'

function App() {
  const [searchValue, setSearchValue] = useState('');
  const [showSearchInNav, setShowSearchInNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      
      const shouldShow = scrollPosition > heroHeight - 100;
      setShowSearchInNav(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={
                        <Explore
                          searchValue={searchValue}
                          setSearchValue={setSearchValue}
                          showSearchInNav={showSearchInNav}/>}/>
      <Route path='/feed' element={<Feed/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App