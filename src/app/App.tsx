import { useState, useEffect } from 'react';
import { AuthPage } from './components/auth-page';
import { Dashboard } from './components/dashboard';

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (token: string) => {
    localStorage.setItem('accessToken', token);
    setAccessToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setAccessToken(null);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body fg-body">
        <div className="text-center" >
          <div className="spinner-border rounded-pill app-h-12 app-w-12 border-bottom border-2 border-primary mx-auto mb-4"></div>
          <p className="fg-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return <Dashboard accessToken={accessToken} onLogout={handleLogout} />;
}
