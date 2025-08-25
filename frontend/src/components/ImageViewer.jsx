import React from 'react';
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const ImageViewer = ({isOpen, images, currentIndex, onClose, onNext, onPrev}) => {
    if (!isOpen || images.length === 0) return null;

    return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative max-w-4xl max-h-full p-4">
       
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
     
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
    
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer