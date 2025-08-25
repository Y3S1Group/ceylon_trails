import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TrailPost from "../components/TrailPost";

const Feed = () => {
  return (
    <div className="pt-30">
      <Navbar />
      <div className="flex items-center justify-between mb-0 pl-50 pr-50">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Your Feed</h2>
          <p className="text-xl text-gray-600">Stories from our explorers</p>
        </div>
          <select className="bg-white border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors text-sm">
            <option>Most Recent</option>
            <option>Most Popular</option>
            <option>Highest Rated</option>
          </select>
        </div>
      <TrailPost />
      <Footer />
    </div>
  );
};

export default Feed;
