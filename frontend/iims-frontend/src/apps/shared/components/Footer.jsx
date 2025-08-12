import React from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaFacebook, FaEnvelope } from 'react-icons/fa';

const Footer = () => (
  <footer className="bg-[#0A2D5C] text-white py-12 px-4 mt-12 shadow-inner border-t-4 border-[#299DFF]">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
      {/* Logo and Brand Statement */}
      <div className="flex flex-col items-center md:items-start gap-4 col-span-1">
        <img src="/logo.jpeg" alt="IIMS Logo" className="h-16 w-16 rounded-full shadow mb-2 border-2 border-[#299DFF]" />
        <span className="text-xl font-bold tracking-wide leading-tight text-[#299DFF]">Innovation Incubation<br />Management System</span>
        <p className="text-sm text-blue-100 max-w-xs text-center md:text-left">
          Empowering Ethiopian startups and innovators with world-class incubation, mentorship, and digital tools for global success.
        </p>
      </div>
      {/* Quick Links */}
      <div className="flex flex-col gap-3 items-center md:items-start col-span-1">
        <span className="font-semibold text-blue-200 mb-2 text-lg">Quick Links</span>
        <Link to="/" className="hover:text-[#299DFF] transition-colors">Home</Link>
        <Link to="/application" className="hover:text-[#299DFF] transition-colors">Tenant Application</Link>
        <Link to="/application" className="hover:text-[#299DFF] transition-colors">Admin Registration</Link>
        <Link to="/documentation" className="hover:text-[#299DFF] transition-colors">FAQs / Troubleshooting</Link>
        <Link to="/contact" className="hover:text-[#299DFF] transition-colors">Contact</Link>
      </div>
      {/* Contact Info */}
      <div className="flex flex-col gap-3 items-center md:items-start col-span-1">
        <span className="font-semibold text-blue-200 mb-2 text-lg">Contact</span>
        <a href="mailto:contact@iims.et" className="hover:text-[#299DFF] transition-colors">contact@iims.et</a>
        <a href="tel:+251912345678" className="hover:text-[#299DFF] transition-colors">+251 912 345 678</a>
        <span>Bahir Dar, Ethiopia</span>
      </div>
      {/* Social Media */}
      <div className="flex flex-col gap-3 items-center md:items-start col-span-1">
        <span className="font-semibold text-blue-200 mb-2 text-lg">Follow Us</span>
        <div className="flex gap-4">
          <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="group transition-transform duration-200" title="LinkedIn">
            <FaLinkedin className="text-2xl text-blue-300 group-hover:text-[#299DFF] group-hover:scale-110 transition-all duration-200" />
          </a>
          <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="group transition-transform duration-200" title="Facebook">
            <FaFacebook className="text-2xl text-blue-300 group-hover:text-[#299DFF] group-hover:scale-110 transition-all duration-200" />
          </a>
          <a href="mailto:contact@iims.et" className="group transition-transform duration-200" title="Email">
            <FaEnvelope className="text-2xl text-blue-300 group-hover:text-[#299DFF] group-hover:scale-110 transition-all duration-200" />
          </a>
        </div>
      </div>
    </div>
    <div className="border-t border-blue-900 mt-10 pt-6 text-center text-blue-200 text-sm">
      &copy; {new Date().getFullYear()} Innovation Incubation Management System. All rights reserved.
    </div>
  </footer>
);

export default Footer;