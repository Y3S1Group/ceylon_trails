import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TrailPost from "../components/TrailPost";
import { Clock, Heart, Star, TrendingUp } from "lucide-react";
import Dropdown from "../components/Dropdown";
import { useState } from "react";

const Feed = () => {
  const [filterValue, setFilterValue] = useState('recent');

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
  return (
    <div className="pt-30">
      <Navbar />
      <div className="flex items-center justify-between mb-0 pl-20 pr-20">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2 ml-16">Your Feed</h2>
          <p className="text-xl text-gray-600 ml-16">Stories from our explorers</p>
        </div>
          <Dropdown
            options={feedFilterOptions}
            defaultValue="recent"
            onChange={handleFilterChange}
            variant="detailed"
            showDescriptions={true}
            width="min-h-[30px]"
          />
        </div>
      <TrailPost 
        endpoint="all"
        showPagination={true}
        sortBy={filterValue}
      />
      <Footer />
    </div>
  );
};

export default Feed;
