import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CirclePlus, Settings, Squircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Workspace } from '../../types';
import ThreadItem from './ThreadItem';
import WorkspaceSettingsModal from './WorkspaceSettingsModal';

interface WorkspaceItemProps {
  workspace: Workspace;
}

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({ workspace }) => {
  const { toggleWorkspace, renameWorkspace, addThread } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(workspace.name);
  const [showSettings, setShowSettings] = useState(false);

  const handleRename = () => {
    if (newName.trim()) {
      renameWorkspace(workspace.id, newName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewName(workspace.name);
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between px-2 py-2 hover:bg-opacity-10 hover:bg-white rounded">
        <div 
          className="flex items-center gap-1 cursor-pointer flex-grow"
          onClick={() => toggleWorkspace(workspace.id)}
        >
          {workspace.isExpanded ? (
            <ChevronDown size={16} className="text-gray-400" />
          ) : (
            <ChevronRight size={16} className="text-gray-400" />
          )}
          
          {isEditing ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-b border-cyan-400 text-white px-1 outline-none text-sm"
              autoFocus
            />
          ) : (
            <span className="text-white text-sm font-medium">{workspace.name}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => addThread(workspace.id)}
            className="p-1 text-gray-400 hover:text-cyan-400 rounded"
            title="New thread"
          >
            <CirclePlus size={14} />
          </button>
          
          <button
            onClick={() => {
              setIsEditing(true);
              setNewName(workspace.name);
            }}
            className="p-1 text-gray-400 hover:text-white rounded"
            title="Rename workspace"
          >
            <Squircle size={14} />
          </button>
          
          <button
            onClick={toggleSettings}
            className="p-1 text-gray-400 hover:text-white rounded"
            title="Workspace settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {workspace.isExpanded && workspace.threads.length > 0 && (
        <div className="ml-6 mt-1 space-y-1">
          {workspace.threads.map((thread) => (
            <ThreadItem 
              key={thread.id} 
              thread={thread} 
              workspaceId={workspace.id} 
            />
          ))}
        </div>
      )}

      {showSettings && (
        <WorkspaceSettingsModal
          workspace={workspace}
          onClose={toggleSettings}
        />
      )}
    </div>
  );
};

export default WorkspaceItem;
