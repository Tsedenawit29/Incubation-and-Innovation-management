import React, { useState, useEffect } from 'react';
import { createNewsPost, updateNewsPost } from '../api/news';
import { useAuth } from '../hooks/useAuth';

const NEWS_CATEGORIES = [
    'INCUBATION_PROGRAM_NEWS',
    'FUNDING_OPPORTUNITIES',
     'STARTUP_SHOWCASE',
    'UPCOMING_EVENTS',
    'SUCCESS_STORIES',
    'MENTOR_RESOURCES',
    'INVESTOR_PITCH_SUMMARIES',
    'MARKET_INSIGHTS',
    'GENERAL_ANNOUNCEMENT',
    'ALUMNI_HIGHLIGHTS'

];

export default function CreateNewsPostForm({ onClose, onPostCreated, editingPost = null }) {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: editingPost?.title || '',
    content: editingPost?.content || '',
    category: editingPost?.category || NEWS_CATEGORIES[0],
    linkUrl: editingPost?.linkUrl || '',
    // Use the authorName from the existing post or default to the current user's name
    authorName: editingPost?.authorName || user?.fullName || '',
    imageFile: null,
    referenceFile: null
  });

  // Removed the useEffect hook for fetching users as it is no longer needed.

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // For new posts, require image file. For edits, it's optional
    if (!editingPost && !formData.imageFile) {
        setError('Image file is required for new posts.');
        setLoading(false);
        return;
    }

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('content', formData.content);
      form.append('category', formData.category);
      if (formData.linkUrl) form.append('linkUrl', formData.linkUrl);
      // Append the authorName from the form data
      form.append('authorName', formData.authorName);
      if (formData.imageFile) form.append('imageFile', formData.imageFile);
      if (formData.referenceFile) form.append('referenceFile', formData.referenceFile);

      if (editingPost) {
        await updateNewsPost(token, editingPost.id, form);
        setSuccess('News post updated successfully!');
      } else {
        await createNewsPost(token, form);
        setSuccess('News post created successfully!');
      }
      
      onPostCreated();
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingPost ? 'Edit News Post' : 'Create News Post'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
        {success && <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content <span className="text-red-500">*</span></label>
            <textarea
              name="content"
              id="content"
              rows="5"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
            <select
              name="category"
              id="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {NEWS_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat.replace(/_/g, ' ').toLowerCase().replace(/\b[a-z]/g, letter => letter.toUpperCase())}</option>
              ))}
            </select>
          </div>

          {/* New Author Input Field */}
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">Author <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="authorName"
              id="authorName"
              value={formData.authorName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          {/* End of new Author Input Field */}

          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
              Image {!editingPost && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              name="imageFile"
              id="imageFile"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              {...(!editingPost && { required: true })}
            />
          </div>

          <div>
            <label htmlFor="referenceFile" className="block text-sm font-medium text-gray-700 mb-1">Reference File (Optional)</label>
            <input
              type="file"
              name="referenceFile"
              id="referenceFile"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
          
          <div>
            <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-1">Link URL (Optional)</label>
            <input
              type="url"
              name="linkUrl"
              id="linkUrl"
              value={formData.linkUrl}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (editingPost ? 'Updating...' : 'Creating...') : (editingPost ? 'Update Post' : 'Create Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}