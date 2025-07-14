import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const { token, login, logout } = useAuth();

  if (!token) return <LoginPage onLogin={login} />;
  return <DashboardPage token={token} />;
}

export default App; 