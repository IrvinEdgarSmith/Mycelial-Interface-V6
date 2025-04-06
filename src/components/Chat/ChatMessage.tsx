import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-center ${isUser ? 'justify-end mb-1' : 'mb-1'}`}>
          {!isUser && (
            <div className="w-6 h-6 rounded-full bg-secondary-main bg-opacity-30 flex items-center justify-center mr-2">
              <Bot size={14} className="text-secondary-main" />
            </div>
          )}
          <div className="text-xs font-medium text-gray-400">
            {isUser ? 'You' : 'Assistant'}
          </div>
          {isUser && (
            <div className="w-6 h-6 rounded-full bg-tertiary-main bg-opacity-30 flex items-center justify-center ml-2">
              <User size={14} className="text-tertiary-main" />
            </div>
          )}
        </div>
        
        <div className={`rounded-lg py-3 px-4 ${
          isUser 
            ? 'bg-tertiary-main bg-opacity-20 text-white rounded-tr-none' 
            : 'bg-background-tertiary text-white rounded-tl-none'
        }`}>
          <div className="prose prose-invert prose-sm">{message.content}</div>
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {/* Empty div for spacing when user message */}
      {isUser && <div className="w-2 order-1"></div>}
      
      {/* Empty div for spacing when assistant message */}
      {!isUser && <div className="w-2 order-2"></div>}
    </div>
  );
};

export default ChatMessage;
