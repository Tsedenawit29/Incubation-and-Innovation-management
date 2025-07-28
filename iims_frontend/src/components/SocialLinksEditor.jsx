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

export default function SocialLinksEditor({ socialLinks, setSocialLinks }) {
  return (
    <div>
      <h3 className="font-bold mb-2">Social Media Links</h3>
      {SOCIALS.map(({ name, color, icon: Icon }) => (
        <div key={name} className="flex items-center mb-2">
          <span style={{ background: color }} className="rounded-full p-2 mr-2 text-white">
            <Icon size={20} />
          </span>
          <input
            type="url"
            placeholder={`Enter your ${name} URL`}
            value={socialLinks[name] || ""}
            onChange={e => setSocialLinks({ ...socialLinks, [name]: e.target.value })}
            className="border rounded px-2 py-1 flex-1"
          />
        </div>
      ))}
    </div>
  );
} 