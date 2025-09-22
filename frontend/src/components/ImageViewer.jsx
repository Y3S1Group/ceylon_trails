import React from 'react';
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const ImageViewer = ({isOpen, images, currentIndex, onClose, onNext, onPrev}) => {
    if (!isOpen || images.length === 0) return null;

    return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="relative max-w-4xl max-h-screen p-4">
       
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 -m-3 bg-white bg-opacity-50 rounded-full hover:bg-teal-500 hover:bg-opacity-70 transition-colors"
        >
          <X className="w-5 h-5 text-black hover:text-white" />
        </button>
        
        {images.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 -ml-16 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white bg-opacity-50 rounded-full hover:bg-teal-500 hover:bg-opacity-70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-black hover:text-white" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 -mr-16 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white bg-opacity-50 rounded-full hover:bg-teal-500 hover:bg-opacity-70 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-black hover:text-white" />
            </button>
          </>
        )}
     
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain"
        />
    
        {images.length > 1 && (
          <div className="absolute bottom-4 -mb-12 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-50 rounded-full px-3 py-1">
                <span className="text-black text-sm font-medium">
                  {currentIndex + 1} / {images.length}
                </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer