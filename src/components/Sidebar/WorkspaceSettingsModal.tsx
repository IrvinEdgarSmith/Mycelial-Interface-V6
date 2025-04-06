import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, CircleAlert, ExternalLink, Search, Thermometer, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Workspace, OpenRouterModel } from '../../types';
import { fetchOpenRouterModels } from '../../utils/openRouterApi';

interface WorkspaceSettingsModalProps {
  workspace: Workspace;
  onClose: () => void;
}

const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({ workspace, onClose }) => {
  const { updateWorkspaceSettings, globalSettings } = useAppContext();
  const modalRef = useRef<HTMLDivElement>(null);
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<OpenRouterModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<OpenRouterModel | null>(null);
  const [temperature, setTemperature] = useState(workspace.settings.temperature || 0.7);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Fetch models on load if API key exists
  useEffect(() => {
    const loadModels = async () => {
      if (!globalSettings.openRouterApiKey || globalSettings.openRouterApiKey.trim() === '') {
        setError('Please set your OpenRouter API key in global settings first');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fetchedModels = await fetchOpenRouterModels(globalSettings.openRouterApiKey);
        setModels(fetchedModels);
        setFilteredModels(fetchedModels);
        
        // Set selected model if workspace has one
        if (workspace.settings.selectedModelId) {
          const workspaceModel = fetchedModels.find(m => m.id === workspace.settings.selectedModelId);
          if (workspaceModel) {
            setSelectedModel(workspaceModel);
          }
        }
      } catch (err) {
        console.error('Error loading models:', err);
        let errorMessage = 'Failed to load models. Please check your API key and try again.';
        
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, [globalSettings.openRouterApiKey, workspace.settings.selectedModelId]);

  // Filter models based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredModels(models);
    } else {
      const filtered = models.filter((model) => {
        const nameMatch = model.name && typeof model.name === 'string' ? 
          model.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        
        const providerMatch = model.provider && typeof model.provider === 'string' ? 
          model.provider.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        
        const idMatch = model.id && typeof model.id === 'string' ? 
          model.id.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        
        return nameMatch || providerMatch || idMatch;
      });
      setFilteredModels(filtered);
    }
  }, [searchQuery, models]);

  const handleModelSelect = (model: OpenRouterModel) => {
    setSelectedModel(model);
    updateWorkspaceSettings(workspace.id, { 
      ...workspace.settings, 
      selectedModelId: model.id 
    });
    setIsDropdownOpen(false);
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTemperature = parseFloat(e.target.value);
    setTemperature(newTemperature);
    // Update workspace settings with new temperature
    updateWorkspaceSettings(workspace.id, {
      ...workspace.settings,
      temperature: newTemperature
    });
  };

  // Get temperature description based on value
  const getTemperatureDescription = (temp: number): string => {
    if (temp < 0.3) return "More deterministic and focused responses";
    if (temp < 0.7) return "Balanced creativity and predictability";
    if (temp < 1.3) return "Creative with some unpredictability";
    return "Highly random and creative responses";
  };

  // Get color class for temperature visualization
  const getTemperatureColorClass = (temp: number): string => {
    if (temp < 0.3) return "text-blue-400";
    if (temp < 0.7) return "text-green-400";
    if (temp < 1.3) return "text-yellow-400";
    return "text-red-400";
  };

  const handleSave = () => {
    onClose();
  };

  // Helper function to safely format pricing values
  const formatPrice = (value: any): string => {
    // Check if the value is a number or can be converted to a number
    if (value === undefined || value === null) {
      return "N/A";
    }
    
    const numValue = typeof value === 'number' ? value : Number(value);
    
    // Check if conversion resulted in a valid number
    if (isNaN(numValue)) {
      return "N/A";
    }
    
    return numValue.toFixed(6);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div 
        ref={modalRef}
        className="bg-background-secondary border border-border rounded-lg shadow-xl w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-medium text-white">
            {workspace.name} Settings
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language Model
            </label>
            
            {error ? (
              <div className="bg-red-900/30 border border-red-800 rounded-md p-3 mb-3 flex items-start text-sm text-red-200">
                <CircleAlert size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <>
                {/* Model selector */}
                <div className="relative">
                  {/* Search input */}
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Search models..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-background-primary border border-border rounded-md text-white focus:outline-none focus:border-secondary-main"
                      onFocus={() => setIsDropdownOpen(true)}
                    />
                    <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  
                  {/* Selected model display */}
                  <div 
                    className="flex items-center justify-between w-full px-3 py-2 bg-background-primary border border-border rounded-md cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="flex items-center">
                      {isLoading ? (
                        <span className="text-gray-400">Loading models...</span>
                      ) : selectedModel ? (
                        <>
                          <span className="text-white">{selectedModel.name || 'Unknown model'}</span>
                          <span className="text-gray-400 text-xs ml-2">({selectedModel.provider || 'Unknown provider'})</span>
                        </>
                      ) : (
                        <span className="text-gray-400">Select a model</span>
                      )}
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                  
                  {/* Dropdown for models */}
                  {isDropdownOpen && (
                    <div className="absolute w-full mt-1 bg-background-primary border border-border rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
                      {filteredModels.length > 0 ? (
                        filteredModels.map((model) => (
                          <div
                            key={model.id}
                            className="px-3 py-2 hover:bg-background-tertiary cursor-pointer"
                            onClick={() => handleModelSelect(model)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-white font-medium">{model.name || 'Unknown model'}</div>
                                <div className="text-gray-400 text-xs">{model.provider || 'Unknown provider'}</div>
                              </div>
                              <div className="text-xs text-gray-400">
                                ${formatPrice(model.pricing?.prompt)}/{formatPrice(model.pricing?.completion)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-400">No models found</div>
                      )}
                    </div>
                  )}
                </div>
                
                <p className="mt-1 text-xs text-gray-400">
                  Select the model to use for this workspace's conversations.
                </p>
              </>
            )}
          </div>

          {/* Temperature Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                Temperature
                <a 
                  href="https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-main hover:text-secondary-light"
                >
                  <ExternalLink size={12} />
                </a>
              </label>
              <div className="flex items-center gap-2">
                <Thermometer size={16} className={getTemperatureColorClass(temperature)} />
                <span className="text-white font-mono">{temperature.toFixed(1)}</span>
              </div>
            </div>
            
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={handleTemperatureChange}
              className="w-full h-2 bg-background-primary rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #10b981 33%, #f59e0b 66%, #ef4444 100%)`,
              }}
            />
            
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>1</span>
              <span>2</span>
            </div>
            
            <div className="mt-2 p-2 border border-border rounded bg-background-primary">
              <p className="text-xs">
                <span className={`font-medium ${getTemperatureColorClass(temperature)}`}>
                  {getTemperatureDescription(temperature)}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Lower values (0-0.3) produce more deterministic and focused outputs, while higher values (1.0-2.0) generate more creative and diverse responses.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-accent-main hover:bg-accent-dark text-background-primary rounded-md font-medium transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettingsModal;
