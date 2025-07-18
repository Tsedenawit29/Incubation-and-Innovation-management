import React, { useState } from "react";

export default function Navbar({ logo, tenantName, sections, themeColor, themeColor2, themeColor3, showSignUp }) {
  const [open, setOpen] = useState(false);

  const handleScroll = (id) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: "smooth"
      });
    }
  };

  // Gradient for button and nav link hover
  const gradient = `linear-gradient(90deg, ${themeColor}, ${themeColor2}, ${themeColor3})`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-lg border-b border-gray-100" style={{ fontFamily: 'Inter, sans-serif', minHeight: 72 }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo and tenant name left */}
        <div className="flex items-center gap-3">
          {logo && <img src={logo} alt="logo" className="h-10 w-10 rounded-full object-cover shadow" />}
          {tenantName && <span className="text-2xl font-bold" style={{ color: themeColor }}>{tenantName}</span>}
        </div>
        {/* Section nav links center */}
        <div className="hidden md:flex gap-6 flex-1 justify-center">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => handleScroll(s.id)}
              className="text-lg font-medium transition"
              style={{ color: '#111', transition: 'color 0.2s' }}
              onMouseOver={e => {
                e.currentTarget.style.background = gradient;
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderRadius = '8px';
                e.currentTarget.style.padding = '0.25rem 1rem';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#111';
                e.currentTarget.style.borderRadius = '';
                e.currentTarget.style.padding = '';
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        {/* Sign Up button right */}
        {showSignUp && (
          <a
            href="/signup"
            className="text-white font-bold px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 text-lg ml-4"
            style={{ background: gradient, boxShadow: `0 4px 16px 0 ${themeColor2}33` }}
          >
            Sign Up
          </a>
        )}
        {/* Hamburger for mobile */}
        <button className="md:hidden p-2" onClick={() => setOpen(o => !o)}>
          <span className="block w-6 h-1 bg-gray-700 mb-1 rounded"></span>
          <span className="block w-6 h-1 bg-gray-700 mb-1 rounded"></span>
          <span className="block w-6 h-1 bg-gray-700 rounded"></span>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-white shadow-lg px-4 pb-4 flex flex-col gap-3">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => handleScroll(s.id)}
              className="text-lg font-medium text-left transition"
              style={{ color: '#111', transition: 'color 0.2s' }}
              onMouseOver={e => {
                e.currentTarget.style.background = gradient;
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderRadius = '8px';
                e.currentTarget.style.padding = '0.25rem 1rem';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#111';
                e.currentTarget.style.borderRadius = '';
                e.currentTarget.style.padding = '';
              }}
            >
              {s.label}
            </button>
          ))}
          {showSignUp && (
            <a
              href="/signup"
              className="mt-2 text-white font-bold px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 text-lg"
              style={{ background: gradient, boxShadow: `0 4px 16px 0 ${themeColor2}33` }}
            >
              Sign Up
            </a>
          )}
        </div>
      )}
    </nav>
  );
} 