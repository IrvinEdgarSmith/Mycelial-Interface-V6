import React from 'react';
import { useAppContext } from '../../context/AppContext';
import NewWorkspaceButton from './NewWorkspaceButton';
import WorkspaceItem from './WorkspaceItem';

const Sidebar: React.FC = () => {
  const { workspaces } = useAppContext();

  return (
    <div className="h-full flex flex-col bg-background-secondary border-r border-border">
      <div className="p-3">
        <NewWorkspaceButton />
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {workspaces.length === 0 ? (
          <div className="text-center text-gray-400 mt-8 px-4">
            <p className="text-sm">No workspaces yet</p>
            <p className="text-xs mt-2">Create a new workspace to get started</p>
          </div>
        ) : (
          workspaces.map((workspace) => (
            <WorkspaceItem key={workspace.id} workspace={workspace} />
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
