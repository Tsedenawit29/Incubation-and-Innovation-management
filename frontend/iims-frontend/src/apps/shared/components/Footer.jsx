import React from 'react';

const Footer = () => (
  <footer className="bg-[#0A2D5C] text-white py-10 px-4 mt-8">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
      {/* Logo and Brand Statement */}
      <div className="flex flex-col items-center md:items-start gap-3">
        <img src="/logo.jpeg" alt="IIMS Logo" className="h-14 w-14 rounded-full shadow mb-2" />
        <span className="text-xl font-bold tracking-wide">Innovation Incubation Management System</span>
        <p className="text-sm text-blue-100 max-w-xs text-center md:text-left">
          Empowering Ethiopian startups and innovators with world-class incubation, mentorship, and digital tools for global success.
        </p>
      </div>
      {/* Quick Links */}
      <div className="flex flex-col gap-2 items-center md:items-start">
        <span className="font-semibold text-blue-200 mb-2">Quick Links</span>
        <a href="/" className="hover:text-[#299DFF] transition-colors">Home</a>
        <a href="/projects" className="hover:text-[#299DFF] transition-colors">Projects</a>
        <a href="/contact" className="hover:text-[#299DFF] transition-colors">Contact</a>
      </div>
      {/* Contact Info */}
      <div className="flex flex-col gap-2 items-center md:items-start">
        <span className="font-semibold text-blue-200 mb-2">Contact</span>
        <a href="mailto:contact@iims.et" className="hover:text-[#299DFF] transition-colors">contact@iims.et</a>
        <a href="tel:+251912345678" className="hover:text-[#299DFF] transition-colors">+251 912 345 678</a>
        <span>Bahir Dar, Ethiopia</span>
      </div>
    </div>
    <div className="border-t border-blue-900 mt-8 pt-6 text-center text-blue-200 text-sm">
      &copy; {new Date().getFullYear()} Innovation Incubation Management System. All rights reserved.
    </div>
  </footer>
);

export default Footer;