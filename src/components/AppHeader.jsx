import React from "react";

const AppHeader = () => {
  return (
    <div className="my-8 text-center p-5">
      <div className="relative inline-block">
        <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent animate-pulse">
          Tales
        </p>
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
      </div>
      <p className="text-lg text-gray-600 mt-3 font-medium">For Journeys Worth Remembering</p>
      <div className="flex justify-center items-center mt-4 space-x-2">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
      </div>
    </div>
  );
};

export default AppHeader; 