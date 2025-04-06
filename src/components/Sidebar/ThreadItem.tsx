import React, { useState } from 'react';
import { Squircle, MessageSquare, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Thread } from '../../types';

interface ThreadItemProps {
  thread: Thread;
  workspaceId: string;
}

const ThreadItem: React.FC<ThreadItemProps> = ({ thread, workspaceId }) => {
  const { renameThread, deleteThread, setActiveWorkspaceAndThread, activeThreadId } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(thread.name);
  const isActive = activeThreadId === thread.id;

  const handleRename = () => {
    if (newName.trim()) {
      renameThread(workspaceId, thread.id, newName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewName(thread.name);
    }
  };

  return (
    <div 
      className={`flex items-center justify-between pl-2 pr-1 py-1.5 rounded text-sm ${
        isActive 
          ? 'bg-tertiary-700 bg-opacity-40 text-white' 
          : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
      }`}
    >
      <div 
        className="flex items-center gap-2 cursor-pointer flex-grow"
        onClick={() => setActiveWorkspaceAndThread(workspaceId, thread.id)}
      >
        <MessageSquare size={14} className={isActive ? 'text-fuchsia-400' : 'text-gray-400'} />
        
        {isEditing ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-b border-fuchsia-400 text-white outline-none text-sm flex-grow"
            autoFocus
          />
        ) : (
          <span className="truncate">{thread.name}</span>
        )}
      </div>

      <div className={`flex items-center gap-1 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
            setNewName(thread.name);
          }}
          className="p-1 text-gray-400 hover:text-white"
        >
          <Squircle size={12} />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteThread(workspaceId, thread.id);
          }}
          className="p-1 text-gray-400 hover:text-white"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default ThreadItem;
