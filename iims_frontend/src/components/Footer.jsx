import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaGithub } from "react-icons/fa";

const SOCIALS = [
  { name: "Facebook", color: "#1877F3", icon: FaFacebook },
  { name: "Twitter", color: "#1DA1F2", icon: FaTwitter },
  { name: "LinkedIn", color: "#0077B5", icon: FaLinkedin },
  { name: "Instagram", color: "#E4405F", icon: FaInstagram },
  { name: "YouTube", color: "#FF0000", icon: FaYoutube },
  { name: "GitHub", color: "#333", icon: FaGithub },
];

export default function Footer({ logo, tenantName, links, socialLinks, themeColor }) {
  // Count how many social icons are shown
  const shownSocials = SOCIALS.filter(({ name }) => socialLinks && socialLinks[name]);
  const iconSize = shownSocials.length > 4 ? 28 : 32;
  const iconGap = shownSocials.length > 4 ? 'gap-3' : 'gap-6';

  return (
    <footer className="w-full bg-gray-50 border-t-4 border-brand-primary pt-12 pb-8 px-4 shadow-inner rounded-t-2xl" style={{ fontFamily: 'Inter, sans-serif', borderColor: themeColor }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          {logo && <img src={logo} alt="logo" className="h-16 w-16 rounded-full object-cover shadow" />}
          {tenantName && <span className="text-2xl font-bold" style={{ color: themeColor }}>{tenantName}</span>}
        </div>
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex flex-col gap-3 text-center md:text-left">
            <span className="font-semibold mb-1 text-lg">Quick Links</span>
            {links.map(link => (
              <a key={link.id} href={`#${link.id}`} className="text-gray-700 hover:text-brand-primary font-semibold transition text-base" style={{ color: themeColor }}>{link.label}</a>
            ))}
          </div>
          <div className="flex flex-col gap-3 text-center md:text-left mt-4 md:mt-0">
            <span className="font-semibold mb-1 text-lg">Connect with us</span>
            <div className={`flex ${iconGap} justify-center md:justify-start`}>
              {shownSocials.map(({ name, color, icon: Icon }) =>
                <a
                  key={name}
                  href={socialLinks[name]}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: color, boxShadow: `0 0 0 2px ${themeColor}33` }}
                  className={`rounded-full p-3 hover:ring-4 hover:ring-[${themeColor}] focus:ring-4 focus:ring-[${themeColor}] transition text-white shadow`}
                  aria-label={name}
                  title={name}
                >
                  <Icon size={iconSize} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-500 text-sm mt-10">&copy; {new Date().getFullYear()} {tenantName || 'Landing Page'}. All rights reserved.</div>
    </footer>
  );
} 