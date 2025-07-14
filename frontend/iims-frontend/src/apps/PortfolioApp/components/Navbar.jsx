import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
    <h1 className="text-lg font-bold">IIMS</h1>
    <div className="space-x-4">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/projects" className="hover:underline">Projects</Link>
      <Link to="/contact" className="hover:underline">Contact</Link>
    </div>
  </nav>
);

export default Navbar;