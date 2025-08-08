import React, { useEffect, useState } from 'react';
import { getLandingPage, saveLandingPage, uploadLandingPageImage } from '../api/landingPage';
import { useAuth } from '../hooks/useAuth';
import { FaRocket, FaInfoCircle, FaEnvelope, FaFolderOpen, FaCogs, FaUserPlus, FaUserTie, FaQuoteLeft, FaUsers, FaQuestionCircle, FaImages, FaNewspaper, FaHome } from 'react-icons/fa';
import SocialLinksEditor from '../components/SocialLinksEditor';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import '../index.css';

// Helper function to construct full image URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:8081${imagePath}`;
};

const SECTION_TYPES = [
  { value: 'HERO', label: 'Hero', icon: <FaRocket /> },
  { value: 'ABOUT', label: 'About', icon: <FaInfoCircle /> },
  { value: 'CONTACT', label: 'Contact', icon: <FaEnvelope /> },
  { value: 'PROJECTS', label: 'Projects', icon: <FaFolderOpen /> },
  { value: 'TESTIMONIALS', label: 'Testimonials', icon: <FaQuoteLeft /> },
  { value: 'TEAM', label: 'Team', icon: <FaUsers /> },
  { value: 'NEWS', label: 'Latest News', icon: <FaNewspaper /> },
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
  NEWS: { title: 'Latest News & Updates', description: 'Stay updated with our latest news, announcements, and opportunities', news: [{ title: '', content: '', date: '', image: '', link: '' }] },
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
      <div className="space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => handleImage('logo', e)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {content.logo && (
              <div className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden">
                <img src={getImageUrl(content.logo)} alt="logo" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          {uploading && <p className="text-sm text-blue-600 mt-1">Uploading logo...</p>}
          {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
        </div>

        {/* Background Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
          <div className="space-y-3">
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => handleImage('bgImage', e)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {content.bgImage && (
              <div className="w-full h-32 rounded-lg border-2 border-gray-200 overflow-hidden">
                <img src={getImageUrl(content.bgImage)} alt="bg" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          {uploading && <p className="text-sm text-blue-600 mt-1">Uploading background image...</p>}
          {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={content.title || ''} 
            onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, title: e.target.value }) })} 
            placeholder="Enter your main headline..."
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
          <input 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={content.subtitle || ''} 
            onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, subtitle: e.target.value }) })} 
            placeholder="Enter your subtitle..."
          />
        </div>

        {/* CTAs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Call-to-Action Buttons</label>
          <div className="space-y-3">
            {content.ctas && content.ctas.map((cta, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    value={cta.label || ''} 
                    onChange={e => {
                      const ctas = [...content.ctas];
                      ctas[idx].label = e.target.value;
                      onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
                    }}
                    placeholder="Button text..."
                  />
                </div>
                <select 
                  value={cta.type || 'startup'} 
                  onChange={e => {
                    const ctas = [...content.ctas];
                    ctas[idx].type = e.target.value;
                    onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="startup">Startup</option>
                  <option value="mentor">Mentor</option>
                </select>
                <button 
                  onClick={() => {
                    const ctas = content.ctas.filter((_, i) => i !== idx);
                    onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
                  }} 
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove CTA"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            <button 
              onClick={() => {
                const ctas = [...(content.ctas || []), { label: '', type: 'startup' }];
                onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
              }} 
              className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add CTA Button
            </button>
          </div>
        </div>
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
        {content.image && <img src={getImageUrl(content.image)} alt="about" className="h-20 my-2" />}
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
            {proj.image && <img src={getImageUrl(proj.image)} alt="proj" className="h-16 my-2" />}
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
            {testimonial.image && <img src={getImageUrl(testimonial.image)} alt="testimonial" className="h-16 my-2" />}
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
            {member.image && <img src={getImageUrl(member.image)} alt="team" className="h-16 my-2" />}
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
            {image && <img src={getImageUrl(image)} alt="gallery" className="h-16 my-2" />}
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
  if (section.type === 'NEWS') {
    return (
      <div className="space-y-6">
        {/* Section Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
          <input 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={content.title || ''} 
            onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, title: e.target.value }) })}
            placeholder="Latest News & Updates"
          />
        </div>

        {/* Section Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Section Description</label>
          <textarea 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            rows="3"
            value={content.description || ''} 
            onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, description: e.target.value }) })}
            placeholder="Stay updated with our latest news, announcements, and opportunities"
          />
        </div>

        {/* News Items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">News Items</label>
          <div className="space-y-4">
            {(content.news || []).map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">News Title</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={item.title || ''} 
                      onChange={e => {
                        const news = [...content.news];
                        news[idx].title = e.target.value;
                        onChange({ ...section, contentJson: JSON.stringify({ ...content, news }) });
                      }}
                      placeholder="News title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={item.date || ''} 
                      onChange={e => {
                        const news = [...content.news];
                        news[idx].date = e.target.value;
                        onChange({ ...section, contentJson: JSON.stringify({ ...content, news }) });
                      }}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    rows="3"
                    value={item.content || ''} 
                    onChange={e => {
                      const news = [...content.news];
                      news[idx].content = e.target.value;
                      onChange({ ...section, contentJson: JSON.stringify({ ...content, news }) });
                    }}
                    placeholder="News content"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => handleImage('image', e, idx, 'news')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploading && <p className="text-sm text-blue-600 mt-1">Uploading image...</p>}
                    {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
                    {item.image && (
                      <div className="w-full h-32 rounded-lg border-2 border-gray-200 overflow-hidden mt-2">
                        <img src={getImageUrl(item.image)} alt="news" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (Optional)</label>
                    <input 
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={item.link || ''} 
                      onChange={e => {
                        const news = [...content.news];
                        news[idx].link = e.target.value;
                        onChange({ ...section, contentJson: JSON.stringify({ ...content, news }) });
                      }}
                      placeholder="https://example.com/news-article"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const news = content.news.filter((_, i) => i !== idx);
                    onChange({ ...section, contentJson: JSON.stringify({ ...content, news }) });
                  }} 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove News Item
                </button>
              </div>
            ))}
            
            <button 
              onClick={() => {
                const news = [...(content.news || []), { title: '', content: '', date: '', image: '', link: '' }];
                onChange({ ...section, contentJson: JSON.stringify({ ...content, news }) });
              }} 
              className="w-full bg-blue-50 text-blue-700 px-4 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add News Item
            </button>
          </div>
        </div>
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

  function SectionPreview({ section, themeColors, buttonUrls }) {
    const content = section.contentJson ? JSON.parse(section.contentJson) : {};
    const themeColor = themeColors[0] || '#111';
    const themeColor2 = themeColors[1] || themeColor;
    const themeColor3 = themeColors[2] || themeColor;

  switch (section.type) {
    case 'HERO':
      return (
        <section className="w-full min-h-[80vh] flex items-center justify-center border-b relative" style={{ fontFamily: 'Inter, sans-serif', background: '#111', position: 'relative', overflow: 'hidden' }}>
          {/* BG image overlay */}
          {content.bgImage && (
            <img
              src={getImageUrl(content.bgImage)}
              alt="bg"
              className="absolute inset-0 w-full h-full object-cover z-0"
              style={{ opacity: 0.18, filter: 'blur(1px)' }}
            />
          )}
          {/* Floating bulbs/accents */}
          <svg className="absolute left-10 top-10 w-32 h-32 opacity-30 z-10 animate-float" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill={themeColor} /></svg>
          <svg className="absolute right-10 bottom-10 w-40 h-40 opacity-20 z-10 animate-float-slow" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill={themeColor2} /></svg>
          <svg className="absolute left-1/2 top-1/2 w-24 h-24 opacity-10 z-10 animate-float-slow" style={{ transform: 'translate(-50%, -50%)' }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill={themeColor3} /></svg>
          {/* Centered content */}
          <div className="relative z-20 flex flex-col items-center justify-center w-full px-4" style={{ maxWidth: 900 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center" style={{ color: '#fff', lineHeight: 1.1 }}>
              {content.title && content.title.split(' ').map((word, i) =>
                i === content.title.split(' ').length - 1 ? (
                  <span key={i} style={{ color: themeColor2 }}> {word}</span>
                ) : (
                  <span key={i}> {word}</span>
                )
              )}
            </h1>
            {content.subtitle && (
              <h2 className="text-2xl md:text-3xl mb-10 text-center" style={{ color: '#fff', fontWeight: 400, maxWidth: 800 }}>{content.subtitle}</h2>
            )}
            <div className="flex flex-wrap gap-6 justify-center mt-2">
              {content.ctas && content.ctas[0] && (
                <a
                  href={content.ctas[0].type === 'startup' ? buttonUrls.startupSignup : buttonUrls.mentorSignup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-xl text-lg font-bold shadow-lg focus:ring-4 transition inline-block"
                  style={{ background: themeColor2, color: '#111', border: 'none', textDecoration: 'none' }}
                >
                  {content.ctas[0].label}
                </a>
              )}
              {content.ctas && content.ctas[1] && (
                <a
                  href={content.ctas[1].type === 'startup' ? buttonUrls.startupSignup : buttonUrls.mentorSignup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-xl text-lg font-bold border-2 focus:ring-4 transition inline-block"
                  style={{ background: 'transparent', color: themeColor2, borderColor: themeColor2, textDecoration: 'none' }}
                >
                  {content.ctas[1].label}
                </a>
              )}
            </div>
          </div>
        </section>
      );
    case 'ABOUT':
      return (
        <section className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: '#fff' }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 px-4">
            {content.image && <img src={getImageUrl(content.image)} alt="about" className="h-80 w-[32rem] rounded-2xl object-cover" style={{ border: `4px solid ${themeColor}`, boxShadow: `0 8px 32px 0 ${themeColor2}22` }} />}
            <div className="flex-1 p-10 flex flex-col justify-center">
              <h2 className="text-4xl font-extrabold mb-4 relative inline-block" style={{ color: themeColor2 }}>
                {content.title}
                <span className="block h-1 w-24 rounded-full mt-2 animate-fade-in absolute left-0 -bottom-3" style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor2})` }} />
              </h2>
              <p className="text-black text-lg leading-relaxed animate-fade-in-up delay-100">{content.description}</p>
            </div>
          </div>
        </section>
      );
    case 'PROJECTS':
      return (
        <section className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: themeColor + '08' }}>
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-2" style={{ color: themeColor2 }}>📁 Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {(content.projects || []).map((proj, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow flex flex-col items-center hover:scale-105 transition-transform">
                  {proj.image && <img src={getImageUrl(proj.image)} alt="proj" className="h-20 w-20 mb-2 rounded-full object-cover border-4" style={{ borderColor: themeColor2 }} />}
                  <h3 className="font-bold text-lg mb-1" style={{ color: themeColor2 }}>{proj.title}</h3>
                  <p className="text-black text-center">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case 'TESTIMONIALS':
      return (
        <section className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: '#fff' }}>
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-2" style={{ color: themeColor2 }}>💬 Testimonials</h2>
            <div className="space-y-6">
              {(content.testimonials || []).map((testimonial, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center max-w-xl mx-auto">
                  {testimonial.image && <img src={getImageUrl(testimonial.image)} alt="testimonial" className="w-20 h-20 rounded-full mb-4 border-4" style={{ borderColor: themeColor2 }} />}
                  <p className="text-lg italic text-black mb-4 text-center">"{testimonial.quote}"</p>
                  <div className="font-semibold" style={{ color: themeColor2 }}>{testimonial.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case 'TEAM':
      return (
        <section className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: themeColor + '08' }}>
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-2" style={{ color: themeColor2 }}>👥 Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {(content.members || []).map((member, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow flex flex-col items-center hover:scale-105 transition-transform">
                  {member.image && <img src={getImageUrl(member.image)} alt="team" className="h-24 w-24 mb-3 rounded-full object-cover border-4" style={{ borderColor: themeColor2 }} />}
                  <p className="font-bold text-lg mb-1" style={{ color: themeColor2 }}>{member.name}</p>
                  <p className="text-black">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case 'FAQ':
      return (
        <section className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: '#fff' }}>
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-2" style={{ color: themeColor2 }}>❓ FAQ</h2>
            <div className="space-y-4">
              {(content.faqs || []).map((faq, idx) => (
                <details key={idx} className="bg-white rounded-xl p-6 shadow group" style={{ borderLeft: `4px solid ${themeColor}` }}>
                  <summary className="font-semibold flex items-center gap-2 cursor-pointer group-open:underline transition-all" style={{ color: themeColor2 }}>
                    <span className="transition-transform group-open:rotate-90">▶</span> {faq.question}
                  </summary>
                  <div className="text-black mt-2 animate-fade-in-up">{faq.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      );
    case 'GALLERY':
      return (
        <section className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: themeColor + '08' }}>
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-2" style={{ color: themeColor2 }}>🖼️ Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(content.images || []).map((image, idx) => (
                <img key={idx} src={getImageUrl(image)} alt={`gallery-${idx}`} className="rounded-xl shadow object-cover h-40 w-full hover:scale-105 transition-transform" style={{ border: `2px solid ${themeColor2}` }} />
              ))}
            </div>
          </div>
        </section>
      );
    case 'NEWS':
      return (
        <section className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: '#fff' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2" style={{ color: themeColor2 }}>📰 {content.title || 'Latest News & Updates'}</h2>
              {content.description && (
                <p className="text-gray-600 text-lg max-w-3xl mx-auto">{content.description}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(content.news || []).map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
                  {item.image && (
                    <div className="h-48 overflow-hidden">
                      <img src={getImageUrl(item.image)} alt="news" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {item.date ? new Date(item.date).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-3" style={{ color: themeColor2 }}>{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">{item.content}</p>
                    {item.link && (
                      <a 
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                        style={{ color: themeColor }}
                      >
                        Read More
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case 'CUSTOM':
      return (
        <section className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: '#fff' }}>
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-2" style={{ color: themeColor2 }}>⚙️ Custom Section</h2>
            <div className="prose max-w-full animate-fade-in-up" style={{ color: '#111' }} dangerouslySetInnerHTML={{ __html: content.html || '' }} />
          </div>
        </section>
      );
    case 'CONTACT':
      return (
        <section className="relative py-20 border-b flex flex-col md:flex-row items-center justify-center" style={{ fontFamily: 'Inter, sans-serif', background: themeColor + '08' }}>
          <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-10 px-4">
            {/* Contact Info Card */}
            <div className="flex-1 flex flex-col items-center md:items-start justify-center p-10 z-10">
              <div className="bg-white/80 rounded-2xl shadow-xl p-8 mb-8 w-full max-w-md" style={{ borderLeft: `4px solid ${themeColor}` }}>
                <h3 className="text-2xl font-bold mb-4" style={{ color: themeColor3 || themeColor }}>Get In Touch</h3>
                {content.description && <p className="mb-4 text-gray-600 text-sm">{content.description}</p>}
                <div className="text-gray-700 space-y-2 mb-4">
                  {content.address && <div className="flex items-center gap-2"><span style={{ background: themeColor + '22' }} className="rounded-full p-2">📍</span><b>Address:</b> {content.address}</div>}
                  {content.phone && <div className="flex items-center gap-2"><span style={{ background: themeColor + '22' }} className="rounded-full p-2">📞</span><b>Phone:</b> {content.phone}</div>}
                  {content.email && <div className="flex items-center gap-2"><span style={{ background: themeColor + '22' }} className="rounded-full p-2">📧</span><b>E-Mail:</b> {content.email}</div>}
                </div>
              </div>
            </div>
            {/* Contact Form Card */}
            <div className="flex-1 flex items-center justify-center p-10 z-10">
              <form className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-4" style={{ border: `1px solid ${themeColor}33` }}>
                <h3 className="text-2xl font-bold mb-4" style={{ color: themeColor2 }}>Send a Message</h3>
                <input type="text" placeholder="Your Name" className="w-full border rounded px-4 py-3" style={{ borderColor: themeColor2, color: '#111' }} />
                <input type="email" placeholder="Your Email" className="w-full border rounded px-4 py-3" style={{ borderColor: themeColor2, color: '#111' }} />
                <textarea placeholder="Message" className="w-full border rounded px-4 py-3 min-h-[100px]" style={{ borderColor: themeColor2, color: '#111' }} />
                <button type="button" style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor2})` }} className="w-full text-white font-bold py-3 rounded-full text-lg hover:scale-105 hover:shadow-xl transition">Submit</button>
              </form>
            </div>
          </div>
        </section>
      );
    default:
      return <div className="bg-gray-100 rounded-lg p-4 mb-4">Unknown section type: {section.type}</div>;
  }
}

