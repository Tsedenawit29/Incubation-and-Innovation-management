import React, { useState } from 'react';

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
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Contact Us</h1>
      {/* Contact Info */}
      <div className="mb-8">
        <p className="mb-2">📧 <a href="mailto:contact@iims.et" className="text-blue-600 hover:underline">contact@iims.et</a></p>
        <p className="mb-2">☎️ <a href="tel:+251912345678" className="text-blue-600 hover:underline">+251 912 345 678</a></p>
        <p className="mb-2">📍 Bahir Dar, Ethiopia</p>
      </div>
      {/* Social Media Links */}
      <div className="flex gap-4 mb-8">
        <a href="#" className="text-blue-700 hover:text-blue-900 text-2xl" title="LinkedIn">🔗</a>
        <a href="#" className="text-blue-400 hover:text-blue-600 text-2xl" title="Twitter">🐦</a>
        <a href="#" className="text-blue-800 hover:text-blue-900 text-2xl" title="Facebook">📘</a>
        <a href="#" className="text-red-600 hover:text-red-800 text-2xl" title="YouTube">▶️</a>
      </div>
      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Message</label>
          <textarea name="message" value={form.message} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={4} required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send</button>
        {submitted && <p className="text-green-600 mt-4">Thank you for reaching out! We'll get back to you soon.</p>}
      </form>
    </div>
  );
};

export default Contact;