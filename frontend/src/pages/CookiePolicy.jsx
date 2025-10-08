import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const CookiePolicy = ({ searchValue, setSearchValue, showSearchInNav }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        showSearchInNav={showSearchInNav}
      />
      <div className="py-20 bg-white mt-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h2>
              <p className="text-xl text-gray-600">How we use cookies on our platform</p>
            </div>
            <div className="space-y-8 text-gray-600">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h3>
                <p>
                  This Cookie Policy explains how we use cookies and similar technologies to enhance your experience on our platform, which helps you discover and share authentic Sri Lankan travel experiences.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. What Are Cookies?</h3>
                <p>
                  Cookies are small text files stored on your device when you visit our platform. They help us provide features like personalized feeds, secure authentication, and analytics.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h3>
                <p>
                  We use the following types of cookies:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>
                      <strong>Essential Cookies:</strong> Required for core functionality, such as user authentication and post creation.
                    </li>
                    <li>
                      <strong>Performance Cookies:</strong> Help us analyze how users interact with feeds, search, and maps.
                    </li>
                    <li>
                      <strong>Functional Cookies:</strong> Enable features like saving posts to personalized folders.
                    </li>
                  </ul>
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Use Cookies</h3>
                <p>
                  Cookies are used to:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Remember your login status for seamless access.</li>
                    <li>Enhance content discovery through AI-powered search and filters.</li>
                    <li>Track engagement with posts, comments, and helpful votes.</li>
                    <li>Provide location-based features via map integration.</li>
                  </ul>
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. Managing Cookies</h3>
                <p>
                  You can manage cookies through your browser settings or our platform’s privacy settings. Disabling cookies may limit features like personalized feeds or map functionality.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h3>
                <p>
                  For questions about our Cookie Policy, please contact us at hello@ceylontrails.lk.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiePolicy;