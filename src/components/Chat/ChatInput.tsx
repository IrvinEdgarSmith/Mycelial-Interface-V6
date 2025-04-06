import React, { useState, useRef, useEffect } from 'react';
import { CircleAlert, Loader, Send, Thermometer } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { sendMessageToOpenRouter } from '../../utils/openRouterApi';

interface ChatInputProps {
  workspaceId: string;
  threadId: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ workspaceId, threadId }) => {
  const { addMessage, globalSettings, workspaces } = useAppContext();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get workspace settings
  const workspace = workspaces.find(w => w.id === workspaceId);
  const selectedModelId = workspace?.settings.selectedModelId;
  const temperature = workspace?.settings.temperature || 0.7;

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Clear error when user types
  useEffect(() => {
    if (error && message) {
      setError(null);
    }
  }, [message, error]);

  // Get temperature color based on value
  const getTemperatureColor = (temp: number): string => {
    if (temp < 0.3) return "text-blue-400";
    if (temp < 0.7) return "text-green-400";
    if (temp < 1.3) return "text-yellow-400";
    return "text-red-400";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;
    
    // Validate API key and model before proceeding
    if (!globalSettings.openRouterApiKey || globalSettings.openRouterApiKey.trim() === '') {
      setError("OpenRouter API key is missing. Please add your API key in global settings.");
      return;
    }

    if (!selectedModelId) {
      setError("No model selected. Please select a model in workspace settings.");
      return;
    }
    
    // Important: Set loading state BEFORE clearing the input
    setIsLoading(true);
    setError(null);
    
    // Store current message before clearing the input
    const currentMessage = trimmedMessage;
    
    // Clear the input field 
    setMessage('');
    
    try {
      // 1. First add the user message to the conversation
      // This returns a promise that we can await to ensure the state update completes
      addMessage(workspaceId, threadId, currentMessage, 'user');
      
      // 2. Now we need to get the messages from the updated state
      // Find the active workspace and thread after adding the user message
      const updatedWorkspace = workspaces.find(w => w.id === workspaceId);
      const updatedThread = updatedWorkspace?.threads.find(t => t.id === threadId);
      
      if (!updatedThread) {
        throw new Error("Failed to find the current conversation.");
      }
      
      // 3. Format messages for the API - include all current messages
      const formattedMessages = updatedThread.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Safety check - make sure the user message we just added is included
      // If it's not, manually add it to ensure API has the latest context
      const lastMessage = formattedMessages[formattedMessages.length - 1];
      if (!lastMessage || lastMessage.content !== currentMessage) {
        formattedMessages.push({
          role: 'user',
          content: currentMessage
        });
      }
      
      // 4. Send to OpenRouter API with workspace's temperature setting
      console.log(`Using temperature: ${temperature} for model: ${selectedModelId}`);
      const response = await sendMessageToOpenRouter(
        globalSettings.openRouterApiKey,
        selectedModelId,
        formattedMessages,
        globalSettings.systemPrompt,
        temperature
      );
      
      // 5. Add AI response as a new message
      addMessage(workspaceId, threadId, response, 'assistant');
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Set error message
      let errorMessage = "Sorry, there was an error processing your request.";
      
      if (error instanceof Error) {
        errorMessage = `Error getting AI response: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-border bg-background-secondary p-4">
      <form 
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto"
      >
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-md p-3 mb-3 flex items-start text-sm text-red-200">
            <CircleAlert size={16} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Waiting for response..." : "Message the AI..."}
            className="w-full resize-none rounded-lg border border-border bg-background-primary px-4 py-3 pr-12 outline-none focus:border-secondary-main min-h-[48px] max-h-[200px] overflow-auto"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 rounded-md hover:bg-background-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader size={20} className="text-accent-main animate-spin" />
            ) : (
              <Send size={20} className="text-accent-main" />
            )}
          </button>
        </div>
        
        {!globalSettings.openRouterApiKey ? (
          <div className="text-xs text-red-300 mt-1 text-right">
            Missing API key. Add your key in global settings.
          </div>
        ) : !selectedModelId ? (
          <div className="text-xs text-amber-300 mt-1 text-right">
            No model selected. Select a model in workspace settings.
          </div>
        ) : (
          <div className="text-xs flex justify-end items-center gap-1 mt-1">
            {isLoading ? (
              <span className="text-gray-400">Generating response...</span>
            ) : (
              <>
                <span className="text-gray-400">Using {selectedModelId.split('/').pop()} with</span>
                <Thermometer size={14} className={getTemperatureColor(temperature)} />
                <span className={`font-mono ${getTemperatureColor(temperature)}`}>{temperature.toFixed(1)}</span>
                <span className="text-gray-400">temperature</span>
              </>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatInput;
