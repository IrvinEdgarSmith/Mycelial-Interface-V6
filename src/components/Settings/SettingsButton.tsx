import React from 'react';
import { Settings } from 'lucide-react';

interface SettingsButtonProps {
  onClick: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full bg-background-tertiary hover:bg-opacity-80 transition-colors"
      title="Global Settings"
    >
      <Settings size={20} className="text-secondary-main" />
    </button>
  );
};

export default SettingsButton;
