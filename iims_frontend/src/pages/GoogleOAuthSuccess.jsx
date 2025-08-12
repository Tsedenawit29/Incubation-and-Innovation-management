import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  CheckCircleIcon, 
  CalendarIcon, 
  ArrowRightIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const GoogleOAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuthCallback = () => {
      const status = searchParams.get('status');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (!status) {
        setStatus('error');
        setError('Invalid OAuth response');
        return;
      }

      if (status === 'success') {
        setStatus('success');
      } else if (status === 'error') {
        setStatus('error');
        setError(error ? decodeURIComponent(error) : 'Failed to connect Google Calendar. Please try again.');
      } else {
        setStatus('error');
        setError('Unknown OAuth status');
      }
    };

    handleOAuthCallback();
  }, [searchParams]);

  const handleBackToDashboard = () => {
    // Redirect based on user role
    const { role, id } = user || {};
    switch (role) {
      case 'SUPER_ADMIN':
        navigate('/super-admin/dashboard');
        break;
      case 'TENANT_ADMIN':
        navigate('/tenant-admin/dashboard');
        break;
      case 'STARTUP':
        navigate(`/startup-dashboard/${id}`);
        break;
      case 'MENTOR':
        navigate(`/mentor-dashboard/${id}`);
        break;
      case 'COACH':
        navigate(`/coach-dashboard/${id}`);
        break;
      case 'FACILITATOR':
        navigate(`/facilitator-dashboard/${id}`);
        break;
      case 'INVESTOR':
        navigate(`/investor-dashboard/${id}`);
        break;
      case 'ALUMNI':
        navigate(`/alumni-dashboard/${id}`);
        break;
      default:
        navigate('/');
    }
  };

  const handleGoToCalendar = () => {
    if (user?.role === 'TENANT_ADMIN') {
      navigate('/tenant-admin/calendar?status=success');
    } else {
      // For other roles, redirect to their dashboard with success parameter
      const { role, id } = user || {};
      switch (role) {
        case 'STARTUP':
          navigate(`/startup-dashboard/${id}?status=success`);
          break;
        case 'MENTOR':
          navigate(`/mentor-dashboard/${id}?status=success`);
          break;
        case 'COACH':
          navigate(`/coach-dashboard/${id}?status=success`);
          break;
        case 'FACILITATOR':
          navigate(`/facilitator-dashboard/${id}?status=success`);
          break;
        case 'INVESTOR':
          navigate(`/investor-dashboard/${id}?status=success`);
          break;
        case 'ALUMNI':
          navigate(`/alumni-dashboard/${id}?status=success`);
          break;
        default:
          handleBackToDashboard();
      }
    }
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connecting Your Google Calendar
            </h2>
            <p className="text-gray-600">
              Please wait while we finalize your Google Calendar connection...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'Something went wrong while connecting your Google Calendar.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleBackToDashboard}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full mx-4">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
          
          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            🎉 Google Calendar Connected!
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Great! Your Google Calendar has been successfully linked to your IIMS account. 
            You can now schedule meetings, sync events, and manage your calendar seamlessly.
          </p>

          {/* Features List */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
              What you can do now:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Schedule meetings with system users and external guests
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                View your Google Calendar events in IIMS
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Automatic meeting invitations and notifications
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Sync meetings across all your devices
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoToCalendar}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Go to Calendar
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
            
            <button
              onClick={handleBackToDashboard}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              You can disconnect or reconnect your Google Calendar anytime from the Calendar page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthSuccess;
