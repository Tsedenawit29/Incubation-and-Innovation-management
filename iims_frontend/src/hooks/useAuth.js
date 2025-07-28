import { createContext, useContext, useState, useEffect } from "react";

// Create the authentication context
const AuthContext = createContext();

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

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    console.log("AuthProvider - Checking stored token:", storedToken ? "present" : "missing");
    console.log("AuthProvider - Checking stored user:", storedUser ? "present" : "missing");
    
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Error parsing stored user:", e);
          // Fallback to basic user object
          setUser({ id: "00000000-0000-0000-0000-000000000000", email: "admin@iims.com", role: "SUPER_ADMIN" });
        }
      } else {
        // Fallback to basic user object
        setUser({ id: "00000000-0000-0000-0000-000000000000", email: "admin@iims.com", role: "SUPER_ADMIN" });
      }
    }
    setLoading(false);
  }, []);

  const login = (jwt, userData) => {
    console.log("AuthProvider - Login called with token:", jwt ? "present" : "missing");
    console.log("AuthProvider - Login called with userData:", userData);
    
    setToken(jwt);
    setUser(userData);
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    console.log("AuthProvider - Logout called");
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isAuthenticated = !!token;

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 