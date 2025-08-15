import React, { useEffect, useState } from 'react';
import { getLandingPage, saveLandingPage, uploadLandingPageImage } from '../api/landingPage';
import { getNewsPostsByTenant, createNewsPost } from '../api/news';
import { useAuth } from '../hooks/useAuth';
import { FaRocket, FaInfoCircle, FaEnvelope, FaFolderOpen, FaCogs, FaUserPlus, FaUserTie, FaQuoteLeft, FaUsers, FaQuestionCircle, FaImages, FaNewspaper, FaHome, FaPlus, FaSearch, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import SocialLinksEditor from '../components/SocialLinksEditor';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import '../index.css';

// Helper function to construct full image URLs with error handling
const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log('🖼️ getImageUrl: No image path provided');
    return '';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    console.log('🖼️ getImageUrl: Full URL provided:', imagePath);
    return imagePath;
  }
  
  // Ensure the path starts with a slash
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  const fullUrl = `http://localhost:8081${normalizedPath}`;
  
  console.log('🖼️ getImageUrl: Constructed URL:', {
    originalPath: imagePath,
    normalizedPath,
    fullUrl
  });
  
  return fullUrl;
};

// Image component with error handling
const SafeImage = ({ src, alt, className, onError, ...props }) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const handleImageError = (e) => {
    console.error('🚨 SafeImage: Image failed to load:', {
      src,
      alt,
      error: e,
      naturalWidth: e.target?.naturalWidth,
      naturalHeight: e.target?.naturalHeight,
      complete: e.target?.complete
    });
    setImageError(true);
    setLoading(false);
    if (onError) onError(e);
  };
  
  const handleImageLoad = (e) => {
    console.log('✅ SafeImage: Image loaded successfully:', {
      src,
      alt,
      naturalWidth: e.target?.naturalWidth,
      naturalHeight: e.target?.naturalHeight
    });
    setLoading(false);
    setImageError(false);
  };
  
  // Reset states when src changes
  React.useEffect(() => {
    if (src) {
      setImageError(false);
      setLoading(true);
      console.log('🖼️ SafeImage: Loading new image:', src);
    }
  }, [src]);
  
  if (imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} {...props}>
        <div className="text-center text-gray-500 p-2">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-xs">Image Error</div>
          <div className="text-xs mt-1 opacity-75">Check console for details</div>
        </div>
      </div>
    );
  }
  
  if (!src) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`} {...props}>
        <div className="text-center text-gray-400 p-2">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-xs">No Image</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {loading && (
        <div className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${className}`}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={loading ? { opacity: 0 } : { opacity: 1 }}
        {...props}
      />
    </div>
  );
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

