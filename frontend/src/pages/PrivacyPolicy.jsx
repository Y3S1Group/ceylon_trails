import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const PrivacyPolicy = ({ searchValue, setSearchValue, showSearchInNav }) => {
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
              <p className="text-xl text-gray-600">How we handle your data</p>
            </div>
            <div className="space-y-8 text-gray-600">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h3>
                <p>
                  This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our platform to preserve, share, and discover authentic Sri Lankan travel experiences. We are committed to protecting your privacy and ensuring a secure user experience.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h3>
                <p>
                  We collect personal information such as your name, email address, and username during registration and authentication. We also collect travel posts, including photos and location data, as well as usage data like browsing history and interactions with posts (e.g., comments, likes).
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h3>
                <p>
                  Your information is used to:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Provide and personalize your experience on the platform.</li>
                    <li>Enable content discovery through AI-powered search and browsable feeds.</li>
                    <li>Support community engagement features like comments and helpful votes.</li>
                    <li>Improve our services and ensure platform security.</li>
                  </ul>
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. Sharing Your Information</h3>
                <p>
                  We do not sell your personal information. We may share data with trusted third parties for analytics, map integration, or legal compliance. All third parties are bound by strict confidentiality agreements.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h3>
                <p>
                  You have the right to access, correct, or delete your personal information. You can manage your data through your account settings or by contacting us at hello@ceylontrails.lk. You may also opt out of certain data collection, though this may limit some platform features.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h3>
                <p>
                  For questions about this Privacy Policy, please contact us at hello@ceylontrails.lk. We are committed to addressing your concerns promptly.
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

export default PrivacyPolicy;