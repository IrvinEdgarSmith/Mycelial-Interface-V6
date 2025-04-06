export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

export interface Thread {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
}

export interface WorkspaceSettings {
  selectedModelId: string | null;
  temperature: number; // New temperature setting (0-2 range)
}

export interface Workspace {
  id: string;
  name: string;
  threads: Thread[];
  isExpanded: boolean;
  createdAt: number;
  settings: WorkspaceSettings;
}

export interface GlobalSettings {
  openRouterApiKey: string;
  systemPrompt: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  provider: string;
  config?: {
    context_length?: number;
    filetype_capabilities?: string[];
  };
  pricing?: {
    prompt?: number;
    completion?: number;
  };
}
