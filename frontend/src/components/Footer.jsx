import React from 'react';
import { MapPin, Users, Camera, Mountain, Mail, Facebook, Instagram, Twitter, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 text-white">

      <div className="max-w-7xl mx-auto px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Mountain className="w-6 h-6" />
              Ceylon Trails
            </h3>
            <p className="text-teal-200 mb-4 leading-relaxed">
              Connecting adventurers across Sri Lanka. Share your journeys, discover hidden gems, and inspire others to explore.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-teal-700 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-teal-700 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-teal-700 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:ml-14">
            <h3 className="text-xl font-bold mb-4">Explore</h3>
            <ul className="space-y-2 text-teal-200">
              <li><a href="/" className="hover:text-white transition-colors">Discover Trails</a></li>
              <li><a href="/feed" className="hover:text-white transition-colors">Posts Feed</a></li>
              <li><a href="/saved" className="hover:text-white transition-colors">Saved Posts</a></li>
              <li><a href="/profile" className="hover:text-white transition-colors">Your Profile</a></li>
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h3 className="text-xl font-bold mb-4">Compliance</h3>
            <ul className="space-y-2 text-teal-200">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/cookie" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Stats & Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            <div className="space-y-4 text-teal-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">10K+ Explorers</p>
                  <p className="text-sm">Active community</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">50K+ Posts</p>
                  <p className="text-sm">Shared adventures</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <a href="mailto:hello@trailtales.lk" className="font-semibold text-white hover:underline">
                    hello@ceylontrails.lk
                  </a>
                  <p className="text-sm">Get in touch</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-teal-700/50 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <p className="text-teal-200 text-sm">
              © {currentYear} Ceylon Trails. All rights reserved.
            </p>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;