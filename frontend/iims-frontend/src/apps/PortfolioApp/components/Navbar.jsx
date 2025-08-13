import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav
    className="w-full flex items-center justify-between px-8 h-20 shadow-md bg-white bg-opacity-90 fixed top-0 left-0 z-50 border-b-2"
    style={{ borderBottom: '2px solid var(--brand-primary)', paddingTop: 0 }}
  >
    <div className="flex items-center">
      <Link to="/">
        <img src="/logo.jpg" alt="IIMS Logo" className="h-16 w-16 rounded-full shadow cursor-pointer logo-hover-effect transition-transform duration-300" />
      </Link>
    </div>
    <div className="flex gap-10 items-center">
      <Link
        to="/"
        className="text-xl font-semibold text-brand-dark nav-link"
        style={{ color: 'var(--brand-dark)', transition: 'color 0.2s' }}
      >
        Home
      </Link>
      <Link
        to="/application"
        className="text-xl font-semibold text-brand-dark nav-link"
        style={{ color: 'var(--brand-dark)', transition: 'color 0.2s' }}
      >
        Application
      </Link>
      <Link
        to="/documentation"
        className="text-xl font-semibold text-brand-dark nav-link"
        style={{ color: 'var(--brand-dark)', transition: 'color 0.2s' }}
      >
        Documentation
      </Link>
      <Link
        to="/contact"
        className="text-xl font-semibold text-brand-dark nav-link"
        style={{ color: 'var(--brand-dark)', transition: 'color 0.2s' }}
      >
        Contact
      </Link>
    </div>
    <style>{`
      .nav-link:hover {
        color: var(--brand-primary) !important;
      }
      .logo-hover-effect:hover {
        transform: scale(1.12) rotate(-3deg);
        box-shadow: 0 8px 24px 0 rgba(41,157,255,0.25);
      }
    `}</style>
  </nav>
);

export default Navbar;