import React from "react";

const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 text-white border border-white/10 rounded-xl shadow-xl p-8 max-w-sm mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-500 rounded-full animate-spin animation-delay-75"></div>
          </div>
          
          {/* Message */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-white mb-1">Tales</h3>
            <p className="text-sm text-gray-300">{message}</p>
          </div>
          
          {/* Animated dots */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;