import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import EmptyChatState from './EmptyChatState';

const ChatArea: React.FC = () => {
  const { workspaces, activeWorkspaceId, activeThreadId } = useAppContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find active workspace and thread
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const activeThread = activeWorkspace?.threads.find(t => t.id === activeThreadId);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages]);

  if (!activeWorkspace || !activeThread) {
    return <EmptyChatState />;
  }

  // Make sure we have actual messages to display
  const messages = activeThread.messages || [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 bg-background-primary">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-white mb-2">New Chat</h2>
            <p className="text-gray-400 text-center max-w-md">
              Send a message to start chatting with the AI assistant
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </div>
      
      <ChatInput 
        workspaceId={activeWorkspace.id} 
        threadId={activeThread.id} 
      />
    </div>
  );
};

export default ChatArea;
