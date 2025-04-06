import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workspace, Thread, GlobalSettings, WorkspaceSettings, Message } from '../types';

interface AppContextType {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  activeThreadId: string | null;
  globalSettings: GlobalSettings;
  addWorkspace: () => void;
  renameWorkspace: (id: string, name: string) => void;
  toggleWorkspace: (id: string) => void;
  addThread: (workspaceId: string) => void;
  renameThread: (workspaceId: string, threadId: string, name: string) => void;
  deleteThread: (workspaceId: string, threadId: string) => void;
  setActiveWorkspaceAndThread: (workspaceId: string, threadId: string) => void;
  addMessage: (workspaceId: string, threadId: string, content: string, role: 'user' | 'assistant') => void;
  updateGlobalSettings: (settings: GlobalSettings) => void;
  updateWorkspaceSettings: (workspaceId: string, settings: WorkspaceSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  openRouterApiKey: '',
  systemPrompt: 'You are a helpful AI assistant that responds accurately and concisely.',
};

const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  selectedModelId: null,
  temperature: 0.7, // Default temperature value
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(DEFAULT_GLOBAL_SETTINGS);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem('workspaces');
    const savedActiveWorkspaceId = localStorage.getItem('activeWorkspaceId');
    const savedActiveThreadId = localStorage.getItem('activeThreadId');
    const savedGlobalSettings = localStorage.getItem('globalSettings');

    if (savedWorkspaces) {
      try {
        const parsed = JSON.parse(savedWorkspaces);
        // Ensure all workspaces have settings property with temperature
        const updatedWorkspaces = parsed.map((workspace: any) => ({
          ...workspace,
          settings: {
            ...DEFAULT_WORKSPACE_SETTINGS,
            ...(workspace.settings || {}),
            // Ensure temperature exists and is in valid range
            temperature: workspace.settings?.temperature !== undefined 
              ? Math.min(Math.max(workspace.settings.temperature, 0), 2) 
              : DEFAULT_WORKSPACE_SETTINGS.temperature
          }
        }));
        setWorkspaces(updatedWorkspaces);
      } catch (e) {
        console.error('Error parsing workspaces from localStorage:', e);
        setWorkspaces([]);
      }
    }
    
    if (savedActiveWorkspaceId) {
      setActiveWorkspaceId(savedActiveWorkspaceId);
    }
    
    if (savedActiveThreadId) {
      setActiveThreadId(savedActiveThreadId);
    }

    if (savedGlobalSettings) {
      try {
        setGlobalSettings(JSON.parse(savedGlobalSettings));
      } catch (e) {
        console.error('Error parsing global settings from localStorage:', e);
        setGlobalSettings(DEFAULT_GLOBAL_SETTINGS);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('workspaces', JSON.stringify(workspaces));
    if (activeWorkspaceId) {
      localStorage.setItem('activeWorkspaceId', activeWorkspaceId);
    }
    if (activeThreadId) {
      localStorage.setItem('activeThreadId', activeThreadId);
    }
    localStorage.setItem('globalSettings', JSON.stringify(globalSettings));
  }, [workspaces, activeWorkspaceId, activeThreadId, globalSettings]);