// NewsEditor component for integrated news management
function NewsEditor({ section, onChange, tenantId }) {
  const { token } = useAuth();
  const content = section.contentJson ? JSON.parse(section.contentJson) : defaultSectionContent[section.type] || {};
  const [existingNews, setExistingNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNewsIds, setSelectedNewsIds] = useState(new Set());
  const [createFormData, setCreateFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL_ANNOUNCEMENT',
    authorName: '',
    linkUrl: '',
    imageFile: null,
    referenceFile: null
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // News categories for dropdown
  const newsCategories = [
    { value: 'INCUBATION_PROGRAM_NEWS', label: 'Incubation Program News' },
    { value: 'FUNDING_OPPORTUNITIES', label: 'Funding Opportunities' },
    { value: 'STARTUP_SHOWCASE', label: 'Startup Showcase' },
    { value: 'UPCOMING_EVENTS', label: 'Upcoming Events' },
    { value: 'SUCCESS_STORIES', label: 'Success Stories' },
    { value: 'MENTOR_RESOURCES', label: 'Mentor Resources' },
    { value: 'INVESTOR_PITCH_SUMMARIES', label: 'Investor Pitch Summaries' },
    { value: 'MARKET_INSIGHTS', label: 'Market Insights' },
    { value: 'GENERAL_ANNOUNCEMENT', label: 'General Announcement' },
    { value: 'ALUMNI_HIGHLIGHTS', label: 'Alumni Highlights' }
  ];

  // Load existing news posts
  useEffect(() => {
    if (tenantId && token) {
      loadExistingNews();
    }
  }, [tenantId, token]);

  // Initialize selected news from content
  useEffect(() => {
    if (content.selectedNewsIds) {
      setSelectedNewsIds(new Set(content.selectedNewsIds));
    }
  }, [content.selectedNewsIds]);

  const loadExistingNews = async () => {
    setLoadingNews(true);
    try {
      const news = await getNewsPostsByTenant(token, tenantId);
      setExistingNews(news || []);
      console.log('📰 Loaded existing news:', news?.length || 0, 'posts');
    } catch (error) {
      console.error('❌ Failed to load existing news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  // Filter news based on search term
  const filteredNews = existingNews.filter(news => 
    news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle news selection
  const handleNewsSelection = (newsId, isSelected) => {
    const newSelectedIds = new Set(selectedNewsIds);
    if (isSelected) {
      newSelectedIds.add(newsId);
    } else {
      newSelectedIds.delete(newsId);
    }
    setSelectedNewsIds(newSelectedIds);
    
    // Update content with selected news
    const selectedNews = existingNews.filter(news => newSelectedIds.has(news.id));
    const newsItems = selectedNews.map(news => ({
      id: news.id,
      title: news.title,
      content: news.content,
      date: news.publishedAt ? news.publishedAt.split('T')[0] : new Date().toISOString().split('T')[0],
      image: news.imageUrl,
      link: news.linkUrl,
      isFromSystem: true
    }));
    
    onChange({ 
      ...section, 
      contentJson: JSON.stringify({ 
        ...content, 
        news: newsItems,
        selectedNewsIds: Array.from(newSelectedIds)
      }) 
    });
  };

  // Handle create new news post
  const handleCreateNews = async () => {
    if (!createFormData.title || !createFormData.content || !createFormData.authorName) {
      setCreateError('Please fill in all required fields (Title, Content, Author Name)');
      return;
    }

    if (!createFormData.imageFile) {
      setCreateError('Please select an image file');
      return;
    }

    setCreating(true);
    setCreateError('');
    
    try {
      const formData = new FormData();
      formData.append('title', createFormData.title);
      formData.append('content', createFormData.content);
      formData.append('category', createFormData.category);
      formData.append('authorName', createFormData.authorName);
      if (createFormData.linkUrl) {
        formData.append('linkUrl', createFormData.linkUrl);
      }
      formData.append('imageFile', createFormData.imageFile);
      if (createFormData.referenceFile) {
        formData.append('referenceFile', createFormData.referenceFile);
      }

      const newPost = await createNewsPost(token, formData);
      console.log('✅ Created new news post:', newPost);
      
      // Refresh the news list
      await loadExistingNews();
      
      // Auto-select the new post
      const newSelectedIds = new Set([...selectedNewsIds, newPost.id]);
      setSelectedNewsIds(newSelectedIds);
      
      // Add to content
      const newNewsItem = {
        id: newPost.id,
        title: newPost.title,
        content: newPost.content,
        date: newPost.publishedAt ? newPost.publishedAt.split('T')[0] : new Date().toISOString().split('T')[0],
        image: newPost.imageUrl,
        link: newPost.linkUrl,
        isFromSystem: true
      };
      
      const updatedNews = [...(content.news || []), newNewsItem];
      onChange({ 
        ...section, 
        contentJson: JSON.stringify({ 
          ...content, 
          news: updatedNews,
          selectedNewsIds: Array.from(newSelectedIds)
        }) 
      });
      
      // Reset form
      setCreateFormData({
        title: '',
        content: '',
        category: 'GENERAL_ANNOUNCEMENT',
        authorName: '',
        linkUrl: '',
        imageFile: null,
        referenceFile: null
      });
      setShowCreateForm(false);
      
    } catch (error) {
      console.error('❌ Failed to create news post:', error);
      setCreateError(`Failed to create news post: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

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

      {/* News Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">News Content</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Create New Post
            </button>
            <button
              onClick={loadExistingNews}
              disabled={loadingNews}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FaSearch className="w-4 h-4" />
              {loadingNews ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Create New Post Form */}
        {showCreateForm && (
          <div className="bg-green-50 rounded-lg p-6 border border-green-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-green-800">Create New News Post</h4>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-green-600 hover:text-green-800"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={createFormData.title}
                  onChange={e => setCreateFormData({...createFormData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter news title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author Name *</label>
                <input
                  type="text"
                  value={createFormData.authorName}
                  onChange={e => setCreateFormData({...createFormData, authorName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter author name"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
              <textarea
                value={createFormData.content}
                onChange={e => setCreateFormData({...createFormData, content: e.target.value})}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter news content"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={createFormData.category}
                  onChange={e => setCreateFormData({...createFormData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {newsCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (Optional)</label>
                <input
                  type="url"
                  value={createFormData.linkUrl}
                  onChange={e => setCreateFormData({...createFormData, linkUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setCreateFormData({...createFormData, imageFile: e.target.files[0]})}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference File (Optional)</label>
                <input
                  type="file"
                  onChange={e => setCreateFormData({...createFormData, referenceFile: e.target.files[0]})}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
            </div>
            
            {createError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {createError}
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNews}
                disabled={creating}
                className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaCheck className="w-4 h-4" />
                    Create Post
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Search existing news */}
        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search existing news posts..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Existing news selection */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3">
            Select from Existing News ({selectedNewsIds.size} selected)
          </h4>
          
          {loadingNews ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading news posts...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-8">
              <FaNewspaper className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                {searchTerm ? 'No news posts match your search.' : 'No news posts found. Create your first post!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredNews.map(news => (
                <div key={news.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedNewsIds.has(news.id)}
                      onChange={e => handleNewsSelection(news.id, e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-medium text-gray-900 truncate">{news.title}</h5>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {newsCategories.find(cat => cat.value === news.category)?.label || news.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{news.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>By {news.authorName}</span>
                        <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                        {news.linkUrl && (
                          <a href={news.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            View Link
                          </a>
                        )}
                      </div>
                    </div>
                    {news.imageUrl && (
                      <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                        <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected news summary */}
        {selectedNewsIds.size > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">
              Selected News Posts ({selectedNewsIds.size})
            </h4>
            <div className="space-y-2">
              {existingNews
                .filter(news => selectedNewsIds.has(news.id))
                .map(news => (
                  <div key={news.id} className="flex items-center justify-between bg-white rounded p-2">
                    <span className="text-sm font-medium text-gray-900">{news.title}</span>
                    <button
                      onClick={() => handleNewsSelection(news.id, false)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove from selection"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionEditor({ section, onChange, tenantId }) {
  const { token } = useAuth();
  const content = section.contentJson ? JSON.parse(section.contentJson) : defaultSectionContent[section.type] || {};
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Helper for image upload (handles nested arrays)
  const handleImage = async (field, e, idx = null, arrField = null) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('🖼️ Starting image upload:', {
      field,
      fileName: file.name,
      fileSize: file.size,
      idx,
      arrField,
      tenantId,
      hasToken: !!token
    });
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(`Invalid file type. Please upload: ${allowedTypes.join(', ')}`);
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size too large. Please upload files smaller than 5MB.');
      return;
    }
    
    setUploading(true);
    setUploadError('');
    
    try {
      console.log('📤 Calling uploadLandingPageImage API...');
      
      // Ensure we have the required parameters
      if (!tenantId) {
        throw new Error('Tenant ID is required for image upload');
      }
      if (!token) {
        throw new Error('Authentication token is required for image upload');
      }
      
      const url = await uploadLandingPageImage(tenantId, file, token);
      console.log('✅ Upload successful, received URL:', url);
      
      if (!url) {
        throw new Error('No URL returned from server');
      }
      
      // Test if the uploaded image is accessible
      const testUrl = getImageUrl(url);
      console.log('🧪 Testing image accessibility at:', testUrl);
      
      // Try to fetch the image to verify it's accessible
      try {
        const testResponse = await fetch(testUrl, { method: 'HEAD' });
        if (testResponse.ok) {
          console.log('✅ Image is accessible via URL');
        } else {
          console.warn('⚠️ Image URL returned non-OK status:', testResponse.status, testResponse.statusText);
        }
      } catch (testError) {
        console.warn('⚠️ Image accessibility test failed:', testError.message);
      }
      
      let newContent = { ...content };
      
      if (arrField && idx !== null) {
        console.log('📝 Updating nested array field:', arrField, 'at index:', idx);
        // For nested array fields (e.g., projects, testimonials, team, news)
        const arr = [...(newContent[arrField] || [])];
        if (!arr[idx]) {
          arr[idx] = {};
        }
        arr[idx][field] = url;
        newContent[arrField] = arr;
      } else if (arrField === 'images' && idx !== null) {
        console.log('📝 Updating gallery images at index:', idx);
        // For gallery images (array of strings)
        const arr = [...(newContent.images || [])];
        arr[idx] = url;
        newContent.images = arr;
      } else {
        console.log('📝 Updating simple field:', field);
        newContent[field] = url;
      }
      
      console.log('📝 Updated content:', newContent);
      onChange({ ...section, contentJson: JSON.stringify(newContent) });
      console.log('✅ Image upload and content update complete');
      
      // Clear any previous errors on success
      setUploadError('');
      
    } catch (err) {
      console.error('❌ Image upload failed:', err);
      const errorMessage = err.message || 'Unknown error occurred during upload';
      setUploadError(`Image upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
      // Clear the file input to allow re-uploading the same file if needed
      if (e.target) {
        e.target.value = '';
      }
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
                <SafeImage src={getImageUrl(content.logo)} alt="logo" className="w-full h-full object-cover" />
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
                <SafeImage src={getImageUrl(content.bgImage)} alt="bg" className="w-full h-full object-cover" />
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
          <div className="space-y-4">
            {content.ctas && content.ctas.map((cta, idx) => (
              <div key={idx} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                      value={cta.label || ''} 
                      onChange={e => {
                        const ctas = [...content.ctas];
                        ctas[idx].label = e.target.value;
                        onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
                      }}
                      placeholder="e.g., Apply as Startup"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Button Type</label>
                    <select 
                      value={cta.type || 'startup'} 
                      onChange={e => {
                        const ctas = [...content.ctas];
                        ctas[idx].type = e.target.value;
                        onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="startup">🚀 Startup Application</option>
                      <option value="mentor">👨‍🏫 Mentor Application</option>
                      <option value="custom">⚙️ Custom Action</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Redirect URL</label>
                  <input 
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    value={cta.url || ''} 
                    onChange={e => {
                      const ctas = [...content.ctas];
                      ctas[idx].url = e.target.value;
                      onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
                    }}
                    placeholder="https://your-domain.com/signup"
                  />
                  <p className="text-xs text-gray-500 mt-1">Where users will be redirected when they click this button</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Button Style</label>
                    <select 
                      value={cta.style || 'primary'} 
                      onChange={e => {
                        const ctas = [...content.ctas];
                        ctas[idx].style = e.target.value;
                        onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="primary">🎯 Primary (Filled)</option>
                      <option value="secondary">🔲 Secondary (Outlined)</option>
                      <option value="ghost">👻 Ghost (Text Only)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Open In</label>
                    <select 
                      value={cta.target || '_self'} 
                      onChange={e => {
                        const ctas = [...content.ctas];
                        ctas[idx].target = e.target.value;
                        onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="_self">🔄 Same Tab</option>
                      <option value="_blank">🆕 New Tab</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cta.style === 'primary' ? '#3B82F6' : cta.style === 'secondary' ? 'transparent' : '#6B7280', border: cta.style === 'secondary' ? '2px solid #3B82F6' : 'none' }}></div>
                    <span className="text-xs text-gray-600">Preview Color</span>
                  </div>
                  <button 
                    onClick={() => {
                      const ctas = content.ctas.filter((_, i) => i !== idx);
                      onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
                    }} 
                    className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    title="Remove CTA Button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => {
                const ctas = [...(content.ctas || []), { 
                  label: '', 
                  type: 'startup', 
                  url: '', 
                  style: 'primary',
                  target: '_self'
                }];
                onChange({ ...section, contentJson: JSON.stringify({ ...content, ctas }) });
              }} 
              className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 text-blue-700 px-6 py-4 rounded-xl font-semibold hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 transition-all duration-200 flex items-center justify-center gap-3 group"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span>Add New CTA Button</span>
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
        {content.image && <SafeImage src={getImageUrl(content.image)} alt="about" className="h-20 my-2" />}
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
    return <NewsEditor section={section} onChange={onChange} tenantId={tenantId} />;
  }

  if (section.type === 'CUSTOM') {
    return (
      <div className="space-y-6">
        {/* Section Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
          <input 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={content.title || ''} 
            onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, title: e.target.value }) })}
            placeholder="Custom Section Title"
          />
        </div>

        {/* Content Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Content Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => onChange({ ...section, contentJson: JSON.stringify({ ...content, contentType: 'html' }) })}
              className={`p-4 rounded-lg border-2 transition-all ${
                (content.contentType || 'html') === 'html'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🔧</div>
                <div className="font-medium">Custom HTML</div>
                <div className="text-xs text-gray-500 mt-1">Full HTML control</div>
              </div>
            </button>
            <button
              onClick={() => onChange({ ...section, contentJson: JSON.stringify({ ...content, contentType: 'rich' }) })}
              className={`p-4 rounded-lg border-2 transition-all ${
                content.contentType === 'rich'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium">Rich Content</div>
                <div className="text-xs text-gray-500 mt-1">Text + Images</div>
              </div>
            </button>
            <button
              onClick={() => onChange({ ...section, contentJson: JSON.stringify({ ...content, contentType: 'embed' }) })}
              className={`p-4 rounded-lg border-2 transition-all ${
                content.contentType === 'embed'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🎬</div>
                <div className="font-medium">Embed</div>
                <div className="text-xs text-gray-500 mt-1">Video/iFrame</div>
              </div>
            </button>
          </div>
        </div>

        {/* HTML Content */}
        {(content.contentType || 'html') === 'html' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom HTML Code</label>
            <div className="relative">
              <textarea 
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" 
                rows="12"
                value={content.html || ''} 
                onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, html: e.target.value }) })}
                placeholder={`<!-- Enter your custom HTML here -->
<div class="custom-section">
  <h2>Your Custom Content</h2>
  <p>Add any HTML, CSS, or JavaScript here.</p>
  <div class="features">
    <div class="feature">
      <h3>Feature 1</h3>
      <p>Description here</p>
    </div>
  </div>
</div>

<style>
.custom-section {
  padding: 2rem;
  text-align: center;
}
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}
</style>`}
              />
              <div className="absolute top-2 right-2">
                <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-mono">
                  HTML
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              💡 <strong>Tip:</strong> You can include CSS styles and JavaScript. Use theme colors: <code>var(--theme-color-1)</code>, <code>var(--theme-color-2)</code>, <code>var(--theme-color-3)</code>
            </div>
          </div>
        )}

        {/* Rich Content */}
        {content.contentType === 'rich' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea 
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                rows="6"
                value={content.richContent || ''} 
                onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, richContent: e.target.value }) })}
                placeholder="Enter your content here. You can use basic HTML tags like <strong>, <em>, <a>, <br>, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Image (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => handleImage('backgroundImage', e)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploading && <p className="text-sm text-blue-600 mt-1">Uploading background image...</p>}
              {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
              {content.backgroundImage && (
                <div className="w-full h-32 rounded-lg border-2 border-gray-200 overflow-hidden mt-2">
                  <SafeImage src={getImageUrl(content.backgroundImage)} alt="background" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
                <select 
                  value={content.textAlign || 'center'} 
                  onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, textAlign: e.target.value }) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="left">⬅️ Left</option>
                  <option value="center">↔️ Center</option>
                  <option value="right">➡️ Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Style</label>
                <select 
                  value={content.backgroundStyle || 'none'} 
                  onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, backgroundStyle: e.target.value }) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">🚫 None</option>
                  <option value="gradient">🌈 Gradient</option>
                  <option value="solid">🎨 Solid Color</option>
                  <option value="pattern">📐 Pattern</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Embed Content */}
        {content.contentType === 'embed' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Embed Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'youtube', label: 'YouTube', icon: '🎥' },
                  { value: 'vimeo', label: 'Vimeo', icon: '📹' },
                  { value: 'iframe', label: 'Custom iFrame', icon: '🖼️' },
                  { value: 'code', label: 'Code Embed', icon: '💻' }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => onChange({ ...section, contentJson: JSON.stringify({ ...content, embedType: type.value }) })}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      (content.embedType || 'youtube') === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{type.icon}</div>
                    <div className="text-xs font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {content.embedType === 'youtube' ? 'YouTube URL' : 
                 content.embedType === 'vimeo' ? 'Vimeo URL' :
                 content.embedType === 'iframe' ? 'iFrame URL' : 'Embed Code'}
              </label>
              {content.embedType === 'code' ? (
                <textarea 
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" 
                  rows="6"
                  value={content.embedCode || ''} 
                  onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, embedCode: e.target.value }) })}
                  placeholder="<iframe src='...' width='100%' height='400'></iframe>"
                />
              ) : (
                <input 
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={content.embedUrl || ''} 
                  onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, embedUrl: e.target.value }) })}
                  placeholder={
                    content.embedType === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
                    content.embedType === 'vimeo' ? 'https://vimeo.com/...' :
                    'https://example.com/embed'
                  }
                />
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                <select 
                  value={content.embedWidth || '100%'} 
                  onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, embedWidth: e.target.value }) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="100%">📏 Full Width</option>
                  <option value="75%">📐 75% Width</option>
                  <option value="50%">📏 50% Width</option>
                  <option value="400px">📐 400px</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                <select 
                  value={content.embedHeight || '400px'} 
                  onChange={e => onChange({ ...section, contentJson: JSON.stringify({ ...content, embedHeight: e.target.value }) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="300px">📏 300px</option>
                  <option value="400px">📐 400px</option>
                  <option value="500px">📏 500px</option>
                  <option value="600px">📐 600px</option>
                </select>
              </div>
            </div>
          </div>
        )}
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
              {content.ctas && content.ctas.map((cta, idx) => {
                // Prioritize CTA's own URL, then fallback to type-based URLs, then default
                const ctaUrl = cta.url || 
                  (cta.type === 'startup' ? (buttonUrls?.startupSignup || '#') : 
                   cta.type === 'mentor' ? (buttonUrls?.mentorSignup || '#') : 
                   cta.type === 'custom' ? (cta.url || '#') : '#');
                const ctaTarget = cta.target || '_self';
                
                // Style based on button style and theme colors
                let buttonStyle = {};
                let buttonClasses = "px-8 py-4 rounded-xl text-lg font-bold shadow-lg focus:ring-4 transition inline-block";
                
                if (cta.style === 'primary' || !cta.style) {
                  buttonStyle = { 
                    background: `linear-gradient(135deg, ${themeColor}, ${themeColor2})`, 
                    color: '#fff', 
                    border: 'none', 
                    textDecoration: 'none',
                    boxShadow: `0 4px 20px ${themeColor}33`
                  };
                } else if (cta.style === 'secondary') {
                  buttonStyle = { 
                    background: 'transparent', 
                    color: themeColor, 
                    border: `2px solid ${themeColor}`, 
                    textDecoration: 'none' 
                  };
                  buttonClasses += " hover:bg-opacity-10";
                } else if (cta.style === 'ghost') {
                  buttonStyle = { 
                    background: 'transparent', 
                    color: themeColor2, 
                    border: 'none', 
                    textDecoration: 'underline',
                    textDecorationColor: themeColor3
                  };
                  buttonClasses = "px-4 py-2 text-lg font-bold transition inline-block";
                }
                
                return (
                  <a
                    key={idx}
                    href={ctaUrl}
                    target={ctaTarget}
                    rel={ctaTarget === '_blank' ? 'noopener noreferrer' : undefined}
                    className={buttonClasses}
                    style={buttonStyle}
                  >
                    {cta.label || `CTA ${idx + 1}`}
                  </a>
                );
              })}
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
      const renderCustomContent = () => {
        if (content.contentType === 'rich') {
          const backgroundStyle = {
            background: content.backgroundStyle === 'gradient' 
              ? `linear-gradient(135deg, ${themeColor}15, ${themeColor2}15, ${themeColor3}15)`
              : content.backgroundStyle === 'solid'
              ? `${themeColor}08`
              : content.backgroundStyle === 'pattern'
              ? `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="${encodeURIComponent(themeColor)}" opacity="0.1"/></svg>') repeat`
              : 'transparent'
          };
          
          return (
            <div 
              className="relative py-16 px-8 rounded-2xl"
              style={{
                ...backgroundStyle,
                textAlign: content.textAlign || 'center'
              }}
            >
              {content.backgroundImage && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <SafeImage 
                    src={getImageUrl(content.backgroundImage)} 
                    alt="background" 
                    className="w-full h-full object-cover opacity-20" 
                  />
                </div>
              )}
              <div className="relative z-10">
                <div 
                  className="prose max-w-full text-lg leading-relaxed"
                  style={{ color: '#333' }}
                  dangerouslySetInnerHTML={{ __html: content.richContent || 'Add your rich content here...' }}
                />
              </div>
            </div>
          );
        } else if (content.contentType === 'embed') {
          const getEmbedContent = () => {
            if (content.embedType === 'youtube' && content.embedUrl) {
              const videoId = content.embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
              if (videoId) {
                return (
                  <iframe
                    width={content.embedWidth || '100%'}
                    height={content.embedHeight || '400px'}
                    src={`https://www.youtube.com/embed/${videoId[1]}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg shadow-lg"
                  />
                );
              }
            } else if (content.embedType === 'vimeo' && content.embedUrl) {
              const videoId = content.embedUrl.match(/vimeo\.com\/(\d+)/);
              if (videoId) {
                return (
                  <iframe
                    width={content.embedWidth || '100%'}
                    height={content.embedHeight || '400px'}
                    src={`https://player.vimeo.com/video/${videoId[1]}`}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg shadow-lg"
                  />
                );
              }
            } else if (content.embedType === 'iframe' && content.embedUrl) {
              return (
                <iframe
                  width={content.embedWidth || '100%'}
                  height={content.embedHeight || '400px'}
                  src={content.embedUrl}
                  frameBorder="0"
                  className="rounded-lg shadow-lg"
                />
              );
            } else if (content.embedType === 'code' && content.embedCode) {
              return (
                <div 
                  className="rounded-lg shadow-lg overflow-hidden"
                  style={{ width: content.embedWidth || '100%', height: content.embedHeight || '400px' }}
                  dangerouslySetInnerHTML={{ __html: content.embedCode }}
                />
              );
            }
            
            return (
              <div 
                className="bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
                style={{ width: content.embedWidth || '100%', height: content.embedHeight || '400px' }}
              >
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🎬</div>
                  <div>Embed content will appear here</div>
                  <div className="text-sm mt-1">Add a valid URL or embed code</div>
                </div>
              </div>
            );
          };
          
          return (
            <div className="flex justify-center">
              {getEmbedContent()}
            </div>
          );
        } else {
          // HTML content type
          return (
            <div 
              className="prose max-w-full animate-fade-in-up custom-html-content"
              style={{ 
                color: '#111',
                '--theme-color-1': themeColor,
                '--theme-color-2': themeColor2,
                '--theme-color-3': themeColor3
              }} 
              dangerouslySetInnerHTML={{ __html: content.html || '<div class="text-center py-8 text-gray-500"><div class="text-4xl mb-2">🔧</div><div>Add your custom HTML content</div></div>' }} 
            />
          );
        }
      };
      
      return (
        <section 
          className="w-full py-20 border-b" 
          style={{ 
            fontFamily: 'Inter, sans-serif', 
            background: `linear-gradient(135deg, ${themeColor}05, ${themeColor2}05)` 
          }}
        >
          <div className="max-w-6xl mx-auto px-4">
            {content.title && (
              <h2 
                className="text-3xl font-bold mb-10 flex items-center gap-2 text-center" 
                style={{ color: themeColor2 }}
              >
                <span className="inline-block w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor2})` }}>
                  <span className="text-white text-sm">⚙️</span>
                </span>
                {content.title}
              </h2>
            )}
            {renderCustomContent()}
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
  const userRole = user?.role;
  const userId = user?.id;
  const [themeColors, setThemeColors] = useState(['#1976d2', '#43a047', '#fbc02d']);
  const [sections, setSections] = useState([]);
  const [socialLinks, setSocialLinks] = useState({});
  const [buttonUrls, setButtonUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');

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
  if (userRole !== 'TENANT_ADMIN') {
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
}, [tenantId, token, userRole, userId]);
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

  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple saves
    
    setIsSaving(true);
    try {
      await saveLandingPage(tenantId, {
          themeColor: themeColors[0],
          themeColor2: themeColors[1],
          themeColor3: themeColors[2],
          sections,
          socialLinks,
          buttonUrls
      }, token);
      
      const url = `/public-landing/${tenantId}`;
      setPublicUrl(url);
      setPublishedUrl(`${window.location.origin}${url}`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving landing page:', error);
      alert('Error saving landing page. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                to="/tenant-admin/dashboard"
                className="group flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-all duration-200 hover:bg-gray-50 px-3 py-2 rounded-lg"
              >
                <FaHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Dashboard</span>
              </Link>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl shadow-md flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})` }}
                >
                  <FaCogs className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Landing Page Builder</h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <span>Create and customize your landing page</span>
                    <div className="flex gap-1">
                      {themeColors.map((color, idx) => (
                        <div key={idx} className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }}></div>
                      ))}
                    </div>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Preview Toggle */}
              <button 
                onClick={() => setPreview(p => !p)} 
                className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  preview 
                    ? 'text-white shadow-lg transform scale-105' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                }`}
                style={preview ? {
                  background: `linear-gradient(135deg, ${themeColors[1]}, ${themeColors[2]})`
                } : {}}
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={preview ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                </svg>
                <span>{preview ? 'Hide Preview' : 'Live Preview'}</span>
                {preview && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                  </div>
                )}
              </button>
              
              {/* Save & Publish Button */}
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="group relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save & Publish</span>
                  </>
                )}
                
                {/* Success Indicator */}
                {!isSaving && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                )}
              </button>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="border-t border-gray-100 mt-6 pt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Auto-save enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Last saved: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Sections: <span className="font-semibold text-gray-800">{sections.length}</span></span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Theme Colors:</span>
                  <div className="flex gap-1">
                    {themeColors.map((color, idx) => (
                      <div key={idx} className="w-5 h-5 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform cursor-pointer" style={{ backgroundColor: color }} title={color}></div>
                    ))}
                  </div>
                </div>
                {publicUrl && (
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">Published</span>
                  </div>
                )}
              </div>
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
                  <div 
                    className="w-6 h-6 rounded-full shadow-sm" 
                    style={{ background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]}, ${themeColors[2]})` }}
                  ></div>
                  <h4 className="font-semibold text-gray-800">Theme Colors</h4>
                </div>
                
                {/* Color Preview Bar */}
                <div className="mb-6">
                  <div className="h-4 rounded-full overflow-hidden shadow-inner bg-gray-100 flex">
                    <div className="flex-1" style={{ backgroundColor: themeColors[0] }}></div>
                    <div className="flex-1" style={{ backgroundColor: themeColors[1] }}></div>
                    <div className="flex-1" style={{ backgroundColor: themeColors[2] }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Primary</span>
                    <span>Secondary</span>
                    <span>Accent</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">🎨 Primary Color</label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <input 
                          type="color" 
                          value={themeColors[0]} 
                          onChange={e => setThemeColors([e.target.value, themeColors[1], themeColors[2]])}
                          className="w-16 h-16 rounded-xl border-3 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          style={{ borderColor: themeColors[0] }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: themeColors[0] }}></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">Main Brand Color</div>
                        <div className="text-sm text-gray-600 mb-2">Used for headers, primary buttons, and key elements</div>
                        <div className="text-xs font-mono bg-white px-2 py-1 rounded border" style={{ color: themeColors[0] }}>
                          {themeColors[0].toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">✨ Secondary Color</label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <input 
                          type="color" 
                          value={themeColors[1]} 
                          onChange={e => setThemeColors([themeColors[0], e.target.value, themeColors[2]])}
                          className="w-16 h-16 rounded-xl border-3 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          style={{ borderColor: themeColors[1] }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: themeColors[1] }}></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">Secondary Accent</div>
                        <div className="text-sm text-gray-600 mb-2">Used for highlights, secondary buttons, and accents</div>
                        <div className="text-xs font-mono bg-white px-2 py-1 rounded border" style={{ color: themeColors[1] }}>
                          {themeColors[1].toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">🌟 Accent Color</label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <input 
                          type="color" 
                          value={themeColors[2]} 
                          onChange={e => setThemeColors([themeColors[0], themeColors[1], e.target.value])}
                          className="w-16 h-16 rounded-xl border-3 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          style={{ borderColor: themeColors[2] }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: themeColors[2] }}></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">Special Elements</div>
                        <div className="text-sm text-gray-600 mb-2">Used for special highlights and decorative elements</div>
                        <div className="text-xs font-mono bg-white px-2 py-1 rounded border" style={{ color: themeColors[2] }}>
                          {themeColors[2].toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Color Presets */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">🎭 Quick Presets</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { name: 'Ocean', colors: ['#0ea5e9', '#06b6d4', '#8b5cf6'] },
                      { name: 'Forest', colors: ['#059669', '#10b981', '#f59e0b'] },
                      { name: 'Sunset', colors: ['#dc2626', '#ea580c', '#f59e0b'] },
                      { name: 'Purple', colors: ['#7c3aed', '#a855f7', '#ec4899'] },
                      { name: 'Tech', colors: ['#1f2937', '#4f46e5', '#06b6d4'] },
                      { name: 'Nature', colors: ['#16a34a', '#65a30d', '#ca8a04'] },
                      { name: 'Royal', colors: ['#4338ca', '#7c3aed', '#c026d3'] },
                      { name: 'Fire', colors: ['#dc2626', '#ea580c', '#f59e0b'] }
                    ].map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => setThemeColors(preset.colors)}
                        className="group p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                        title={`Apply ${preset.name} theme`}
                      >
                        <div className="h-3 rounded-full overflow-hidden flex mb-1">
                          {preset.colors.map((color, idx) => (
                            <div key={idx} className="flex-1" style={{ backgroundColor: color }}></div>
                          ))}
                        </div>
                        <div className="text-xs text-gray-600 group-hover:text-gray-800 font-medium">{preset.name}</div>
                      </button>
                    ))}
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
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-6">
              {/* Success Icon */}
              <div className="flex items-center justify-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})` }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              {/* Success Message */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Landing Page Published!</h3>
                <p className="text-gray-600">Your landing page has been successfully saved and is now live.</p>
              </div>
              
              {/* URL Display */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Public URL:</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={publishedUrl} 
                    readOnly 
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={(e) => {
                      navigator.clipboard.writeText(publishedUrl);
                      // Show brief copy feedback
                      const btn = e.target;
                      const originalText = btn.textContent;
                      btn.textContent = '✓';
                      setTimeout(() => btn.textContent = originalText, 1000);
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm transition-colors"
                    title="Copy URL"
                  >
                    📋
                  </button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(publishedUrl, '_blank')}
                  className="flex-1 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})` }}
                >
                  🚀 View Live Page
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 