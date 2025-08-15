import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { getNewsPostsByTenant, deleteNewsPost } from '../api/news';
import { useAuth } from '../hooks/useAuth';
import CreateNewsPostForm from '../components/CreateNewsPostForm';
import TenantAdminSidebar from '../components/TenantAdminSidebar';
import { FaPlus, FaExternalLinkAlt, FaCalendarAlt } from 'react-icons/fa';

export default function NewsManagement() {
  const { user, token, logout } = useAuth();
  const [newsPosts, setNewsPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchNewsPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const posts = await getNewsPostsByTenant(token, user.tenantId);
      setNewsPosts(posts);
    } catch (err) {
      console.error('Error fetching news posts:', err);
      setError('Failed to load news posts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchNewsPosts();
    }
  }, [token, user]);

  const handlePostCreated = () => {
    fetchNewsPosts();
    setShowCreateModal(false);
    setEditingPost(null);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowCreateModal(true);
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteNewsPost(token, postId);
      setNewsPosts(newsPosts.filter(post => post.id !== postId));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete news post: ' + err.message);
    }
  };

  const NewsPostCard = ({ post }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 ease-in-out flex flex-col">
      {post.imageUrl && (
        <div className="h-48 bg-gray-100 overflow-hidden">
          <img
            src={post.imageUrl.startsWith('http') ? post.imageUrl : `http://localhost:8081${post.imageUrl}`}
            alt={post.title}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 leading-snug">{post.title}</h3>
            <div className="flex-shrink-0 ml-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-blue-800 bg-blue-100">
                    {post.category.replace(/_/g, ' ').toUpperCase()}
                </span>
            </div>
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3 text-sm">{post.content}</p>
        
        <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <FaCalendarAlt className="h-4 w-4 mr-1 text-gray-400" />
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
                <span className="text-gray-600 font-medium">By: {post.authorName}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {post.referenceFileUrl && (
              <a
                href={post.referenceFileUrl.startsWith('http') ? post.referenceFileUrl : `http://localhost:8081${post.referenceFileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 p-1 rounded-full transition-colors"
                title="Download reference file"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
              </a>
            )}
            {post.linkUrl && (
              <a
                href={post.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 p-1 rounded-full transition-colors"
                title="View external link"
              >
                <FaExternalLinkAlt className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={() => handleEditPost(post)}
              className="text-gray-600 hover:text-blue-600 p-1 rounded-full transition-colors"
              title="Edit post"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setDeleteConfirm(post)}
              className="text-gray-600 hover:text-red-600 p-1 rounded-full transition-colors"
              title="Delete post"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <TenantAdminSidebar user={user} onLogout={logout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">News Management</h1>
              <p className="text-gray-600 mt-1">Create, edit, and manage news posts</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Create News Post
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : newsPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No news posts yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first news post from the button above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsPosts.map(post => (
                <NewsPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit News Modal */}
      {(showCreateModal || editingPost) && (
        <CreateNewsPostForm
          onClose={() => {
            setShowCreateModal(false);
            setEditingPost(null);
          }}
          onPostCreated={handlePostCreated}
          editingPost={editingPost}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete News Post</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{deleteConfirm.title}</strong>"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(deleteConfirm.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}