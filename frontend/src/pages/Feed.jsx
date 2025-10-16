import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TrailPost from "../components/TrailPost";
import { Clock, Heart, Search, X } from "lucide-react";
import Dropdown from "../components/Dropdown";
import { useState } from "react";

const Feed = () => {
  const [filterValue, setFilterValue] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const feedFilterOptions = [
    { 
      value: 'recent', 
      label: 'Most Recent', 
      icon: <Clock className="w-4 h-4" />,
      description: 'Latest adventures'
    },
    { 
      value: 'popular', 
      label: 'Most Popular', 
      icon: <Heart className="w-4 h-4" />,
      description: 'Trending trails'
    }
  ];

  const handleFilterChange = (value, option) => {
    console.log('Filter changed to:', value, option);
    setFilterValue(value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setSearchQuery(searchInput);
    }
  };

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  return (
  <div className="pt-14">
    {/* Sticky Navbar + Header */}
    <div className="sticky top-16 z-50 mt-10 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
      <Navbar />

      <div className="px-18 pt-4 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Your Feed</h2>
            <p className="text-xl text-gray-600">Stories from our explorers</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 w-full sm:w-auto">
              {/* Search Icon */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-teal-600" />
              </div>

              {/* Input Field */}
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Search by location or tags"
                className="
                  w-full md:w-120  pl-10 pr-24 py-2 h-15
                  border-2 border-gray-200 rounded-2xl
                  shadow-xs hover:shadow-md hover:border-teal-300
                  focus:outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-200
                  transition-all duration-200
                  text-gray-900 placeholder-gray-400
                "
              />

              {/* Clear Button */}
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-26 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-200/80"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Search Button */}
              <button
                onClick={handleSearchClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2
                          bg-teal-600 text-white rounded-xl
                          hover:bg-teal-700 transition-colors font-medium"
              >
                Search
              </button>
            </div>

            {/* Filter Dropdown */}
            <Dropdown
              options={feedFilterOptions}
              defaultValue="recent"
              onChange={handleFilterChange}
              variant="detailed"
              showDescriptions={true}
              width="min-h-[30px] w-full sm:w-auto"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Feed Content */}
    <div className="px-6 pt-6 pb-4">
      <TrailPost
        endpoint="all"
        showPagination={true}
        sortBy={filterValue}
        searchQuery={searchQuery}
        page={page}
        onPageChange={setPage}
      />
    </div>

    <Footer />
  </div>
);

};

export default Feed;