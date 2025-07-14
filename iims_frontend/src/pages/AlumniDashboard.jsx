import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export default function AlumniDashboard() {
  const { id } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Alumni Dashboard</h1>
        <p>Welcome, Alumni!</p>
        <p>Your ID: <span className="font-mono">{id}</span></p>
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 