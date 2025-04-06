import { OpenRouterModel } from '../types';

/**
 * Fetches available models from OpenRouter API
 * @param apiKey OpenRouter API key
 * @returns Promise resolving to array of models
 */
export const fetchOpenRouterModels = async (apiKey: string): Promise<OpenRouterModel[]> => {
  // Validate API key is present and properly formatted
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('No API key provided. Please configure your OpenRouter API key in settings.');
  }

  // Ensure the API key starts with the expected prefix
  if (!apiKey.startsWith('sk-or-')) {
    throw new Error('Invalid OpenRouter API key format. API keys should start with "sk-or-"');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed: Invalid or expired API key.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    // Handle network errors or other exceptions
    if (error instanceof Error) {
      // Check for specific auth-related error messages
      if (error.message.includes('No auth credentials found') || 
          error.message.includes('authentication') || 
          error.message.includes('credentials')) {
        throw new Error('Authentication failed: Please check your OpenRouter API key in settings.');
      }
      throw error; // Re-throw the original error if not auth-related
    }
    throw new Error('An unexpected error occurred while fetching models.');
  }
};

/**
 * Sends a message to the OpenRouter API for completion
 * @param apiKey OpenRouter API key
 * @param modelId Model ID to use for completion
 * @param messages Array of messages for the conversation
 * @param systemPrompt Optional system prompt
 * @param temperature Optional temperature value (0-2)
 * @returns Promise resolving to the assistant's response
 */
export const sendMessageToOpenRouter = async (
  apiKey: string, 
  modelId: string, 
  messages: { role: string; content: string }[],
  systemPrompt?: string,
  temperature?: number
): Promise<string> => {
  // Validate API key is present and properly formatted
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('No API key provided. Please configure your OpenRouter API key in settings.');
  }

  // Ensure the API key starts with the expected prefix
  if (!apiKey.startsWith('sk-or-')) {
    throw new Error('Invalid OpenRouter API key format. API keys should start with "sk-or-"');
  }

  // Validate model ID
  if (!modelId || modelId.trim() === '') {
    throw new Error('No model selected. Please select a model in workspace settings.');
  }

  // Properly handle temperature
  // If not provided or undefined, default to 1.0 (OpenRouter default)
  // Make sure it's within valid range of 0-2
  const validTemperature = temperature !== undefined && temperature !== null
    ? Math.min(Math.max(parseFloat(temperature.toString()), 0), 2)
    : 1.0;

  console.log(`Sending request to OpenRouter with temperature: ${validTemperature}`);
  
  const payload = {
    model: modelId,
    messages: systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages,
    temperature: validTemperature // Explicitly include temperature in the payload
  };

  try {
    console.log('OpenRouter API Request Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin, // Add proper referer for tracking
        'X-Title': 'ChatSphere' // Identify your application
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed: Invalid or expired API key.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter API Response:', JSON.stringify(data, null, 2));
    
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    // Handle network errors or other exceptions
    if (error instanceof Error) {
      console.error('OpenRouter API Error:', error);
      
      // Check for specific auth-related error messages
      if (error.message.includes('No auth credentials found') || 
          error.message.includes('authentication') || 
          error.message.includes('credentials')) {
        throw new Error('Authentication failed: Please check your OpenRouter API key in settings.');
      }
      throw error; // Re-throw the original error if not auth-related
    }
    throw new Error('An unexpected error occurred while generating a response.');
  }
};
