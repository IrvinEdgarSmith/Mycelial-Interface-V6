import React from 'react';
import { MessageSquare, CirclePlus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const EmptyChatState: React.FC = () => {
  const { workspaces, addWorkspace, addThread } = useAppContext();

  const handleNewChat = () => {
    if (workspaces.length === 0) {
      // Create a new workspace and add a thread
      addWorkspace();
      // The new workspace becomes the last workspace in the array
      setTimeout(() => {
        if (workspaces.length > 0) {
          addThread(workspaces[workspaces.length - 1].id);
        }
      }, 100);
    } else {
      // Add a thread to the first workspace
      addThread(workspaces[0].id);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 mb-6 rounded-full bg-background-tertiary flex items-center justify-center">
        <MessageSquare size={32} className="text-tertiary-main" />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-4">Welcome to your AI Chat</h1>
      
      <p className="text-gray-400 text-center max-w-md mb-8">
        Start a new conversation to chat with the AI assistant
      </p>
      
      <button
        onClick={handleNewChat}
        className="px-4 py-2 bg-accent-main hover:bg-accent-dark text-background-primary rounded-md font-medium flex items-center gap-2 transition-colors"
      >
        <CirclePlus size={16} />
        New Chat
      </button>
    </div>
  );
};

export default EmptyChatState;
