import React, { useEffect, useState } from 'react';
import { getLandingPage, saveLandingPage, uploadLandingPageImage } from '../api/landingPage';
import { useAuth } from '../hooks/useAuth';
import { FaRocket, FaInfoCircle, FaEnvelope, FaFolderOpen, FaCogs, FaUserPlus, FaUserTie, FaQuoteLeft, FaUsers, FaQuestionCircle, FaImages } from 'react-icons/fa';
import SocialLinksEditor from '../components/SocialLinksEditor';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import '../index.css';

const SECTION_TYPES = [
  { value: 'HERO', label: 'Hero', icon: <FaRocket /> },
  { value: 'ABOUT', label: 'About', icon: <FaInfoCircle /> },
  { value: 'CONTACT', label: 'Contact', icon: <FaEnvelope /> },
  { value: 'PROJECTS', label: 'Projects', icon: <FaFolderOpen /> },
  { value: 'TESTIMONIALS', label: 'Testimonials', icon: <FaQuoteLeft /> },
  { value: 'TEAM', label: 'Team', icon: <FaUsers /> },
  { value: 'FAQ', label: 'FAQ', icon: <FaQuestionCircle /> },
  { value: 'GALLERY', label: 'Gallery', icon: <FaImages /> },
  { value: 'CUSTOM', label: 'Custom', icon: <FaCogs /> },
];

const defaultSectionContent = {
  HERO: { title: '', subtitle: '', logo: '', bgImage: '', ctas: [{ label: 'Apply as Startup', type: 'startup', action: 'modal' }, { label: 'Become a Mentor', type: 'mentor', action: 'modal' }] },
  ABOUT: { title: '', description: '', image: '' },
  CONTACT: { address: '', email: '', phone: '', socials: '' },
  PROJECTS: { projects: [{ title: '', description: '', image: '' }] },
  TESTIMONIALS: { layout: 'carousel', testimonials: [{ name: '', quote: '', image: '' }] },
  TEAM: { members: [{ name: '', role: '', image: '' }] },
  FAQ: { faqs: [{ question: '', answer: '' }] },
  GALLERY: { layout: 'grid', images: [''] },
  CUSTOM: { html: '' },
};

