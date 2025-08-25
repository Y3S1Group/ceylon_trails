import React from 'react'

const Footer = () => {
  return (
    <div className="bg-gradient-to-r from-teal-800 via-teal-600 to-teal-800 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Start Your Adventure</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our community and discover the unexplored beauty of Sri Lanka. Your next great adventure awaits.
          </p>
          <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg">
            Join Ceylon Trails
          </button>
        </div>
      </div>
  )
}

export default Footer