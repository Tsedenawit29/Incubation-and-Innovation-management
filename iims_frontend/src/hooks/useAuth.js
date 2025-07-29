import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi } from "../api/users"; // Import your actual login API function

// Create the authentication context
export const AuthContext = createContext(null);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Auth Provider component
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null); // State for authentication errors

  // Helper function to decode JWT and check expiration
  const checkTokenExpiration = (jwtToken) => {
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      const exp = payload.exp; // Expiration time in seconds since epoch
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds since epoch

      return exp < currentTime;
    } catch (e) {
      console.error("Error decoding token or checking expiration:", e);
      return true; // Assume expired or invalid if decoding fails
    }
  };

  // Function to handle manual login (called by LoginPage)
  const loginUser = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const loginResponse = await loginApi(email, password); // Use the imported API function
      if (loginResponse && loginResponse.token && loginResponse.userId) {
        const userData = {
          id: loginResponse.userId,
          email: loginResponse.email, // Assuming email is in response
          role: loginResponse.role,
          name: loginResponse.fullName, // Assuming fullName is in response
          tenantId: loginResponse.tenantId || null
        };

        setToken(loginResponse.token);
        setUser(userData);
        localStorage.setItem('springBootAuthToken', loginResponse.token);
        localStorage.setItem('springBootUser', JSON.stringify(userData));
        console.log("Manual login successful and token stored.");
        return loginResponse; // Return response for component to handle navigation
      } else {
        throw new Error("Login response missing token, userId, or role.");
      }
    } catch (err) {
      console.error("Manual login failed:", err);
      setAuthError(`Authentication failed: ${err.message}. Please check credentials.`);
      setUser(null);
      setToken(null);
      localStorage.removeItem('springBootAuthToken');
      localStorage.removeItem('springBootUser');
      throw err; // Re-throw to allow component to catch and display error
    } finally {
      setLoading(false);
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const loadAuthData = () => {
      setLoading(true);
      setAuthError(null); // Clear any previous auth errors

      const storedToken = localStorage.getItem("springBootAuthToken");
      const storedUserJson = localStorage.getItem("springBootUser");

      console.log("AuthProvider - Checking stored token:", storedToken ? "present" : "missing");
      console.log("AuthProvider - Checking stored user:", storedUserJson ? "present" : "missing");

      if (storedToken && storedUserJson) {
        // If stored data exists, use it
        try {
          // Check if the token is expired before setting state
          const isTokenExpired = checkTokenExpiration(storedToken);

          if (isTokenExpired) {
            console.log("Stored token is expired. Clearing and prompting re-login.");
            localStorage.removeItem("springBootAuthToken");
            localStorage.removeItem("springBootUser");
            setUser(null);
            setToken(null);
            setAuthError("Your session has expired. Please log in again.");
          } else {
            const parsedUser = JSON.parse(storedUserJson);
            setToken(storedToken);
            setUser(parsedUser);
            console.log("AuthProvider - Loaded user from localStorage:", parsedUser);
          }
        } catch (e) {
          console.error("AuthProvider - Error parsing stored user data:", e);
          // Clear corrupted data if parsing fails
          localStorage.removeItem("springBootAuthToken");
          localStorage.removeItem("springBootUser");
          setAuthError("Corrupted authentication data. Please log in again.");
        }
      }
      setLoading(false); // Authentication state determined
    };

    loadAuthData();
  }, []); // Run once on component mount

  const logout = () => {
    console.log("AuthProvider - Logout called");
    setToken(null);
    setUser(null);
    localStorage.removeItem("springBootAuthToken");
    localStorage.removeItem("springBootUser");
    setAuthError(null); // Clear any errors on logout
    window.location.href = '/login'; // Redirect directly to login page on logout
  };

  const isAuthenticated = !!token && !!user; // User is authenticated if both token and user object exist

  const value = {
    token,
    user,
    loginUser, // Expose loginUser for LoginPage
    logout,
    isAuthenticated,
    loading,
    authError // Expose authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
