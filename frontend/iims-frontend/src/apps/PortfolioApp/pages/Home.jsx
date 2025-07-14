import React from 'react';
import HeroSection from '../components/HeroSection';

const Home = () => (
  <div className="p-4">
    <HeroSection />
    <h2 className="text-xl font-semibold mt-6">Welcome to IIMS</h2>
    <p className="text-gray-700 mt-2">Manage startups, incubators, and innovators with ease.</p>
  </div>
);

export default Home;