import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { CurrencyProvider } from './app/context/CurrencyContext';
import { LanguageProvider } from './app/context/LanguageContext';
import { ThemeProvider } from './app/context/ThemeContext';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
);