function SectionEditor({ section, onChange, tenantId }) {
  const { token } = useAuth();
  const content = section.contentJson ? JSON.parse(section.contentJson) : defaultSectionContent[section.type] || {};
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Helper for image upload (handles nested arrays)
  const handleImage = async (field, e, idx = null, arrField = null) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadLandingPageImage(tenantId, file, token);
      let newContent = { ...content };
      if (arrField && idx !== null) {
        // For nested array fields (e.g., projects, testimonials, team, gallery)
        const arr = [...(newContent[arrField] || [])];
        arr[idx][field] = url;
        newContent[arrField] = arr;
      } else if (arrField === 'images' && idx !== null) {
        // For gallery images (array of strings)
        const arr = [...(newContent.images || [])];
        arr[idx] = url;
        newContent.images = arr;
      } else {
        newContent[field] = url;
      }
      onChange({ ...section, contentJson: JSON.stringify(newContent) });
    } catch (err) {
      setUploadError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Section-specific editors
  if (section.type === 'HERO') {
    return (
      <div>
        <label className="block font-semibold">Logo:</label>
        <input type="file" accept="image/*" onChange={e => handleImage('logo', e)} />
        {uploading && <p>Uploading logo...</p>}
        {uploadError && <p className="text-red-500">{uploadError}</p>}
        {content.logo && <img src={content.logo} alt="logo" className="h-16 my-2" />}
        <label className="block font-semibold">Background Image:</label>
        <input type="file" accept="image/*" onChange={e => handleImage('bgImage', e)} />
        {uploading && <p>Uploading background image...</p>}
        {uploadError && <p className="text-red-500">{uploadError}</p>}
        {content.bgImage && <img src={content.bgImage} alt="bg" className="h-24 my-2 w-full object-cover" />}
        <label className="block font-semibold">Title:</label>
        <input className="w-full border rounded p-1 mb-2" value={content.title} onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, title: e.target.value }) })} />
        <label className="block font-semibold">Subtitle:</label>
        <input className="w-full border rounded p-1 mb-2" value={content.subtitle} onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, subtitle: e.target.value }) })} />
        <label className="block font-semibold">CTAs:</label>
        {content.ctas && content.ctas.map((cta, idx) => (
          <div key={idx} className="flex gap-2 mb-1">
            <input className="border rounded p-1" value={cta.label} onChange={e => {
              const ctas = [...content.ctas];
              ctas[idx].label = e.target.value;
              onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
            }} />
            <select value={cta.type} onChange={e => {
              const ctas = [...content.ctas];
              ctas[idx].type = e.target.value;
              onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
            }}>
              <option value="startup">Startup</option>
              <option value="mentor">Mentor</option>
            </select>
            <button onClick={() => {
              const ctas = content.ctas.filter((_, i) => i !== idx);
              onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
            }} className="text-red-500">Remove</button>
          </div>
        ))}
        <button onClick={() => {
          const ctas = [...(content.ctas || []), { label: '', type: 'startup' }];
          onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
        }} className="bg-blue-500 text-white px-2 py-1 rounded">Add CTA</button>
      </div>
    );
  }
  if (section.type === 'ABOUT') {
    return (
      <div>
        <label className="block font-semibold">Image:</label>
        <input type="file" accept="image/*" onChange={e => handleImage('image', e)} />
        {uploading && <p>Uploading about image...</p>}
        {uploadError && <p className="text-red-500">{uploadError}</p>}
        {content.image && <img src={content.image} alt="about" className="h-20 my-2" />}
        <label className="block font-semibold">Title:</label>
        <input className="w-full border rounded p-1 mb-2" value={content.title} onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, title: e.target.value }) })} />
        <label className="block font-semibold">Description:</label>
        <textarea className="w-full border rounded p-1 mb-2" value={content.description} onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, description: e.target.value }) })} />
      </div>
    );
  }
  if (section.type === 'CONTACT') {
    return (
      <div>
        <label className="block font-semibold">Address:</label>
        <input className="w-full border rounded p-1 mb-2" value={content.address} onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, address: e.target.value }) })} />
        <label className="block font-semibold">Email:</label>
        <input className="w-full border rounded p-1 mb-2" value={content.email} onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, email: e.target.value }) })} />
        <label className="block font-semibold">Phone:</label>
        <input className="w-full border rounded p-1 mb-2" value={content.phone} onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, phone: e.target.value }) })} />
        <label className="block font-semibold">Socials (comma separated):</label>
        <input className="w-full border rounded p-1 mb-2" value={content.socials} onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, socials: e.target.value }) })} />
      </div>
    );
  }
  if (section.type === 'PROJECTS') {
    return (
      <div>
        <label className="block font-semibold">Projects:</label>
        {(content.projects || []).map((proj, idx) => (
          <div key={idx} className="border p-2 mb-2 rounded">
            <input className="w-full border rounded p-1 mb-1" placeholder="Title" value={proj.title} onChange={e => {
              const projects = [...content.projects];
              projects[idx].title = e.target.value;
              onChange({ ...section, contentJson: JSON.stringify({ ...content, projects }) });
            }} />
            <textarea className="w-full border rounded p-1 mb-1" placeholder="Description" value={proj.description} onChange={e => {
              const projects = [...content.projects];
              projects[idx].description = e.target.value;
              onChange({ ...section, contentJson: JSON.stringify({ ...content, projects }) });
            }} />
            <input type="file" accept="image/*" onChange={e => handleImage('image', e, idx, 'projects')} />
            {uploading && <p>Uploading project image...</p>}
            {uploadError && <p className="text-red-500">{uploadError}</p>}
            {proj.image && <img src={proj.image} alt="proj" className="h-16 my-2" />}
            <button onClick={() => {
              const projects = content.projects.filter((_, i) => i !== idx);
              onChange({ ...section, contentJson: JSON.stringify({ ...content, projects }) });
            }} className="text-red-500">Remove</button>
          </div>
        ))}
        <button onClick={() => {
          const projects = [...(content.projects || []), { title: '', description: '', image: '' }];
          onChange({ ...section, contentJson: JSON.stringify({ ...content, projects }) });
        }} className="bg-blue-500 text-white px-2 py-1 rounded">Add Project</button>
      </div>
    );
  }
  if (section.type === 'TESTIMONIALS') {
    return (
      <div>
        <label className="block font-semibold">Layout:</label>
        <select value={content.layout} onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, layout: e.target.value }) })}>
          <option value="carousel">Carousel</option>
          <option value="grid">Grid</option>
        </select>
        <label className="block font-semibold">Testimonials:</label>
        {(content.testimonials || []).map((testimonial, idx) => (
          <div key={idx} className="border p-2 mb-2 rounded">
            <input className="w-full border rounded p-1 mb-1" placeholder="Name" value={testimonial.name} onChange={e => {
              const testimonials = [...content.testimonials];
              testimonials[idx].name = e.target.value;
              onChange({ ...section, contentJson: JSON.stringify({ ...content, testimonials }) });
            }} />
            <textarea className="w-full border rounded p-1 mb-1" placeholder="Quote" value={testimonial.quote} onChange={e => {
              const testimonials = [...content.testimonials];
              testimonials[idx].quote = e.target.value;
              onChange({ ...section, contentJson: JSON.stringify({ ...content, testimonials }) });
            }} />
            <input type="file" accept="image/*" onChange={e => handleImage('image', e, idx, 'testimonials')} />
            {uploading && <p>Uploading testimonial image...</p>}
            {uploadError && <p className="text-red-500">{uploadError}</p>}
            {testimonial.image && <img src={testimonial.image} alt="testimonial" className="h-16 my-2" />}
            <button onClick={() => {
              const testimonials = content.testimonials.filter((_, i) => i !== idx);
              onChange({ ...section, contentJson: JSON.stringify({ ...content, testimonials }) });
            }} className="text-red-500">Remove</button>
          </div>
        ))}
        <button onClick={() => {
          const testimonials = [...(content.testimonials || []), { name: '', quote: '', image: '' }];
          onChange({ ...section, contentJson: JSON.stringify({ ...content, testimonials }) });
        }} className="bg-blue-500 text-white px-2 py-1 rounded">Add Testimonial</button>
      </div>
    );
  }
  if (section.type === 'TEAM') {
    return (
      <div>
        <label className="block font-semibold">Members:</label>
        {(content.members || []).map((member, idx) => (
          <div key={idx} className="border p-2 mb-2 rounded">
            <input className="w-full border rounded p-1 mb-1" placeholder="Name" value={member.name} onChange={e => {
              const members = [...content.members];
              members[idx].name = e.target.value;
              onChange({ ...section, contentJson: JSON.stringify({ ...content, members }) });
            }} />
            <input className="w-full border rounded p-1 mb-1" placeholder="Role" value={member.role} onChange={e => {
              const members = [...content.members];
              members[idx].role = e.target.value;
              onChange({ ...section, contentJson: JSON.stringify({ ...content, members }) });
            }} />
            <input type="file" accept="image/*" onChange={e => handleImage('image', e, idx, 'members')} />
            {uploading && <p>Uploading team member image...</p>}
            {uploadError && <p className="text-red-500">{uploadError}</p>}
            {member.image && <img src={member.image} alt="team" className="h-16 my-2" />}
            <button onClick={() => {
              const members = content.members.filter((_, i) => i !== idx);
              onChange({ ...section, contentJson: JSON.stringify({ ...content, members }) });
            }} className="text-red-500">Remove</button>
          </div>
        ))}
        <button onClick={() => {
          const members = [...(content.members || []), { name: '', role: '', image: '' }];
          onChange({ ...section, contentJson: JSON.stringify({ ...content, members }) });
        }} className="bg-blue-500 text-white px-2 py-1 rounded">Add Member</button>
      </div>
    );
  }
  if (section.type === 'FAQ') {
    return (
      <div>
        <label className="block font-semibold">FAQs:</label>
        {(content.faqs || []).map((faq, idx) => (
          <div key={idx} className="border p-2 mb-2 rounded">
            <input className="w-full border rounded p-1 mb-1" placeholder="Question" value={faq.question} onChange={e => {
              const faqs = [...content.faqs];
              faqs[idx].question = e.target.value;
              onChange({ ...section, contentJson: JSON.stringify({ ...content, faqs }) });
            }} />
            <textarea className="w-full border rounded p-1 mb-1" placeholder="Answer" value={faq.answer} onChange={e => {
              const faqs = [...content.faqs];
              faqs[idx].answer = e.target.value;
              onChange({ ...section, contentJson: JSON.stringify({ ...content, faqs }) });
            }} />
            <button onClick={() => {
              const faqs = content.faqs.filter((_, i) => i !== idx);
              onChange({ ...section, contentJson: JSON.stringify({ ...content, faqs }) });
            }} className="text-red-500">Remove</button>
          </div>
        ))}
        <button onClick={() => {
          const faqs = [...(content.faqs || []), { question: '', answer: '' }];
          onChange({ ...section, contentJson: JSON.stringify({ ...content, faqs }) });
        }} className="bg-blue-500 text-white px-2 py-1 rounded">Add FAQ</button>
      </div>
    );
  }
  if (section.type === 'GALLERY') {
    return (
      <div>
        <label className="block font-semibold">Layout:</label>
        <select value={content.layout} onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, layout: e.target.value }) })}>
          <option value="grid">Grid</option>
          <option value="masonry">Masonry</option>
          <option value="carousel">Carousel</option>
        </select>
        <label className="block font-semibold">Images:</label>
        {(content.images || []).map((image, idx) => (
          <div key={idx} className="border p-2 mb-2 rounded">
            <input type="file" accept="image/*" onChange={e => handleImage('images', e, idx, 'images')} />
            {uploading && <p>Uploading image...</p>}
            {uploadError && <p className="text-red-500">{uploadError}</p>}
            {image && <img src={image} alt="gallery" className="h-16 my-2" />}
            <button onClick={() => {
              const images = content.images.filter((_, i) => i !== idx);
              onChange({ ...section, contentJson: JSON.stringify({ ...content, images }) });
            }} className="text-red-500">Remove</button>
          </div>
        ))}
        <button onClick={() => {
          const images = [...(content.images || []), ''];
          onChange({ ...section, contentJson: JSON.stringify({ ...content, images }) });
        }} className="bg-blue-500 text-white px-2 py-1 rounded">Add Image</button>
      </div>
    );
  }
  if (section.type === 'CUSTOM') {
    return (
      <div>
        <label className="block font-semibold">Custom HTML:</label>
        <textarea className="w-full border rounded p-1 mb-2" value={content.html} onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, html: e.target.value }) })} />
      </div>
    );
  }
  return null;
}

