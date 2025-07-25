import { createContext, useContext, useState, useEffect } from "react";
// No longer importing apiLogin here, as LoginPage will handle the initial API call.

// Create the authentication context
const AuthContext = createContext(null);

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
          const parsedUser = JSON.parse(storedUserJson);
          setToken(storedToken);
          setUser(parsedUser);
          console.log("AuthProvider - Loaded user from localStorage:", parsedUser);
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

  // This 'login' function is called by your LoginPage after successful API login.
  const login = (jwt, userData) => {
    console.log("AuthProvider - Manual login called with token:", jwt ? "present" : "missing");
    console.log("AuthProvider - Manual login called with userData:", userData);

    setToken(jwt);
    setUser(userData);
    localStorage.setItem("springBootAuthToken", jwt);
    localStorage.setItem("springBootUser", JSON.stringify(userData));
    setAuthError(null); // Clear any errors on successful manual login
  };

  const logout = () => {
    console.log("AuthProvider - Logout called");
    setToken(null);
    setUser(null);
    localStorage.removeItem("springBootAuthToken");
    localStorage.removeItem("springBootUser");
    setAuthError(null); // Clear any errors on logout
    window.location.reload(); // Simple reload to reset app state
  };

  const isAuthenticated = !!token && !!user; // User is authenticated if both token and user object exist

  const value = {
    token,
    user,
    login, // This is the function LoginPage will call
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
