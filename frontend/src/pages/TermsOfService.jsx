import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const TermsOfService = ({ searchValue, setSearchValue, showSearchInNav }) => {
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h2>
              <p className="text-xl text-gray-600">Rules for using our platform</p>
            </div>
            <div className="space-y-8 text-gray-600">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h3>
                <p>
                  By accessing or using our platform, you agree to be bound by these Terms of Service. These terms govern your use of features like travel post creation, content discovery, and community engagement.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. Use of Services</h3>
                <p>
                  You agree to use the platform only for lawful purposes, including:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Creating and sharing authentic travel posts with photos and location data.</li>
                    <li>Engaging with the community through comments and helpful votes.</li>
                    <li>Using AI-powered search and map integration for content discovery.</li>
                  </ul>
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. User Conduct</h3>
                <p>
                  You are responsible for all content you post. You agree not to:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Post content that is illegal, harmful, or violates the rights of others.</li>
                    <li>Use the platform to distribute spam or malicious content.</li>
                    <li>Attempt to bypass security or authentication systems.</li>
                  </ul>
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. Intellectual Property</h3>
                <p>
                  Content you post remains your property, but by posting, you grant us a non-exclusive license to display and distribute it on the platform. We own the platform’s design, code, and branding.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. Termination</h3>
                <p>
                  We may suspend or terminate your account if you violate these terms. You may delete your account at any time through your account settings.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h3>
                <p>
                  For questions about these Terms of Service, please contact us at hello@ceylontrails.lk.
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

export default TermsOfService;