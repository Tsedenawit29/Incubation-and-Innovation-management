import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const defaultNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
];

function Navbar({ showSignUp, sectionLinks, logo }) {
  const location = useLocation();
  return (
    <nav className="w-full flex items-center justify-between px-8 h-20 shadow-md bg-white bg-opacity-90 fixed top-0 left-0 z-50 border-b-2">
      {/* Logo left */}
      <div className="flex items-center flex-shrink-0">
        <Link to="/">
          <img src={logo || "/logo.jpeg"} alt="IIMS Logo" className="h-14 w-14 rounded-full shadow logo-hover-effect transition-transform duration-300" />
        </Link>
      </div>
      {/* Nav links center */}
      <div className="flex-1 flex justify-center">
        <div className="flex gap-10 items-center">
          {sectionLinks && sectionLinks.length > 0
            ? sectionLinks.map(link => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className="text-xl font-semibold nav-link transition-colors duration-200 text-brand-dark hover:text-brand-primary"
                >
                  {link.label}
                </a>
              ))
            : defaultNavLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-xl font-semibold nav-link transition-colors duration-200 ${location.pathname === link.to ? 'text-brand-primary' : 'text-brand-dark'}`}
                >
                  {link.label}
                </Link>
              ))}
        </div>
      </div>
      {/* Sign Up button right (only if showSignUp) */}
      <div className="flex items-center">
        {showSignUp && (
          <Link
            to="/signup"
            className="bg-gradient-to-r from-brand-primary to-brand-dark text-white font-bold px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 text-lg focus:ring-4 focus:ring-brand-primary/40 ml-4"
          >
            Sign Up
          </Link>
        )}
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
}

export default Navbar; 