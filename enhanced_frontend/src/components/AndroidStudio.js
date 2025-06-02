```jsx
import React, { useState, useEffect } from 'react';
import { 
  FiSmartphone, 
  FiPlay, 
  FiSquare, 
  FiDownload,
  FiSettings,
  FiCode,
  FiPackage,
  FiMonitor,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';

const AndroidStudio = ({ projects, onProjectChange }) => {
  const [activeTab, setActiveTab] = useState('projects');
  const [buildStatus, setBuildStatus] = useState('idle'); // idle, building, success, error
  const [buildOutput, setBuildOutput] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [emulatorStatus, setEmulatorStatus] = useState('stopped');

  const androidProjects = projects.filter(p => p.type === 'android');

  const tabs = [
    { id: 'projects', label: 'Projects', icon: FiCode },
    { id: 'build', label: 'Build', icon: FiPackage },
    { id: 'emulator', label: 'Emulator', icon: FiMonitor },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  const handleBuildProject = async (project) => {
    if (!project) return;

    setBuildStatus('building');
    setBuildOutput('Starting build process...\n');

    try {
      const response = await fetch('/api/android/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_path: project.path }),
      });

      const result = await response.json();

      if (result.status === 'completed') {
        setBuildStatus('success');
        setBuildOutput(prev => prev + '\n✅ Build completed successfully!\n' + result.stdout);
      } else {
        setBuildStatus('error');
        setBuildOutput(prev => prev + '\n❌ Build failed:\n' + result.stderr);
      }
    } catch (error) {
      setBuildStatus('error');
      setBuildOutput(prev => prev + `\n❌ Build error: ${error.message}`);
    }
  };

  const createNewAndroidProject = async () => {
    const projectName = prompt('Enter project name:');
    if (!projectName) return;

    try {
      const response = await fetch('/api/android/create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: projectName }),
      });

      if (response.ok) {
        // Refresh projects list
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to create Android project:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'building':
        return <FiRefreshCw className="animate-spin text-yellow-400" size={16} />;
      case 'success':
        return <FiCheckCircle className="text-green-400" size={16} />;
      case 'error':
        return <FiAlertCircle className="text-red-400" size={16} />;
      default:
        return <FiClock className="text-gray-400" size={16} />;
    }
  };

  const renderProjects = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Android Projects</h3>
        <button
          onClick={createNewAndroidProject}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          <FiSmartphone size={16} />
          <span>New Android App</span>
        </button>
      </div>

      {/* Projects Grid */}
      {androidProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {androidProjects.map((project, index) => (
            <div 
              key={index}
              className={`
                glass-effect rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-700
                ${selectedProject?.name === project.name ? 'ring-2 ring-green-500' : ''}
              `}
              onClick={() => {
                setSelectedProject(project);
                onProjectChange(project);
              }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <FiSmartphone className="text-green-400" size={20} />
                <div className="flex-1">
                  <h4 className="font-medium">{project.name}</h4>
                  <p className="text-xs text-gray-400">Kivy Android App</p>
                </div>
              </div>
              
              <div className="text-sm text-gray-400 mb-3 truncate">
                {project.path}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuildProject(project);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Build APK
                  </button>
                </div>
                
                {getStatusIcon(selectedProject?.name === project.name ? buildStatus : 'idle')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiSmartphone size={48} className="mx-auto mb-4 text-gray-500 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Android Projects</h3>
          <p className="text-gray-400 mb-6">Create your first Android app to get started</p>
          <button
            onClick={createNewAndroidProject}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors mx-auto"
          >
            <FiSmartphone size={16} />
            <span>Create Android App</span>
          </button>
        </div>
      )}
    </div>
  );

  const renderBuild = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Build Console</h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon(buildStatus)}
          <span className="text-sm capitalize">{buildStatus}</span>
        </div>
      </div>

      {selectedProject ? (
        <div className="space-y-4">
          <div className="glass-effect rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium">{selectedProject.name}</h4>
                <p className="text-sm text-gray-400">{selectedProject.path}</p>
              </div>
              <button
                onClick={() => handleBuildProject(selectedProject)}
                disabled={buildStatus === 'building'}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {buildStatus === 'building' ? (
                  <>
                    <FiRefreshCw className="animate-spin" size={16} />
                    <span>Building...</span>
                  </>
                ) : (
                  <>
                    <FiPackage size={16} />
                    <span>Build APK</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Build Output */}
          <div className="glass-effect rounded-lg p-4 h-96">
            <h4 className="font-medium mb-3">Build Output</h4>
            <div className="bg-gray-900 rounded p-4 h-full overflow-y-auto font-mono text-sm">
              <pre className="text-green-400 whitespace-pre-wrap">
                {buildOutput || 'No build output yet. Click "Build APK" to start building.'}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <FiPackage size={48} className="mx-auto mb-4 text-gray-500 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
          <p className="text-gray-400">Select a project from the Projects tab to start building</p>
        </div>
      )}
    </div>
  );

  const renderEmulator = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Android Emulator</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            emulatorStatus === 'running' ? 'status-online' : 'status-offline'
          }`}></div>
          <span className="text-sm capitalize">{emulatorStatus}</span>
        </div>
      </div>

      <div className="glass-effect rounded-lg p-6">
        <div className="text-center">
          <FiMonitor size={48} className="mx-auto mb-4 text-gray-500" />
          <h4 className="font-medium mb-2">Android Emulator</h4>
          <p className="text-gray-400 mb-6">
            Emulator setup is in progress. This will allow Claude to test Android apps automatically.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <FiCheckCircle className="text-green-400" size={16} />
              <span>Android SDK installed</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <FiClock className="text-yellow-400" size={16} />
              <span>Emulator configuration pending</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <FiClock className="text-gray-400" size={16} />
              <span>AVD setup pending</span>
            </div>
          </div>

          <button
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled
          >
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Android Settings</h3>
      
      <div className="space-y-4">
        <div className="glass-effect rounded-lg p-4">
          <h4 className="font-medium mb-3">Android SDK</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">SDK Path</span>
              <span className="text-green-400">/opt/android-sdk</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Build Tools</span>
              <span className="text-green-400">34.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Platform</span>
              <span className="text-green-400">android-34</span>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-lg p-4">
          <h4 className="font-medium mb-3">Buildozer Configuration</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Version</span>
              <span className="text-green-400">1.5.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Python for Android</span>
              <span className="text-green-400">2024.1.21</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Kivy</span>
              <span className="text-green-400">2.3.1</span>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-lg p-4">
          <h4 className="font-medium mb-3">Environment</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">ANDROID_HOME</span>
              <span className="text-green-400">Configured</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Java JDK</span>
              <span className="text-green-400">Installed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Python</span>
              <span className="text-green-400">3.12.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'projects':
        return renderProjects();
      case 'build':
        return renderBuild();
      case 'emulator':
        return renderEmulator();
      case 'settings':
        return renderSettings();
      default:
        return renderProjects();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                ${activeTab === tab.id 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }
              `}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AndroidStudio;
```