function SectionPreview({ section, themeColors }) {
  const content = section.contentJson ? JSON.parse(section.contentJson) : defaultSectionContent[section.type] || {};
  const color1 = themeColors[0] || '#1976d2';
  const color2 = themeColors[1] || '#43a047';
  const color3 = themeColors[2] || '#fbc02d';

  // HERO Section: Split, animated border, floating shapes, glassmorphism
  if (section.type === 'HERO') {
    return (
      <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 flex flex-col md:flex-row items-center bg-gradient-to-r from-white via-gray-50 to-gray-100 border-4 border-transparent hover:border-brand-primary transition-all duration-500">
        {/* Floating shapes */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-primary opacity-20 rounded-full animate-float z-0" />
        <div className="absolute bottom-[-50px] right-[-50px] w-52 h-52 bg-brand-dark opacity-20 rounded-full animate-float-slow z-0" />
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center z-10">
          {content.logo && (
            <div className="relative mb-4">
              <span className="absolute inset-0 rounded-full border-4 border-gradient-to-tr from-brand-primary to-brand-dark animate-spin-slow" />
              <img src={content.logo} alt="logo" className="h-28 w-28 rounded-full bg-white object-cover border-4 border-white shadow-xl relative z-10" />
            </div>
          )}
          <h1 className="text-5xl font-extrabold mb-3 flex items-center justify-center gap-2 text-brand-dark animate-fade-in-up">
            <FaRocket className="text-brand-primary animate-bounce" /> {content.title}
          </h1>
          <h2 className="text-2xl mb-6 text-gray-700 animate-fade-in-up delay-100">{content.subtitle}</h2>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {content.ctas && content.ctas.map((cta, idx) => (
              <button key={idx} className="bg-gradient-to-r from-brand-primary to-brand-dark text-white font-bold px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 text-lg flex items-center gap-2">
                {cta.type === 'startup' ? <FaUserPlus /> : <FaUserTie />} {cta.label}
              </button>
            ))}
          </div>
        </div>
        {content.bgImage && (
          <div className="flex-1 min-h-[260px] w-full relative z-10">
            <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-3xl" />
            <img src={content.bgImage} alt="bg" className="object-cover w-full h-full rounded-3xl mix-blend-multiply" />
          </div>
        )}
      </div>
    );
  }

  // ABOUT Section: Floating image, colored border, animated underline
  if (section.type === 'ABOUT') {
    return (
      <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 flex flex-col md:flex-row items-center bg-gradient-to-r from-gray-50 via-white to-gray-100 border-l-8 border-brand-primary">
        {content.image && (
          <div className="flex-1 flex items-center justify-center p-10">
            <img src={content.image} alt="about" className="h-40 w-40 rounded-full object-cover border-4 border-brand-primary shadow-xl animate-float-image" />
          </div>
        )}
        <div className="flex-1 p-10 text-center md:text-left">
          <h2 className="text-4xl font-extrabold mb-3 flex items-center gap-2 text-brand-dark relative inline-block">
            <FaInfoCircle className="text-brand-primary" /> {content.title}
            <span className="block h-1 w-24 bg-gradient-to-r from-brand-primary to-brand-dark rounded-full mt-2 animate-fade-in" />
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed animate-fade-in-up delay-100">{content.description}</p>
        </div>
      </div>
    );
  }

  // CONTACT Section: Glassmorphism, icons, animated background
  if (section.type === 'CONTACT') {
    return (
      <div className="relative rounded-3xl p-10 mb-12 bg-white/70 shadow-2xl text-center flex flex-col items-center backdrop-blur-md border border-brand-primary">
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg width="100%" height="100%">
            <circle cx="30%" cy="20%" r="60" fill="#299DFF22" />
            <circle cx="80%" cy="80%" r="40" fill="#0A2D5C22" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2 text-brand-dark z-10 animate-fade-in-up"><FaEnvelope /> Contact</h2>
        <div className="text-gray-700 space-y-2 z-10 animate-fade-in-up delay-100">
          <div className="flex items-center gap-2 justify-center"><FaInfoCircle className="text-brand-primary" /><b>Address:</b> {content.address}</div>
          <div className="flex items-center gap-2 justify-center"><FaEnvelope className="text-brand-primary" /><b>Email:</b> {content.email}</div>
          <div className="flex items-center gap-2 justify-center"><FaRocket className="text-brand-primary" /><b>Phone:</b> {content.phone}</div>
          <div className="flex items-center gap-2 justify-center"><FaUsers className="text-brand-primary" /><b>Socials:</b> {content.socials}</div>
        </div>
      </div>
    );
  }

  // PROJECTS Section: Masonry grid, animated overlay
  if (section.type === 'PROJECTS') {
    return (
      <div className="rounded-3xl p-10 mb-12 bg-white shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-brand-dark animate-fade-in-up"><FaFolderOpen /> Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {(content.projects || []).map((proj, idx) => (
            <div key={idx} className="relative group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-xl flex flex-col items-center overflow-hidden hover:scale-105 transition-transform">
              {proj.image && (
                <div className="relative w-full h-40 mb-4 overflow-hidden rounded-xl">
                  <img src={proj.image} alt="proj" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">{proj.title}</span>
                  </div>
                </div>
              )}
              <h3 className="font-bold text-xl mb-2 text-brand-dark group-hover:underline transition-all">{proj.title}</h3>
              <p className="text-gray-700 text-center">{proj.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TESTIMONIALS Section: 3D carousel, speech bubble, colored ring
  if (section.type === 'TESTIMONIALS') {
    return (
      <div className="rounded-3xl p-10 mb-12 bg-gradient-to-br from-white to-blue-50 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-brand-dark animate-fade-in-up"><FaQuoteLeft /> Testimonials</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={40}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop
        >
          {(content.testimonials || []).map((testimonial, idx) => (
            <SwiperSlide key={idx}>
              <div className="relative bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center max-w-xl mx-auto group">
                {testimonial.image && (
                  <div className="relative mb-4">
                    <span className="absolute inset-0 rounded-full border-4 border-gradient-to-tr from-brand-primary to-brand-dark animate-spin-slow" />
                    <img src={testimonial.image} alt="testimonial" className="w-24 h-24 rounded-full border-4 border-brand-primary object-cover shadow-xl relative z-10" />
                  </div>
                )}
                <div className="relative bg-brand-primary/10 rounded-xl px-6 py-4 mb-4 shadow-lg speech-bubble">
                  <p className="text-xl italic text-brand-dark text-center animate-fade-in-up">"{testimonial.quote}"</p>
                </div>
                <div className="text-brand-dark font-semibold text-lg animate-fade-in-up delay-100">{testimonial.name}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  // TEAM Section: Floating avatars, animated border, hover effect
  if (section.type === 'TEAM') {
    return (
      <div className="rounded-3xl p-10 mb-12 bg-white shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-brand-dark animate-fade-in-up"><FaUsers /> Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {(content.members || []).map((member, idx) => (
            <div key={idx} className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-xl flex flex-col items-center hover:scale-105 transition-transform group border-2 border-transparent hover:border-brand-primary">
              {member.image && (
                <img src={member.image} alt="team" className="h-24 w-24 mb-3 rounded-full object-cover border-4 border-brand-primary shadow-xl group-hover:scale-110 transition-transform" />
              )}
              <p className="text-brand-dark font-bold text-lg mb-1">{member.name}</p>
              <p className="text-gray-700">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // FAQ Section: Accordion, animated chevron, colored border
  if (section.type === 'FAQ') {
    return (
      <div className="rounded-3xl p-10 mb-12 bg-white shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-brand-dark animate-fade-in-up"><FaQuestionCircle /> FAQ</h2>
        <div className="space-y-4">
          {(content.faqs || []).map((faq, idx) => (
            <details key={idx} className="bg-gray-50 rounded-2xl p-6 shadow group border-l-4 border-brand-primary">
              <summary className="font-semibold text-brand-dark flex items-center gap-2 cursor-pointer group-open:underline group-open:text-brand-primary transition-all">
                <span className="transition-transform group-open:rotate-90">▶</span> {faq.question}
              </summary>
              <div className="text-gray-700 mt-2 animate-fade-in-up">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    );
  }

  // GALLERY Section: Responsive grid, lightbox-ready, animated overlay
  if (section.type === 'GALLERY') {
    return (
      <div className="rounded-3xl p-10 mb-12 bg-white shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-brand-dark animate-fade-in-up"><FaImages /> Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(content.images || []).map((image, idx) => (
            <div key={idx} className="relative group overflow-hidden rounded-2xl shadow-xl hover:scale-105 transition-transform">
              <img src={image} alt={`gallery-${idx}`} className="object-cover h-40 w-full rounded-2xl group-hover:rotate-2 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-lg font-bold">Image {idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // CUSTOM Section: Glassmorphism, animated border
  if (section.type === 'CUSTOM') {
    return (
      <div className="rounded-3xl p-10 mb-12 bg-white/80 shadow-2xl border-4 border-brand-primary/30 backdrop-blur-md">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-brand-dark animate-fade-in-up"><FaCogs /> Custom Section</h2>
        <div className="prose max-w-full animate-fade-in-up" dangerouslySetInnerHTML={{ __html: content.html || '' }} />
      </div>
    );
  }
  return null;
}

export default function LandingPageManagement() {
  const { user, token } = useAuth();
  const tenantId = user?.tenantId;
  const [themeColors, setThemeColors] = useState(['#1976d2', '#43a047', '#fbc02d']);
  const [sections, setSections] = useState([]);
  const [socialLinks, setSocialLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    if (!tenantId) return;
    getLandingPage(tenantId)
      .then(data => {
        setThemeColors([data.themeColor || '#1976d2', data.themeColor2 || '#43a047', data.themeColor3 || '#fbc02d']);
        setSections((data.sections || []).map(s => ({ ...s, contentJson: s.contentJson || JSON.stringify(defaultSectionContent[s.type] || {}) })));
        setSocialLinks(data.socialLinks || {});
      })
      .finally(() => setLoading(false));
  }, [tenantId]);

  const handleSectionChange = (idx, newSection) => {
    setSections(sections => sections.map((s, i) => (i === idx ? { ...newSection, sectionOrder: i } : s)));
  };

  const addSection = (type) => {
    setSections([...sections, { type, contentJson: JSON.stringify(defaultSectionContent[type]), sectionOrder: sections.length }]);
  };

  const removeSection = idx => {
    setSections(sections => sections.filter((_, i) => i !== idx).map((s, i) => ({ ...s, sectionOrder: i })));
  };

  const moveSection = (idx, dir) => {
    const newSections = [...sections];
    const target = newSections.splice(idx, 1)[0];
    newSections.splice(idx + dir, 0, target);
    setSections(newSections.map((s, i) => ({ ...s, sectionOrder: i })));
  };

  const handleSave = () => {
    saveLandingPage(tenantId, {
      themeColor: themeColors[0],
      themeColor2: themeColors[1],
      themeColor3: themeColors[2],
      sections,
      socialLinks
    }, token).then(() => {
      const url = `/public-landing/${tenantId}`;
      setPublicUrl(url);
      alert(`Landing page saved!\nPublic URL: ${window.location.origin}${url}`);
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Landing Page Management</h2>
      {publicUrl && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border border-green-300">
          <b>Public Landing Page URL:</b> <a href={publicUrl} className="underline text-brand-primary" target="_blank" rel="noopener noreferrer">{window.location.origin}{publicUrl}</a>
        </div>
      )}
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block mb-1 font-semibold">Theme Color 1:</label>
          <input type="color" value={themeColors[0]} onChange={e => setThemeColors([e.target.value, themeColors[1], themeColors[2]])} />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Theme Color 2:</label>
          <input type="color" value={themeColors[1]} onChange={e => setThemeColors([themeColors[0], e.target.value, themeColors[2]])} />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Theme Color 3:</label>
          <input type="color" value={themeColors[2]} onChange={e => setThemeColors([themeColors[0], themeColors[1], e.target.value])} />
        </div>
      </div>
      <div className="mb-4">
        <SocialLinksEditor socialLinks={socialLinks} setSocialLinks={setSocialLinks} />
      </div>
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Sections</h3>
        {sections.map((section, idx) => (
          <div key={idx} className="border p-4 mb-4 rounded bg-gray-50">
            <div className="flex items-center mb-2 gap-2">
              <span className="text-xl">{SECTION_TYPES.find(t => t.value === section.type)?.icon}</span>
              <span className="font-bold mr-2">{SECTION_TYPES.find(t => t.value === section.type)?.label}</span>
              <button disabled={idx === 0} onClick={() => moveSection(idx, -1)} className="mr-1">↑</button>
              <button disabled={idx === sections.length - 1} onClick={() => moveSection(idx, 1)} className="mr-1">↓</button>
              <button onClick={() => removeSection(idx)} className="text-red-500">Remove</button>
            </div>
            <SectionEditor section={section} onChange={newSection => handleSectionChange(idx, newSection)} tenantId={tenantId} />
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          {SECTION_TYPES.map(st => (
            <button key={st.value} onClick={() => addSection(st.value)} className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1">
              {st.icon} Add {st.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4 flex gap-2">
        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
        <button onClick={() => setPreview(p => !p)} className="bg-gray-300 px-4 py-2 rounded">{preview ? 'Hide' : 'Show'} Preview</button>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to replace the landing page with a new one? This will clear all sections and social links.')) {
              setSections([]);
              setSocialLinks({});
            }
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Replace with New
        </button>
      </div>
      {preview && (
        <div className="border-t pt-4 mt-4 bg-white">
          <h3 className="font-semibold mb-2">Preview</h3>
          <div className="rounded p-4">
            {sections.map((section, idx) => (
              <SectionPreview key={idx} section={section} themeColors={themeColors} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 