export default function LandingPageManagement() {
  const { user, token } = useAuth();
  const tenantId = user?.tenantId;
  const [themeColors, setThemeColors] = useState(['#1976d2', '#43a047', '#fbc02d']);
  const [sections, setSections] = useState([]);
  const [socialLinks, setSocialLinks] = useState({});
  const [buttonUrls, setButtonUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");
  const [error, setError] = useState(null);

  // Debug logging
  console.log('LandingPageManagement - User:', user);
  console.log('LandingPageManagement - Token:', token ? 'present' : 'missing');
  console.log('LandingPageManagement - TenantId:', tenantId);
  console.log('LandingPageManagement - User role:', user?.role);

  // ...existing code...
useEffect(() => {
  if (!tenantId) {
    console.log('LandingPageManagement - No tenantId available');
    setError('No tenant ID available. Please make sure you are logged in as a tenant admin.');
    setLoading(false);
    return;
  }
  if (!token) {
    console.log('LandingPageManagement - No token available');
    setError('No authentication token available. Please log in again.');
    setLoading(false);
    return;
  }
  if (user?.role !== 'TENANT_ADMIN') {
    console.log('LandingPageManagement - User does not have TENANT_ADMIN role');
    setError('Access denied. You must be a tenant admin to access this page.');
    setLoading(false);
    return;
  }
  console.log('LandingPageManagement - Fetching landing page for tenant:', tenantId);
  getLandingPage(tenantId, false, token)
    .then(data => {
      console.log('LandingPageManagement - Successfully fetched landing page data:', data);
      setThemeColors([data.themeColor || '#1976d2', data.themeColor2 || '#43a047', data.themeColor3 || '#fbc02d']);
      setSections((data.sections || []).map(s => ({ ...s, contentJson: s.contentJson || JSON.stringify(defaultSectionContent[s.type] || {}) })));
      setSocialLinks(data.socialLinks || {});
      setButtonUrls(data.buttonUrls || {});
      setError(null);
    })
    .catch(error => {
      // If 404, treat as "no landing page yet" and show empty builder
      if (error.status === 404 || (error.message && error.message.includes('404'))) {
        setSections([]);
        setSocialLinks({});
        setButtonUrls({});
        setError(null);
      } else {
        setError(`Failed to load landing page: ${error.message}`);
      }
    })
    .finally(() => setLoading(false));
}, [tenantId, token, user?.role]);
// ...existing code...

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
        socialLinks,
        buttonUrls
    }, token).then(() => {
      const url = `/public-landing/${tenantId}`;
      setPublicUrl(url);
      alert(`Landing page saved!\nPublic URL: ${window.location.origin}${url}`);
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading landing page management...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h2 className="text-lg font-bold mb-2">Error Loading Landing Page Management</h2>
          <p className="text-sm">{error}</p>
        </div>
        <button 
          onClick={() => window.location.href = '/tenant-admin/dashboard'} 
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/tenant-admin/dashboard"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <FaHome className="w-5 h-5" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Landing Page Builder</h1>
                <p className="text-gray-600 mt-1">Create and customize your landing page</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPreview(p => !p)} 
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                  preview 
                    ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {preview ? 'Hide Preview' : 'Live Preview'}
              </button>
              <button 
                onClick={handleSave} 
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save & Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Public URL Banner */}
      {publicUrl && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 mx-6 mt-6 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Landing Page Published!</h3>
                <p className="text-green-600 text-sm">Your public landing page is now live</p>
      </div>
            </div>
            <a 
              href={publicUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Live
            </a>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Settings</h3>
              </div>
              
              {/* Theme Colors */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <h4 className="font-semibold text-gray-800">Theme Colors</h4>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={themeColors[0]} 
                        onChange={e => setThemeColors([e.target.value, themeColors[1], themeColors[2]])}
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600">Primary</span>
                        <div className="text-xs text-gray-500 mt-1">Main brand color</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={themeColors[1]} 
                        onChange={e => setThemeColors([themeColors[0], e.target.value, themeColors[2]])}
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600">Secondary</span>
                        <div className="text-xs text-gray-500 mt-1">Accent and highlights</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={themeColors[2]} 
                        onChange={e => setThemeColors([themeColors[0], themeColors[1], e.target.value])}
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-gray-600">Accent</span>
                        <div className="text-xs text-gray-500 mt-1">Special elements</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* URL Configuration */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                  <h4 className="font-semibold text-gray-800">Login URLs</h4>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Startup Login URL</label>
                    <input 
                      type="url" 
                      placeholder="https://your-domain.com/login"
                      value={buttonUrls.startupSignup || ''}
                      onChange={e => setButtonUrls({...buttonUrls, startupSignup: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <div className="text-xs text-gray-500 mt-1">Where "Apply as Startup" button redirects</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mentor Login URL</label>
                    <input 
                      type="url" 
                      placeholder="https://your-domain.com/login"
                      value={buttonUrls.mentorSignup || ''}
                      onChange={e => setButtonUrls({...buttonUrls, mentorSignup: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <div className="text-xs text-gray-500 mt-1">Where "Apply as Mentor" button redirects</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Navbar Login URL</label>
                    <input 
                      type="url" 
                      placeholder="https://your-domain.com/login"
                      value={buttonUrls.navbarSignup || ''}
                      onChange={e => setButtonUrls({...buttonUrls, navbarSignup: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <div className="text-xs text-gray-500 mt-1">Where navbar "Sign Up" button redirects</div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  <h4 className="font-semibold text-gray-800">Social Links</h4>
                </div>
                <SocialLinksEditor socialLinks={socialLinks} setSocialLinks={setSocialLinks} />
      </div>

              {/* Actions */}
              <div className="space-y-3">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to replace the landing page with a new one? This will clear all sections and social links.')) {
              setSections([]);
              setSocialLinks({});
                      setButtonUrls({});
                    }
                  }}
                  className="w-full bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Reset Landing Page
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Sections */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Sections</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{sections.length} sections</span>
                </div>
              </div>

              {/* Add Section Buttons */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Add New Section</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SECTION_TYPES.map(st => (
                    <button 
                      key={st.value} 
                      onClick={() => addSection(st.value)}
                      className="bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 group"
                    >
                      <span className="text-blue-500 group-hover:text-blue-600">{st.icon}</span>
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sections List */}
              <div className="space-y-4">
                {sections.map((section, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600">{SECTION_TYPES.find(t => t.value === section.type)?.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{SECTION_TYPES.find(t => t.value === section.type)?.label}</h4>
                          <p className="text-sm text-gray-600">Section {idx + 1}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          disabled={idx === 0} 
                          onClick={() => moveSection(idx, -1)} 
                          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button 
                          disabled={idx === sections.length - 1} 
                          onClick={() => moveSection(idx, 1)} 
                          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => removeSection(idx)} 
                          className="p-2 text-red-400 hover:text-red-600"
                          title="Remove Section"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
        </button>
                      </div>
                    </div>
                    <SectionEditor section={section} onChange={newSection => handleSectionChange(idx, newSection)} tenantId={tenantId} />
                  </div>
                ))}
              </div>

              {sections.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No sections yet</h3>
                  <p className="text-gray-600 mb-4">Start building your landing page by adding sections above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
            {preview && (
        <div className="border-t pt-4 mt-4 bg-white">
          <h3 className="font-semibold mb-4 text-xl text-gray-800">Live Preview</h3>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
              <span className="text-sm text-gray-600">Preview Mode</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
              {/* Navbar Preview */}
              <div className="bg-white shadow-sm border-b sticky top-0 z-10" style={{ fontFamily: 'Inter, sans-serif', minHeight: 72 }}>
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-3">
                    {sections.find(s => s.type === 'HERO')?.contentJson && JSON.parse(sections.find(s => s.type === 'HERO').contentJson).logo && (
                      <img 
                        src={getImageUrl(JSON.parse(sections.find(s => s.type === 'HERO').contentJson).logo)} 
                        alt="logo" 
                        className="h-10 w-10 rounded-full object-cover shadow" 
                      />
                    )}
                    <span className="text-2xl font-bold" style={{ color: themeColors[0] }}>
                      {sections.find(s => s.type === 'HERO')?.contentJson ? JSON.parse(sections.find(s => s.type === 'HERO').contentJson).title || 'Landing Page' : 'Landing Page'}
                    </span>
                  </div>
                  <div className="hidden md:flex gap-6">
                    {sections.map((section, idx) => (
                      <button key={idx} className="text-lg font-medium transition" style={{ color: '#111' }}>
                        {SECTION_TYPES.find(t => t.value === section.type)?.label}
                      </button>
                    ))}
                  </div>
                  <a
                    href={buttonUrls?.navbarSignup || buttonUrls?.startupSignup || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-bold px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 text-lg ml-4"
                    style={{ 
                      background: `linear-gradient(90deg, ${themeColors[0]}, ${themeColors[1]}, ${themeColors[2]})`,
                      boxShadow: `0 4px 16px 0 ${themeColors[1] || '#1e40af'}33`
                    }}
                  >
                    Sign Up
                  </a>
                </div>
              </div>
              
              {/* Sections */}
              <div style={{ paddingTop: 80 }}>
                {sections.map((section, idx) => (
                  <SectionPreview key={idx} section={section} themeColors={themeColors} buttonUrls={buttonUrls} />
                ))}
              </div>
              
              {/* Footer Preview */}
              <div className="bg-gray-900 text-white py-8">
                <div className="max-w-6xl mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        {sections.find(s => s.type === 'HERO')?.contentJson && JSON.parse(sections.find(s => s.type === 'HERO').contentJson).logo && (
                          <img 
                            src={getImageUrl(JSON.parse(sections.find(s => s.type === 'HERO').contentJson).logo)} 
                            alt="logo" 
                            className="h-12 w-12 rounded-full object-cover shadow" 
                          />
                        )}
                        <span className="text-xl font-bold">
                          {sections.find(s => s.type === 'HERO')?.contentJson ? JSON.parse(sections.find(s => s.type === 'HERO').contentJson).title || 'Landing Page' : 'Landing Page'}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-4">Connect with us and stay updated with the latest news and opportunities.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4">Quick Links</h4>
                      <div className="space-y-2">
                        {sections.slice(0, 4).map((section, idx) => (
                          <a key={idx} href="#" className="block text-gray-400 hover:text-white text-sm">
                            {SECTION_TYPES.find(t => t.value === section.type)?.label}
                          </a>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4">Contact</h4>
                      <div className="space-y-2 text-sm text-gray-400">
                        <p>Email: info@example.com</p>
                        <p>Phone: +1 (555) 123-4567</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
                    © 2024 All rights reserved.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 