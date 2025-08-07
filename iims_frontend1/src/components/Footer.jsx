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
  const shownSocials = SOCIALS.filter(({ name }) => socialLinks && socialLinks[name]);
  const iconSize = shownSocials.length > 4 ? 28 : 32;
  const iconGap = shownSocials.length > 4 ? 'gap-3' : 'gap-6';

  return (
    <footer className="w-full bg-gradient-to-br from-gray-100 via-white to-gray-200 border-t-4 border-brand-primary pt-12 pb-8 px-4 shadow-inner rounded-t-2xl" style={{ fontFamily: 'Inter, sans-serif', borderColor: themeColor }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        {/* Logo and tenant name left */}
        <div className="flex items-center gap-4 mb-8 md:mb-0 flex-shrink-0">
          {logo && <img src={logo} alt="logo" className="h-16 w-16 rounded-full object-cover shadow" />}
          {tenantName && <span className="text-2xl font-bold" style={{ color: themeColor }}>{tenantName}</span>}
        </div>
        {/* Quick Links center */}
        <div className="flex-1 flex flex-col items-center md:items-center">
          <span className="font-semibold mb-2 text-lg">Quick Links</span>
          <div className="flex flex-col gap-2">
            {links.map(link => (
              <a key={link.id} href={`#${link.id}`} className="text-gray-700 hover:text-brand-primary font-semibold transition text-base text-center" style={{ color: themeColor }}>{link.label}</a>
            ))}
          </div>
        </div>
        {/* Social icons right */}
        <div className="flex flex-col items-center md:items-end mt-8 md:mt-0 flex-shrink-0">
          <span className="font-semibold mb-2 text-lg">Connect with us</span>
          <div className={`flex ${iconGap} justify-center md:justify-end mt-1`}>
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
      <div className="text-center text-gray-500 text-sm mt-10">&copy; {new Date().getFullYear()} {tenantName || 'Landing Page'}. All rights reserved.</div>
    </footer>
  );
} 