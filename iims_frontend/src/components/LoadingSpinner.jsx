import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-10">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="ml-3 text-lg text-gray-700">Loading...</p>
    </div>
  );
}