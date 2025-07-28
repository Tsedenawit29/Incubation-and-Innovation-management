import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaGithub } from "react-icons/fa";

const SOCIALS = [
  { name: "Facebook", color: "#1877F3", icon: FaFacebook, description: "Your Facebook page URL" },
  { name: "Twitter", color: "#1DA1F2", icon: FaTwitter, description: "Your Twitter profile URL" },
  { name: "LinkedIn", color: "#0077B5", icon: FaLinkedin, description: "Your LinkedIn company page" },
  { name: "Instagram", color: "#E4405F", icon: FaInstagram, description: "Your Instagram profile URL" },
  { name: "YouTube", color: "#FF0000", icon: FaYoutube, description: "Your YouTube channel URL" },
  { name: "GitHub", color: "#333", icon: FaGithub, description: "Your GitHub profile URL" },
];

export default function SocialLinksEditor({ socialLinks, setSocialLinks }) {
  return (
    <div className="space-y-4">
      {SOCIALS.map(({ name, color, icon: Icon, description }) => (
        <div key={name} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
              style={{ background: color }}
            >
              <Icon size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">{name}</label>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
          <input
            type="url"
            placeholder={`https://${name.toLowerCase()}.com/your-profile`}
            value={socialLinks[name] || ""}
            onChange={e => setSocialLinks({ ...socialLinks, [name]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      ))}
      
      {Object.keys(socialLinks).filter(key => socialLinks[key]).length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
            </svg>
          </div>
          <p className="text-sm">No social links added yet</p>
          <p className="text-xs mt-1">Add your social media profiles to connect with visitors</p>
        </div>
      )}
    </div>
  );
} 