  const addWorkspace = () => {
    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name: 'New Workspace',
      threads: [],
      isExpanded: true,
      createdAt: Date.now(),
      settings: { ...DEFAULT_WORKSPACE_SETTINGS }
    };
    setWorkspaces((prevWorkspaces) => [...prevWorkspaces, newWorkspace]);
  };

  const renameWorkspace = (id: string, name: string) => {
    setWorkspaces((prevWorkspaces) =>
      prevWorkspaces.map((workspace) =>
        workspace.id === id ? { ...workspace, name } : workspace
      )
    );
  };

  const toggleWorkspace = (id: string) => {
    setWorkspaces((prevWorkspaces) =>
      prevWorkspaces.map((workspace) =>
        workspace.id === id ? { ...workspace, isExpanded: !workspace.isExpanded } : workspace
      )
    );
  };

  const addThread = (workspaceId: string) => {
    const newThread: Thread = {
      id: `thread-${Date.now()}`,
      name: 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    
    setWorkspaces((prevWorkspaces) =>
      prevWorkspaces.map((workspace) =>
        workspace.id === workspaceId
          ? { ...workspace, threads: [...workspace.threads, newThread] }
          : workspace
      )
    );
    
    setActiveWorkspaceId(workspaceId);
    setActiveThreadId(newThread.id);
  };

  const renameThread = (workspaceId: string, threadId: string, name: string) => {
    setWorkspaces((prevWorkspaces) =>
      prevWorkspaces.map((workspace) =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              threads: workspace.threads.map((thread) =>
                thread.id === threadId ? { ...thread, name } : thread
              ),
            }
          : workspace
      )
    );
  };

  const deleteThread = (workspaceId: string, threadId: string) => {
    setWorkspaces((prevWorkspaces) =>
      prevWorkspaces.map((workspace) =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              threads: workspace.threads.filter((thread) => thread.id !== threadId),
            }
          : workspace
      )
    );
    
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
    }
  };

  const setActiveWorkspaceAndThread = (workspaceId: string, threadId: string) => {
    setActiveWorkspaceId(workspaceId);
    setActiveThreadId(threadId);
  };

  const addMessage = (workspaceId: string, threadId: string, content: string, role: 'user' | 'assistant') => {
    // Create a unique ID for the message that includes a timestamp and random string
    // to ensure there are no collisions if messages are added in quick succession
    const randomId = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now();
    const messageId = `message-${role}-${timestamp}-${randomId}`;
    
    const newMessage: Message = {
      id: messageId,
      content,
      role,
      timestamp,
    };
    
    // Use the functional form of setState to ensure we're working with the latest state
    // This is crucial for preventing race conditions when adding multiple messages in rapid succession
    setWorkspaces((prevWorkspaces) => {
      // Find the workspace first to make sure we're operating on the latest state
      const workspaceIndex = prevWorkspaces.findIndex(w => w.id === workspaceId);
      if (workspaceIndex === -1) return prevWorkspaces;
      
      // Make a copy of the workspaces array
      const updatedWorkspaces = [...prevWorkspaces];
      const workspace = updatedWorkspaces[workspaceIndex];
      
      // Find the thread
      const threadIndex = workspace.threads.findIndex(t => t.id === threadId);
      if (threadIndex === -1) return prevWorkspaces;
      
      // Create a new thread object with the message added
      const thread = workspace.threads[threadIndex];
      const updatedThread = {
        ...thread,
        messages: [...thread.messages, newMessage]
      };
      
      // Update the threads array in the workspace
      const updatedThreads = [...workspace.threads];
      updatedThreads[threadIndex] = updatedThread;
      
      // Update the workspace with the new threads array
      updatedWorkspaces[workspaceIndex] = {
        ...workspace,
        threads: updatedThreads
      };
      
      return updatedWorkspaces;
    });
  };

  const updateGlobalSettings = (settings: GlobalSettings) => {
    setGlobalSettings(settings);
  };

  const updateWorkspaceSettings = (workspaceId: string, settings: WorkspaceSettings) => {
    setWorkspaces((prevWorkspaces) =>
      prevWorkspaces.map((workspace) =>
        workspace.id === workspaceId
          ? { ...workspace, settings }
          : workspace
      )
    );
  };

  const value = {
    workspaces,
    activeWorkspaceId,
    activeThreadId,
    globalSettings,
    addWorkspace,
    renameWorkspace,
    toggleWorkspace,
    addThread,
    renameThread,
    deleteThread,
    setActiveWorkspaceAndThread,
    addMessage,
    updateGlobalSettings,
    updateWorkspaceSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
