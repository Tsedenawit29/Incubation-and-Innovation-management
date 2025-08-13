import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleOAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('Processing Google OAuth...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const status = urlParams.get('status');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    if (status === 'success') {
      setMessage('✅ Google Calendar connected successfully!');
      setIsError(false);
      
      // Redirect back to calendar page after 2 seconds
      setTimeout(() => {
        navigate('/tenant-admin/calendar', { 
          state: { oauthSuccess: true }
        });
      }, 2000);
    } else if (error) {
      const decodedError = decodeURIComponent(error);
      setMessage(`❌ Google OAuth failed: ${decodedError}`);
      setIsError(true);
      
      // Redirect back to calendar page after 3 seconds
      setTimeout(() => {
        navigate('/tenant-admin/calendar', { 
          state: { oauthError: decodedError }
        });
      }, 3000);
    } else {
      setMessage('❌ Unknown OAuth status');
      setIsError(true);
      
      // Redirect back to calendar page after 3 seconds
      setTimeout(() => {
        navigate('/tenant-admin/calendar');
      }, 3000);
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center">
            {!isError ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            ) : (
              <div className="text-red-500 text-2xl">⚠️</div>
            )}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Google OAuth
          </h2>
          <p className={`mt-2 text-center text-sm ${isError ? 'text-red-600' : 'text-gray-600'}`}>
            {message}
          </p>
          <p className="mt-4 text-center text-xs text-gray-500">
            Redirecting you back to the calendar...
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthSuccess;
