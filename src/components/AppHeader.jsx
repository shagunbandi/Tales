import React from "react";

const AppHeader = () => {
  return (
    <div className="my-8 p-5 text-center">
      <div className="relative inline-block">
        <p className="animate-pulse bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-5xl font-bold text-transparent">
          Tales
        </p>
        <div className="absolute -top-2 -right-2 h-3 w-3 animate-bounce rounded-full bg-yellow-400"></div>
        <div className="absolute -bottom-1 -left-1 h-2 w-2 animate-ping rounded-full bg-blue-400"></div>
      </div>
      <p className="mt-3 text-lg font-medium text-gray-600">
        For Journeys Worth Remembering
      </p>
      <div className="mt-4 flex items-center justify-center space-x-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-purple-400"></div>
        <div
          className="h-2 w-2 animate-pulse rounded-full bg-pink-400"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="h-2 w-2 animate-pulse rounded-full bg-indigo-400"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
    </div>
  );
};

export default AppHeader;
