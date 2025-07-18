import React, { useState } from "react";

export default function Navbar({ logo, tenantName, sections, themeColor }) {
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

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-lg border-b border-gray-100" style={{ fontFamily: 'Inter, sans-serif', minHeight: 72 }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          {logo && <img src={logo} alt="logo" className="h-10 w-10 rounded-full object-cover shadow" />}
          {tenantName && <span className="text-2xl font-bold" style={{ color: themeColor }}>{tenantName}</span>}
        </div>
        <div className="hidden md:flex gap-6">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => handleScroll(s.id)}
              className="text-lg font-medium hover:text-brand-primary transition"
              style={{ color: themeColor }}
            >
              {s.label}
            </button>
          ))}
        </div>
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
              className="text-lg font-medium text-left hover:text-brand-primary transition"
              style={{ color: themeColor }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
} 