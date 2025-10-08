import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Mountain, Users, Camera, Compass, ArrowRight, MapPin, Mail } from 'lucide-react';

const AboutUs = ({ searchValue, setSearchValue, showSearchInNav }) => {
  const stats = [
    { icon: Mountain, number: "500+", label: "Trails Mapped", color: "text-teal-400 bg-teal-50" },
    { icon: Users, number: "12K+", label: "Active Explorers", color: "text-teal-400 bg-teal-50" },
    { icon: Camera, number: "50K+", label: "Photos Shared", color: "text-teal-400 bg-teal-50" },
    { icon: Compass, number: "100+", label: "Destinations", color: "text-teal-400 bg-teal-50" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        showSearchInNav={showSearchInNav}
      />
      
      {/* Hero Section with Image Banner */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1654705680706-64beb9c129b5?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Sri Lankan landscape with mountains and tea plantations"
          className="w-full h-[60vh] md:h-[70vh] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center text-white px-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-black/40 drop-shadow-xl">
              Discover Sri Lanka's Soul
            </h1>
            <p className="text-xl md:text-2xl mb-8 drop-shadow-black/40 drop-shadow-lg max-w-2xl mx-auto">
              Where travelers preserve, share, and uncover authentic adventures
            </p>
          </motion.div>
        </div>
      </motion.section>

      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-16"
          >
            {/* Our Mission Section */}
            <motion.section variants={itemVariants} className="relative">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <img
                    src="https://lakpura.com/cdn/shop/files/LK94009540-11-E.jpg?v=1656921314&width=3840"
                    alt="Explorer on a Sri Lankan trail"
                    className="w-full h-80 object-cover rounded-2xl shadow-xl border border-teal-200"
                  />
                </div>
                <div className="md:w-1/2 space-y-6">
                  <h3 className="text-3xl font-bold text-teal-600 mb-4">Our Mission</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    We are dedicated to creating a vibrant digital platform where travelers can preserve, share, and discover authentic Sri Lankan travel experiences. Through detailed stories, stunning visuals, and AI-powered search, we aim to inspire and connect explorers with the beauty and culture of Sri Lanka.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Our Community Section */}
            <motion.section variants={itemVariants} className="bg-gradient-to-r from-teal-50 to-white rounded-3xl p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="lg:w-1/2 space-y-6">
                  <h3 className="text-3xl font-bold text-teal-600 mb-4">Our Community</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Our platform thrives on the passion of our explorers. From mountain trails to coastal paths, our community shares stories, photos, and tips to help others discover Sri Lanka's hidden gems. Join over 12,000 active explorers in building a network of unforgettable adventures.
                  </p>
                </div>
                <div className="lg:w-1/2">
                  <img
                    src="https://www.bluelankatours.com/wp-content/uploads/2017/07/traditional-stilt-fishing-in-sri-lanka-2021-08-26-22-38-59-utc-min-1-scaled.jpg"
                    alt="Group of travelers sharing stories"
                    className="w-full h-80 object-cover rounded-2xl shadow-xl"
                  />
                </div>
              </div>
            </motion.section>

            {/* Our Features Section */}
            <motion.section variants={itemVariants}>
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-teal-600 mb-2">Our Features</h3>
                <p className="text-gray-600 text-lg">Seamless tools to capture and share your journey</p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  { title: "Travel Post Creation", desc: "Upload multiple photos with integrated location data.", icon: Camera },
                  { title: "AI-Powered Discovery", desc: "Smart search and browsable feeds for personalized adventures.", icon: Compass },
                  { title: "Community Engagement", desc: "Comments, helpful votes, and personalized folders.", icon: Users },
                  { title: "Interactive Maps", desc: "Visualize routes and explore destinations with ease.", icon: MapPin }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-white p-6 rounded-2xl shadow-md border border-teal-100 hover:shadow-lg transition-all duration-300 text-center"
                  >
                    <feature.icon className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;