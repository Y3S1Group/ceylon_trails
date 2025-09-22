import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TrailPost from "../components/TrailPost";
import { Clock, Star, TrendingUp } from "lucide-react";
import Dropdown from "../components/Dropdown";

const Feed = () => {

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
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Trending trails'
    },
    { 
      value: 'rated', 
      label: 'Highest Rated', 
      icon: <Star className="w-4 h-4" />,
      description: 'Top rated experiences'
    }
  ];

  const handleFilterChange = (value, option) => {
    console.log('Filter changed to:', value, option);
    // Add your filter logic here
  };
  return (
    <div className="pt-30">
      <Navbar />
      <div className="flex items-center justify-between mb-0 pl-20 pr-20">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Your Feed</h2>
          <p className="text-xl text-gray-600">Stories from our explorers</p>
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
      <TrailPost />
      <Footer />
    </div>
  );
};

export default Feed;
