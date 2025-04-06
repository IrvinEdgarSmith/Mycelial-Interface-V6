import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { globalSettings, updateGlobalSettings } = useAppContext();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div 
        ref={modalRef}
        className="bg-background-secondary border border-border rounded-lg shadow-xl w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-medium text-white">Global Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">
              OpenRouter API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={globalSettings.openRouterApiKey}
              onChange={(e) => updateGlobalSettings({ ...globalSettings, openRouterApiKey: e.target.value })}
              className="w-full px-3 py-2 bg-background-primary border border-border rounded-md text-white focus:outline-none focus:border-secondary-main"
              placeholder="sk-or-..."
            />
            <p className="mt-1 text-xs text-gray-400">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-300 mb-1">
              Global System Prompt
            </label>
            <textarea
              id="systemPrompt"
              value={globalSettings.systemPrompt}
              onChange={(e) => updateGlobalSettings({ ...globalSettings, systemPrompt: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-background-primary border border-border rounded-md text-white focus:outline-none focus:border-secondary-main resize-none"
              placeholder="You are a helpful AI assistant..."
            />
            <p className="mt-1 text-xs text-gray-400">
              This prompt will be included with every conversation.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-accent-main hover:bg-accent-dark text-background-primary rounded-md font-medium transition-colors"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
