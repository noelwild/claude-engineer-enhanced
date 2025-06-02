```jsx
import React, { useState } from 'react';
import { 
  FiFolder, 
  FiFile, 
  FiPlus, 
  FiTrash2, 
  FiDownload,
  FiGitBranch,
  FiSmartphone,
  FiCode,
  FiRefreshCw,
  FiSearch
} from 'react-icons/fi';

const ProjectExplorer = ({ projects, onProjectSelect, onProjectsUpdate }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    type: 'web',
    description: ''
  });

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = async () => {
    if (!newProjectData.name.trim()) return;

    try {
      let endpoint = '';
      let payload = {};

      if (newProjectData.type === 'android') {
        endpoint = '/api/android/create-project';
        payload = { name: newProjectData.name };
      } else {
        // For web projects, create directory structure
        endpoint = '/api/projects/create';
        payload = { 
          name: newProjectData.name, 
          type: newProjectData.type,
          description: newProjectData.description 
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewProjectData({ name: '', type: 'web', description: '' });
        onProjectsUpdate();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    onProjectSelect(project);
  };

  const getProjectIcon = (type) => {
    switch (type) {
      case 'android':
        return FiSmartphone;
      case 'web':
        return FiCode;
      default:
        return FiFolder;
    }
  };

  const getProjectColor = (type) => {
    switch (type) {
      case 'android':
        return 'text-green-400';
      case 'web':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const ProjectCard = ({ project }) => {
    const Icon = getProjectIcon(project.type);
    const colorClass = getProjectColor(project.type);

    return (
      <div 
        className={`
          glass-effect rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-700
          ${selectedProject?.name === project.name ? 'ring-2 ring-blue-500' : ''}
        `}
        onClick={() => handleProjectSelect(project)}
      >
        <div className="flex items-center space-x-3 mb-3">
          <Icon className={colorClass} size={20} />
          <div className="flex-1">
            <h3 className="font-medium">{project.name}</h3>
            <p className="text-xs text-gray-400 capitalize">{project.type} Project</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 mb-3">
          {project.path}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button 
              className="p-1 hover:bg-gray-600 rounded transition-colors"
              title="Open in workspace"
            >
              <FiFolder size={14} />
            </button>
            <button 
              className="p-1 hover:bg-gray-600 rounded transition-colors"
              title="Git repository"
            >
              <FiGitBranch size={14} />
            </button>
          </div>
          
          <button 
            className="p-1 hover:bg-red-600 rounded transition-colors text-red-400"
            title="Delete project"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  const CreateProjectModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
        <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              type="text"
              value={newProjectData.name}
              onChange={(e) => setNewProjectData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              placeholder="Enter project name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Project Type</label>
            <select
              value={newProjectData.type}
              onChange={(e) => setNewProjectData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="web">Web Application</option>
              <option value="android">Android App</option>
              <option value="python">Python Project</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              value={newProjectData.description}
              onChange={(e) => setNewProjectData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              rows="3"
              placeholder="Project description"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateProject}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Project Explorer</h2>
          <div className="flex space-x-2">
            <button
              onClick={onProjectsUpdate}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Refresh projects"
            >
              <FiRefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <FiPlus size={16} />
              <span>New Project</span>
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FiFolder size={48} className="mx-auto mb-4 text-gray-500 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Projects Found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first project to get started'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mx-auto"
              >
                <FiPlus size={16} />
                <span>Create Project</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Project Details */}
      {selectedProject && (
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <h3 className="font-medium mb-2">Selected Project</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">{selectedProject.name}</p>
              <p className="text-xs text-gray-500">{selectedProject.path}</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                Open
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && <CreateProjectModal />}
    </div>
  );
};

export default ProjectExplorer;
```
