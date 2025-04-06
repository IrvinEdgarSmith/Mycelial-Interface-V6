import React from 'react';
import { CirclePlus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const NewWorkspaceButton: React.FC = () => {
  const { addWorkspace } = useAppContext();

  return (
    <button
      onClick={addWorkspace}
      className="flex items-center gap-2 w-full py-3 px-4 text-white hover:bg-opacity-30 hover:bg-white rounded-md transition-colors"
    >
      <CirclePlus size={16} className="text-cyan-400" />
      <span className="font-medium text-sm">New Workspace</span>
    </button>
  );
};

export default NewWorkspaceButton;
