import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useToast } from "../components/ui/use-toast";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { loginUser, changePassword, currentUser, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChangePassword = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handlePasswordSave = useCallback(async (email, currentPassword, newPassword) => {
    setLoading(true);
    setModalError('');
    try {
      if (!email) {
        throw new Error('Email is required to change password');
      }
      
      // Call the updated changePassword function with email
      const result = await changePassword(email, currentPassword, newPassword);
      
      // Clear any existing auth data
      localStorage.removeItem('springBootAuthToken');
      localStorage.removeItem('springBootUser');
      
      // Show success message from the result
      toast({
        title: 'Success',
        description: result.message || 'Your password has been updated. Please log in with your new password.',
        variant: 'default',
      });
      
      // Close the modal and reset form
      setIsModalOpen(false);
      setEmail(email); // Keep the email filled in for login
      setPassword('');
      setModalSuccess(true);
    } catch (error) {
      console.error('Password change error:', error);
      setModalError(error.message || 'Failed to update password. Please check your current password and try again.');
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password. Please check your current password and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [changePassword, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
    } catch (error) {
      setError(error.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/logo.jpg"
            alt="IIMS Logo"
            className="h-20 w-20 rounded-full shadow-md"
          />
        </div>

        {/* Title */}
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Welcome Back
        </h2>
        <p className="mt-1 text-center text-gray-500">
          Sign in to continue to IIMS
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <div className="flex flex-col space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  Change Password
                </button>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg text-white font-medium bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </form>
      </div>

      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalError('');
          setModalSuccess(false);
        }}
        user={currentUser || (email ? { email } : null)}
        onSave={handlePasswordSave}
        error={modalError}
        success={modalSuccess}
        loading={loading}
      />
    </div>
  );
}
