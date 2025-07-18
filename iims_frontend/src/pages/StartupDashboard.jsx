import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export default function StartupDashboard() {
  const { id } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-brand-primary">Startup Dashboard</h1>
        <p className="mb-2 text-brand-dark">Welcome, Startup user!</p>
        <p className="mb-4 text-brand-dark">Your ID: <span className="font-mono">{id}</span></p>
        <button
          onClick={handleLogout}
          className="mt-6 bg-brand-primary hover:bg-brand-dark text-white px-4 py-2 rounded w-full font-semibold shadow"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 