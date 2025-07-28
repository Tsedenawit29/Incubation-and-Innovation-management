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

  const handleImage = async (field, e, idx = null, arrField = null) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadLandingPageImage(tenantId, file, token);
      let newContent = { ...content };
      if (arrField && idx !== null) {
        const arr = [...(newContent[arrField] || [])];
        arr[idx][field] = url;
        newContent[arrField] = arr;
      } else if (arrField === 'images' && idx !== null) {
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

  if (section.type === 'HERO') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">Logo:</label>
          <input type="file" accept="image/*" onChange={e => handleImage('logo', e)} className="w-full" />
          {uploading && <p className="text-blue-600">Uploading logo...</p>}
          {uploadError && <p className="text-red-500">{uploadError}</p>}
          {content.logo && <img src={content.logo} alt="logo" className="h-16 my-2" />}
        </div>
        <div>
          <label className="block font-semibold mb-2">Background Image:</label>
          <input type="file" accept="image/*" onChange={e => handleImage('bgImage', e)} className="w-full" />
          {uploading && <p className="text-blue-600">Uploading background image...</p>}
          {uploadError && <p className="text-red-500">{uploadError}</p>}
          {content.bgImage && <img src={content.bgImage} alt="bg" className="h-24 my-2 w-full object-cover rounded" />}
        </div>
        <div>
          <label className="block font-semibold mb-2">Title:</label>
          <input 
            className="w-full border rounded p-2" 
            value={content.title || ''} 
            onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, title: e.target.value }) })} 
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Subtitle:</label>
          <input 
            className="w-full border rounded p-2" 
            value={content.subtitle || ''} 
            onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, subtitle: e.target.value }) })} 
          />
        </div>
      </div>
    );
  }

  if (section.type === 'ABOUT') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">Title:</label>
          <input 
            className="w-full border rounded p-2" 
            value={content.title || ''} 
            onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, title: e.target.value }) })} 
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Description:</label>
          <textarea 
            className="w-full border rounded p-2 h-32" 
            value={content.description || ''} 
            onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, description: e.target.value }) })} 
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Image:</label>
          <input type="file" accept="image/*" onChange={e => handleImage('image', e)} className="w-full" />
          {content.image && <img src={content.image} alt="about" className="h-32 my-2 w-full object-cover rounded" />}
        </div>
      </div>
    );
  }

  if (section.type === 'CONTACT') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">Address:</label>
          <input 
            className="w-full border rounded p-2" 
            value={content.address || ''} 
            onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, address: e.target.value }) })} 
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Email:</label>
          <input 
            type="email"
            className="w-full border rounded p-2" 
            value={content.email || ''} 
            onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, email: e.target.value }) })} 
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Phone:</label>
          <input 
            className="w-full border rounded p-2" 
            value={content.phone || ''} 
            onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, phone: e.target.value }) })} 
          />
        </div>
        <SocialLinksEditor 
          socialLinks={content.socials || {}} 
          setSocialLinks={(socials) => onChange({ ...section, contentJson: JSON.stringify({ ...content, socials }) })} 
        />
      </div>
    );
  }

  return (
    <div className="p-4 border rounded">
      <p className="text-gray-600">Section type "{section.type}" editor coming soon...</p>
    </div>
  );
}

export default function LandingPageManagement() {
  const { user, token } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.tenantId) {
      loadLandingPage();
    }
  }, [user?.tenantId]);

  const loadLandingPage = async () => {
    try {
      setLoading(true);
      const data = await getLandingPage(user.tenantId);
      setSections(data.sections || []);
    } catch (err) {
      console.error('Failed to load landing page:', err);
      setError('Failed to load landing page');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (idx, newSection) => {
    const newSections = [...sections];
    newSections[idx] = newSection;
    setSections(newSections);
  };

  const addSection = (type) => {
    const newSection = {
      id: Date.now(),
      type,
      contentJson: JSON.stringify(defaultSectionContent[type] || {}),
      order: sections.length
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (idx) => {
    const newSections = sections.filter((_, i) => i !== idx);
    setSections(newSections);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await saveLandingPage(user.tenantId, { sections }, token);
      setSuccess('Landing page saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save landing page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Landing Page Management</h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Section</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {SECTION_TYPES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => addSection(value)}
                  className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-2xl text-gray-600 mb-2">{icon}</div>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {sections.map((section, idx) => (
              <div key={section.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {SECTION_TYPES.find(s => s.value === section.type)?.label || section.type}
                  </h3>
                  <button
                    onClick={() => removeSection(idx)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>
                <SectionEditor
                  section={section}
                  onChange={(newSection) => handleSectionChange(idx, newSection)}
                  tenantId={user.tenantId}
                />
              </div>
            ))}
          </div>

          {sections.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No sections added yet.</p>
              <p className="text-sm">Click on a section type above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 