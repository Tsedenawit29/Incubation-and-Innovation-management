// React and library imports
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import '../index.css';

// Icon imports
import {
  FaRocket, FaInfoCircle, FaEnvelope, FaFolderOpen, FaCogs, FaUserPlus, FaUserTie, FaQuoteLeft, FaUsers, FaQuestionCircle, FaImages, FaNewspaper,
  FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube, FaGithub
} from 'react-icons/fa';

// App imports
import { getLandingPage } from '../api/landingPage';
import { getNewsPostsByTenant } from '../api/news';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Helper function to construct full image URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:8081${imagePath}`;
};

// NewsSection component with category tabs
const NewsSection = ({ content, sectionId, sectionBg, themeColor, themeColor2, themeColor3, tenantId }) => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState(null);

  // News categories for filtering
  const newsCategories = [
    { key: 'all', label: 'All News', icon: FaNewspaper },
    { key: 'FUNDING_OPPORTUNITIES', label: 'Funding', icon: FaRocket },
    { key: 'STARTUP_SHOWCASE', label: 'Startups', icon: FaUsers },
    { key: 'UPCOMING_EVENTS', label: 'Events', icon: FaInfoCircle },
    { key: 'SUCCESS_STORIES', label: 'Success Stories', icon: FaQuoteLeft },
    { key: 'MENTOR_RESOURCES', label: 'Resources', icon: FaFolderOpen },
    { key: 'GENERAL_ANNOUNCEMENT', label: 'Announcements', icon: FaInfoCircle }
  ];

  // Fetch news data on component mount
  useEffect(() => {
    const fetchNews = async () => {
      if (!tenantId) return;
      
      setLoading(true);
      setError(null);
      try {
        // For public access, we'll need to create a public endpoint or use the existing one
        // For now, we'll use the selected news from content or fetch if needed
        if (content.selectedNewsIds && content.selectedNewsIds.length > 0) {
          // If we have selected news IDs, we would fetch them
          // For now, we'll use the static news from content
          setNewsData(content.news || []);
        } else {
          setNewsData(content.news || []);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news');
        setNewsData(content.news || []);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [tenantId, content]);

  // Filter news by category and exclude empty items
  const filteredNews = (activeCategory === 'all' 
    ? newsData 
    : newsData.filter(item => item.category === activeCategory))
    .filter(item => item && item.title && item.title.trim() !== '');

  const formatCategory = (category) => {
    if (!category) return 'General';
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section id={sectionId} className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: sectionBg }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2" style={{ color: themeColor2 }}>
            <FaNewspaper /> {content.title || 'Latest News & Updates'}
          </h2>
          {content.description && (
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">{content.description}</p>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {newsCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.key;
            const hasNews = category.key === 'all' || newsData.some(item => item.category === category.key);
            
            if (!hasNews && category.key !== 'all') return null;
            
            return (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`}
                style={isActive ? { 
                  background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor2} 100%)`,
                  boxShadow: `0 4px 15px ${themeColor}33`
                } : {}}
              >
                <Icon size={16} />
                {category.label}
                {category.key !== 'all' && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isActive ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                  }`}>
                    {newsData.filter(item => item.category === category.key).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: themeColor }}></div>
            <p className="text-gray-600">Loading news...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* News Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                {item.image && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={getImageUrl(item.image)} 
                      alt="news" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {formatDate(item.date || item.publishedAt) && (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {formatDate(item.date || item.publishedAt)}
                      </span>
                    )}
                    {item.category && (
                      <span 
                        className="text-xs font-medium text-white px-2 py-1 rounded-full"
                        style={{ backgroundColor: themeColor }}
                      >
                        {formatCategory(item.category)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: themeColor2 }}>
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {item.content}
                  </p>
                  {item.authorName && (
                    <p className="text-xs text-gray-500 mb-3">By {item.authorName}</p>
                  )}
                  {item.link && (
                    <a 
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-colors"
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
        )}

        {/* Empty State */}
        {!loading && !error && filteredNews.length === 0 && (
          <div className="text-center py-12">
            <FaNewspaper size={48} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No News Available</h4>
            <p className="text-gray-500">
              {activeCategory === 'all' 
                ? 'No news posts have been published yet.' 
                : `No news posts in the ${newsCategories.find(c => c.key === activeCategory)?.label} category.`
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

// Constants
const SOCIALS = [
  { name: "Facebook", color: "#1877F3", icon: FaFacebook },
  { name: "Twitter", color: "#1DA1F2", icon: FaTwitter },
  { name: "LinkedIn", color: "#0077B5", icon: FaLinkedin },
  { name: "Instagram", color: "#E4405F", icon: FaInstagram },
  { name: "YouTube", color: "#FF0000", icon: FaYoutube },
  { name: "GitHub", color: "#333", icon: FaGithub },
];

const SECTION_LABELS = {
  HERO: 'Home',
  ABOUT: 'About',
  PROJECTS: 'Projects',
  TEAM: 'Team',
  TESTIMONIALS: 'Testimonials',
  NEWS: 'News',
  FAQ: 'FAQ',
  GALLERY: 'Gallery',
  CONTACT: 'Contact',
  CUSTOM: 'Custom',
};

// ContactInfoCard: update to show up to 3 social icons in a row, dropdown for extras
function ContactInfoCard({ socialLinks, address, email, phone, description, themeColor, themeColor2, themeColor3 }) {
  const SOCIALS_PLATFORMS = [
    { name: "Facebook", color: "#1877F3", icon: FaFacebook, matcher: url => url.includes('facebook.com') },
    { name: "Twitter", color: "#1DA1F2", icon: FaTwitter, matcher: url => url.includes('twitter.com') },
    { name: "LinkedIn", color: "#0077B5", icon: FaLinkedin, matcher: url => url.includes('linkedin.com') },
    { name: "Instagram", color: "#E4405F", icon: FaInstagram, matcher: url => url.includes('instagram.com') },
    { name: "YouTube", color: "#FF0000", icon: FaYoutube, matcher: url => url.includes('youtube.com') },
    { name: "GitHub", color: "#333", icon: FaGithub, matcher: url => url.includes('github.com') },
  ];
  // Use the same logic as the Footer for social icons
  const shownSocials = SOCIALS_PLATFORMS.filter(({ name }) => socialLinks && socialLinks[name]);
  const mainSocials = shownSocials.slice(0, 3);
  const extraSocials = shownSocials.slice(3);
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <div className="bg-white/80 rounded-2xl shadow-xl p-8 mb-8 w-full max-w-md" style={{ borderLeft: `4px solid ${themeColor}` }}>
      <h3 className="text-2xl font-bold mb-4" style={{ color: themeColor3 || themeColor }}>Get In Touch</h3>
      {description && <p className="mb-4 text-gray-600 text-sm">{description}</p>}
      <div className="text-gray-700 space-y-2 mb-4">
        <div className="flex items-center gap-2"><span style={{ background: themeColor + '22' }} className="rounded-full p-2"><FaInfoCircle style={{ color: themeColor }} /></span><b>Address:</b> {address}</div>
        <div className="flex items-center gap-2"><span style={{ background: themeColor + '22' }} className="rounded-full p-2"><FaRocket style={{ color: themeColor }} /></span><b>Phone:</b> {phone}</div>
        <div className="flex items-center gap-2"><span style={{ background: themeColor + '22' }} className="rounded-full p-2"><FaEnvelope style={{ color: themeColor }} /></span><b>E-Mail:</b> {email}</div>
      </div>
      <div className="flex items-center gap-3 mb-2 text-gray-700 font-semibold">
        <span>Follow Us:</span>
        <div className="flex gap-3 items-center">
          {mainSocials.map(({ name, icon: Icon, color }) => (
            <a
              key={name}
              href={socialLinks[name]}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: color, boxShadow: `0 0 0 2px ${themeColor}33` }}
              className="rounded-full p-2 hover:scale-110 hover:shadow-lg transition text-white focus:ring-4"
              aria-label={name}
              title={name}
            >
              <Icon size={24} />
            </a>
          ))}
          {extraSocials.length > 0 && (
            <div className="relative">
              <button onClick={() => setShowDropdown(v => !v)} className="rounded-full p-2 bg-gray-200 hover:bg-gray-300 transition focus:ring-2" aria-label="More socials">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M5.25 7.5l4.75 4.75 4.75-4.75" stroke={themeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              {showDropdown && (
                <div className="absolute left-0 mt-2 bg-white rounded shadow-lg z-50 min-w-[48px] flex flex-col">
                  {extraSocials.map(({ name, icon: Icon, color }) => (
                    <a
                      key={name}
                      href={socialLinks[name]}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: color, boxShadow: `0 0 0 2px ${themeColor}33` }}
                      className="rounded-full p-2 hover:scale-110 hover:shadow-lg transition text-white focus:ring-4 mb-1"
                      aria-label={name}
                      title={name}
                    >
                      <Icon size={24} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PublicLandingPage() {
  const { tenantId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching landing page for tenant:', tenantId);
        const landingPageData = await getLandingPage(tenantId, true);
        setData(landingPageData);
      } catch (err) {
        console.error('Error in PublicLandingPage:', err);
        setError(err.message || 'Failed to fetch landing page');
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchLandingPage();
    }
  }, [tenantId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading landing page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="text-lg font-bold mb-2">Error Loading Landing Page</h2>
            <p className="text-sm">{error}</p>
          </div>
          {error.includes('Cannot connect to backend') && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <p className="text-sm">
                <strong>Backend Server Issue:</strong> The backend server at http://localhost:8081 is not running. 
                Please start the backend server and try again.
              </p>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Landing Page Not Found</h2>
          <p className="text-gray-600">The requested landing page could not be found.</p>
        </div>
      </div>
    );
  }

  // Use only themeColor(s), white, or black
  const themeColor = data.themeColor || '#111'; // black as fallback
  const themeColor2 = data.themeColor2 || themeColor;
  const themeColor3 = data.themeColor3 || themeColor;
  const logo = data.sections?.find(s => s.type === 'HERO')?.contentJson ? JSON.parse(data.sections.find(s => s.type === 'HERO').contentJson).logo : null;
  const tenantName = data.tenantName || data.sections?.find(s => s.type === 'HERO')?.contentJson ? JSON.parse(data.sections.find(s => s.type === 'HERO').contentJson).title : 'Landing Page';

  // Build section links for navbar/footer
  const sectionLinks = (data.sections || []).map((section, idx) => ({
    id: SECTION_LABELS[section.type]?.toLowerCase() || `section${idx}`,
    label: SECTION_LABELS[section.type] || `Section ${idx + 1}`
  }));

  function renderSection(section, idx) {
    const content = section.contentJson ? JSON.parse(section.contentJson) : {};
    // Alternate between white and themeColor backgrounds for sections
    const sectionBg = idx % 2 === 0 ? '#fff' : themeColor + '08'; // very light theme color overlay
    const sectionId = SECTION_LABELS[section.type]?.toLowerCase() || `section${idx}`;
    switch (section.type) {
      case 'HERO':
        return (
          <section
            id={sectionId}
            className="w-full min-h-[80vh] flex items-center justify-center border-b relative"
            style={{ fontFamily: 'Inter, sans-serif', background: '#111', position: 'relative', overflow: 'hidden' }}
          >
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
                {content.ctas && content.ctas.map((cta, ctaIdx) => {
                  // Prioritize CTA's own URL, then fallback to type-based URLs, then default
                  const ctaUrl = cta.url || 
                    (cta.type === 'startup' ? (data.buttonUrls?.startupSignup || '#') : 
                     cta.type === 'mentor' ? (data.buttonUrls?.mentorSignup || '#') : 
                     cta.type === 'custom' ? (cta.url || '#') : '#');
                  const ctaTarget = cta.target || '_blank';
                  
                  // Style based on button style and theme colors
                  let buttonStyle = {};
                  let buttonClasses = "px-8 py-4 rounded-xl text-lg font-bold shadow-lg focus:ring-4 transition inline-block";
                  
                  if (cta.style === 'primary' || !cta.style || ctaIdx === 0) {
                    buttonStyle = { 
                      background: `linear-gradient(135deg, ${themeColor}, ${themeColor2})`, 
                      color: '#fff', 
                      border: 'none', 
                      textDecoration: 'none',
                      boxShadow: `0 4px 20px ${themeColor}33`
                    };
                  } else if (cta.style === 'secondary' || ctaIdx === 1) {
                    buttonStyle = { 
                      background: 'transparent', 
                      color: themeColor2, 
                      border: `2px solid ${themeColor2}`, 
                      textDecoration: 'none' 
                    };
                    buttonClasses += " hover:bg-opacity-10";
                  } else if (cta.style === 'ghost') {
                    buttonStyle = { 
                      background: 'transparent', 
                      color: themeColor3, 
                      border: 'none', 
                      textDecoration: 'underline',
                      textDecorationColor: themeColor2
                    };
                    buttonClasses = "px-4 py-2 text-lg font-bold transition inline-block";
                  }
                  
                  return (
                    <a
                      key={ctaIdx}
                      href={ctaUrl}
                      target={ctaTarget}
                      rel={ctaTarget === '_blank' ? 'noopener noreferrer' : undefined}
                      className={buttonClasses}
                      style={buttonStyle}
                    >
                      {cta.label || `CTA ${ctaIdx + 1}`}
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        );
      case 'ABOUT':
        return (
          <section id={sectionId} className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: sectionBg }}>
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
          <section id={sectionId} className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: sectionBg }}>
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl font-bold mb-10 flex items-center gap-2" style={{ color: themeColor2 }}><FaFolderOpen /> Projects</h2>
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
          <section id={sectionId} className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: sectionBg }}>
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl font-bold mb-10 flex items-center gap-2" style={{ color: themeColor2 }}><FaQuoteLeft /> Testimonials</h2>
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
                    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center max-w-xl mx-auto">
                      {testimonial.image && <img src={getImageUrl(testimonial.image)} alt="testimonial" className="w-20 h-20 rounded-full mb-4 border-4" style={{ borderColor: themeColor2 }} />}
                      <p className="text-lg italic text-black mb-4 text-center">"{testimonial.quote}"</p>
                      <div className="font-semibold" style={{ color: themeColor2 }}>{testimonial.name}</div>
                  </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>
        );
      case 'TEAM':
        return (
          <section id={sectionId} className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: sectionBg }}>
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl font-bold mb-10 flex items-center gap-2" style={{ color: themeColor2 }}><FaUsers /> Team</h2>
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
          <section id={sectionId} className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: sectionBg }}>
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl font-bold mb-10 flex items-center gap-2" style={{ color: themeColor2 }}><FaQuestionCircle /> FAQ</h2>
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
          <section id={sectionId} className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: sectionBg }}>
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl font-bold mb-10 flex items-center gap-2" style={{ color: themeColor2 }}><FaImages /> Gallery</h2>
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
          <NewsSection 
            content={content} 
            sectionId={sectionId} 
            sectionBg={sectionBg} 
            themeColor={themeColor} 
            themeColor2={themeColor2} 
            themeColor3={themeColor3} 
            tenantId={tenantId}
          />
        );
      case 'CUSTOM':
        return (
          <section id={sectionId} className="w-full py-20 border-b" style={{ fontFamily: 'Inter, sans-serif', background: sectionBg }}>
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl font-bold mb-10 flex items-center gap-2" style={{ color: themeColor2 }}><FaCogs /> Custom Section</h2>
              <div className="prose max-w-full animate-fade-in-up" style={{ color: '#111' }} dangerouslySetInnerHTML={{ __html: content.html || '' }} />
            </div>
          </section>
        );
      case 'CONTACT':
        return (
          <section id={sectionId} className="relative py-20 border-b flex flex-col md:flex-row items-center justify-center" style={{ fontFamily: 'Inter, sans-serif', background: sectionBg }}>
            <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-10 px-4">
              {/* Contact Info Card */}
              <div className="flex-1 flex flex-col items-center md:items-start justify-center p-10 z-10">
                <ContactInfoCard socialLinks={data.socialLinks} address={content.address} email={content.email} phone={content.phone} description={content.description} themeColor={themeColor} themeColor2={themeColor2} themeColor3={themeColor3} />
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
        return null;
    }
  }
  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Navbar logo={logo} tenantName={tenantName} sections={sectionLinks} themeColor={themeColor} themeColor2={themeColor2} themeColor3={themeColor3} showSignUp={true} sectionLinks={sectionLinks} buttonUrls={data.buttonUrls} />
      <div style={{ paddingTop: 80 }}>
        {data.sections && data.sections.length > 0 ? (
          data.sections.map((section, idx) => (
            <div key={idx}>{renderSection(section, idx)}</div>
          ))
        ) : (
          <div className="text-center text-lg mt-12" style={{ color: themeColor2 }}>No sections to display.</div>
        )}
      </div>
      <Footer logo={logo} tenantName={tenantName} links={sectionLinks} socialLinks={data.socialLinks || {}} themeColor={themeColor} />
    </div>
  );
} 

export default PublicLandingPage; 