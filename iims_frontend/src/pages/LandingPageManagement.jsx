import React, { useEffect, useState } from 'react';
import { getLandingPage, saveLandingPage, uploadLandingPageImage } from '../api/landingPage';
import { useAuth } from '../hooks/useAuth';
import { FaRocket, FaInfoCircle, FaEnvelope, FaFolderOpen, FaCogs, FaUserPlus, FaUserTie, FaQuoteLeft, FaUsers, FaQuestionCircle, FaImages } from 'react-icons/fa';
import SocialLinksEditor from '../components/SocialLinksEditor';

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
  if (section.type === 'HERO') {
    return (
      <div className="rounded-lg p-8 text-center mb-8" style={{ background: `linear-gradient(90deg, ${color1}, ${color2}, ${color3})`, color: '#fff' }}>
        {content.logo && <img src={content.logo} alt="logo" className="h-28 w-28 mx-auto mb-4 rounded-full bg-white object-cover border-4 border-white shadow-lg" style={{objectFit: 'cover'}} />}
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2"><FaRocket /> {content.title}</h1>
        <h2 className="text-xl mb-4">{content.subtitle}</h2>
        {content.ctas && content.ctas.map((cta, idx) => (
          <button key={idx} className="bg-white text-blue-700 font-bold px-6 py-2 rounded-full shadow mx-2 mt-2 flex items-center gap-2">
            {cta.type === 'startup' ? <FaUserPlus /> : <FaUserTie />} {cta.label}
          </button>
        ))}
        {content.bgImage && <div className="mt-4"><img src={content.bgImage} alt="bg" className="rounded-lg w-full object-cover max-h-64 mx-auto" /></div>}
      </div>
    );
  }
  if (section.type === 'ABOUT') {
    return (
      <div className="rounded-lg p-8 mb-8 bg-white shadow text-center">
        {content.image && <img src={content.image} alt="about" className="h-24 w-24 mx-auto mb-4 rounded-full object-cover border-4 border-gray-200 shadow" style={{objectFit: 'cover'}} />}
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2"><FaInfoCircle /> {content.title}</h2>
        <p className="text-gray-700 text-lg">{content.description}</p>
      </div>
    );
  }
  if (section.type === 'CONTACT') {
    return (
      <div className="rounded-lg p-8 mb-8 bg-white shadow text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2"><FaEnvelope /> Contact</h2>
        <div className="text-gray-700">
          <div><b>Address:</b> {content.address}</div>
          <div><b>Email:</b> {content.email}</div>
          <div><b>Phone:</b> {content.phone}</div>
          <div><b>Socials:</b> {content.socials}</div>
        </div>
      </div>
    );
  }
  if (section.type === 'PROJECTS') {
    return (
      <div className="rounded-lg p-8 mb-8 bg-white shadow">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FaFolderOpen /> Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(content.projects || []).map((proj, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 shadow flex flex-col items-center">
              {proj.image && <img src={proj.image} alt="proj" className="h-16 mb-2 rounded" />}
              <h3 className="font-bold text-lg mb-1">{proj.title}</h3>
              <p className="text-gray-700">{proj.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (section.type === 'TESTIMONIALS') {
    return (
      <div className="rounded-lg p-8 mb-8 bg-white shadow">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FaQuoteLeft /> Testimonials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(content.testimonials || []).map((testimonial, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 shadow flex flex-col items-center">
              {testimonial.image && <img src={testimonial.image} alt="testimonial" className="h-20 w-20 mb-2 rounded-full object-cover border-4 border-gray-200 shadow" style={{objectFit: 'cover'}} />}
              <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              <p className="text-gray-700 font-bold mt-2">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (section.type === 'TEAM') {
    return (
      <div className="rounded-lg p-8 mb-8 bg-white shadow">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FaUsers /> Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(content.members || []).map((member, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 shadow flex flex-col items-center">
              {member.image && <img src={member.image} alt="team" className="h-20 w-20 mb-2 rounded-full object-cover border-4 border-gray-200 shadow" style={{objectFit: 'cover'}} />}
              <p className="text-gray-700 font-bold">{member.name}</p>
              <p className="text-gray-700">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (section.type === 'FAQ') {
    return (
      <div className="rounded-lg p-8 mb-8 bg-white shadow">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FaQuestionCircle /> FAQ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(content.faqs || []).map((faq, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 shadow">
              <p className="text-gray-700 font-bold">{faq.question}</p>
              <p className="text-gray-700 mt-2">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (section.type === 'GALLERY') {
    return (
      <div className="rounded-lg p-8 mb-8 bg-white shadow">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FaImages /> Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(content.images || []).map((image, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 shadow flex flex-col items-center">
              {image && <img src={image} alt="gallery" className="h-40 w-40 object-cover rounded-full border-4 border-gray-200 shadow" style={{objectFit: 'cover'}} />}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (section.type === 'CUSTOM') {
    return (
      <div className="rounded-lg p-8 mb-8 bg-white shadow">
        <div dangerouslySetInnerHTML={{ __html: content.html }} />
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