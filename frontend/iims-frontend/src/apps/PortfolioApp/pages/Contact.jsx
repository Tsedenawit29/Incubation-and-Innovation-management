import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaFacebook, FaYoutube, FaPaperPlane } from 'react-icons/fa';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#299DFF]/10 to-[#0A2D5C]/10 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-5xl bg-white/90 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left: Contact Info & Social */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between bg-gradient-to-br from-[#299DFF]/20 to-[#0A2D5C]/10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0A2D5C] mb-4 flex items-center gap-2">
              <FaEnvelope className="text-[#299DFF] text-2xl" /> Contact Us
            </h1>
            <p className="mb-8 text-[#299DFF] font-medium">We'd love to hear from you! Reach out with any questions, feedback, or partnership ideas.</p>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-[#0A2D5C]">
                <FaEnvelope className="text-[#299DFF] text-xl" />
                <a href="mailto:contact@iims.et" className="hover:underline">contact@iims.et</a>
              </div>
              <div className="flex items-center gap-3 text-[#0A2D5C]">
                <FaPhone className="text-[#299DFF] text-xl" />
                <a href="tel:+251995220266" className="hover:underline">+251 912 345 678</a>
              </div>
              <div className="flex items-center gap-3 text-[#0A2D5C]">
                <FaMapMarkerAlt className="text-[#299DFF] text-xl" />
                <span>Bahir Dar, Ethiopia</span>
              </div>
            </div>
            <div className="flex gap-4 mb-8">
              <a href="#" className="text-[#299DFF] hover:text-[#0A2D5C] text-2xl" title="LinkedIn"><FaLinkedin /></a>
              <a href="#" className="text-[#299DFF] hover:text-[#0A2D5C] text-2xl" title="Twitter"><FaTwitter /></a>
              <a href="#" className="text-[#299DFF] hover:text-[#0A2D5C] text-2xl" title="Facebook"><FaFacebook /></a>
              <a href="#" className="text-[#299DFF] hover:text-[#0A2D5C] text-2xl" title="YouTube"><FaYoutube /></a>
            </div>
          </div>
          {/* Artistic Map/Illustration Placeholder */}
          <div className="hidden md:block mt-8">
            <div className="w-full h-32 rounded-2xl bg-gradient-to-r from-[#299DFF]/20 to-[#0A2D5C]/20 flex items-center justify-center text-[#299DFF] text-3xl font-bold opacity-60">
              {/* You can replace this with an actual map or SVG illustration */}
              Map / Illustration
            </div>
          </div>
        </div>
        {/* Right: Contact Form */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center bg-white">
          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-[#299DFF] mb-6 flex items-center gap-2">
              <FaPaperPlane className="text-[#0A2D5C]" /> Send us a message
            </h2>
            <div className="mb-5">
              <label className="block mb-1 font-medium text-[#0A2D5C]">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border border-[#299DFF]/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#299DFF] bg-[#F8FBFF]" required />
            </div>
            <div className="mb-5">
              <label className="block mb-1 font-medium text-[#0A2D5C]">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border border-[#299DFF]/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#299DFF] bg-[#F8FBFF]" required />
            </div>
            <div className="mb-5">
              <label className="block mb-1 font-medium text-[#0A2D5C]">Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} className="w-full border border-[#299DFF]/30 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#299DFF] bg-[#F8FBFF]" rows={4} required />
            </div>
            <button type="submit" className="w-full bg-[#299DFF] hover:bg-[#0A2D5C] text-white font-semibold py-2 rounded-lg shadow transition-colors duration-200 flex items-center justify-center gap-2">
              <FaPaperPlane /> Send
            </button>
            {submitted && <p className="text-green-600 mt-4">Thank you for reaching out! We'll get back to you soon.</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;