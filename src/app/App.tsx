import { useState, useEffect } from 'react';
import { AuthPage } from './components/auth-page';
import { Dashboard } from './components/dashboard';
import { CurrencyProvider } from './context/CurrencyContext';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!accessToken) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <CurrencyProvider>
      <Dashboard accessToken={accessToken} onLogout={handleLogout} />
    </CurrencyProvider>
  );
}
