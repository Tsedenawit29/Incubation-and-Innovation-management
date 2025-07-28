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

export default function SocialLinksFooter({ socialLinks }) {
  return (
    <div className="flex space-x-4 justify-center py-4">
      {SOCIALS.map(({ name, color, icon: Icon }) =>
        socialLinks && socialLinks[name] ? (
          <a
            key={name}
            href={socialLinks[name]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: color }}
            className="rounded-full p-2 hover:opacity-80 transition text-white"
            aria-label={name}
            title={name}
          >
            <Icon size={20} />
          </a>
        ) : null
      )}
    </div>
  );
} 