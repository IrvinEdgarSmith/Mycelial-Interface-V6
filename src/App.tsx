import React, { useEffect, useState } from 'react';
import './index.css';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar/Sidebar';
import ChatArea from './components/Chat/ChatArea';
import SettingsButton from './components/Settings/SettingsButton';
import SettingsModal from './components/Settings/SettingsModal';
import { theme } from './theme';

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Include required font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Apply theme colors to CSS variables
    const root = document.documentElement;
    
    root.style.setProperty('--color-background-primary', theme.colors.background.primary);
    root.style.setProperty('--color-background-secondary', theme.colors.background.secondary);
    root.style.setProperty('--color-background-tertiary', theme.colors.background.tertiary);
    
    root.style.setProperty('--color-secondary-main', theme.colors.secondary.main);
    root.style.setProperty('--color-secondary-light', theme.colors.secondary.light);
    root.style.setProperty('--color-secondary-dark', theme.colors.secondary.dark);
    
    root.style.setProperty('--color-tertiary-main', theme.colors.tertiary.main);
    root.style.setProperty('--color-tertiary-light', theme.colors.tertiary.light);
    root.style.setProperty('--color-tertiary-dark', theme.colors.tertiary.dark);
    
    root.style.setProperty('--color-accent-main', theme.colors.accent.main);
    root.style.setProperty('--color-accent-light', theme.colors.accent.light);
    root.style.setProperty('--color-accent-dark', theme.colors.accent.dark);
    
    root.style.setProperty('--color-text-primary', theme.colors.text.primary);
    root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--color-border', theme.colors.border);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <AppProvider>
      <div className="h-screen flex overflow-hidden bg-background-primary text-text-primary font-sans">
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 relative">
          <div className="absolute top-4 right-4 z-10">
            <SettingsButton onClick={toggleSettings} />
          </div>
          <ChatArea />
          {showSettings && <SettingsModal onClose={toggleSettings} />}
        </div>
      </div>
    </AppProvider>
  );
};

export default App;
