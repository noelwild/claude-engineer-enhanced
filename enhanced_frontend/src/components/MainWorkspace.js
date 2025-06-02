```jsx
import React, { useState } from 'react';
import { 
  FiCode, 
  FiFile, 
  FiFolder, 
  FiPlus,
  FiGitBranch,
  FiActivity,
  FiCpu,
  FiHardDrive
} from 'react-icons/fi';

const MainWorkspace = ({ currentProject }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiActivity },
    { id: 'files', label: 'Files', icon: FiFile },
    { id: 'code', label: 'Code Editor', icon: FiCode },
    { id: 'git', label: 'Git', icon: FiGitBranch }
  ];

  const systemStats = {
    cpu: '45%',
    memory: '68%',
    disk: '23%',
    python: '3.12.0',
    conda: 'Active',
    android: 'SDK 34'
  };

  const recentFiles = [
    { name: 'main.py', path: '/app/current/main.py', modified: '2 min ago' },
    { name: 'buildozer.spec', path: '/app/android/buildozer.spec', modified: '5 min ago' },
    { name: 'requirements.txt', path: '/app/current/requirements.txt', modified: '10 min ago' }
  ];

  const quickActions = [
    { 
      title: 'Create Python Project',
      description: 'Start a new Python/Flask project',
      icon: FiCode,
      action: 'create-python'
    },
    {
      title: 'New Android App',
      description: 'Create Kivy Android application',
      icon: FiFolder,
      action: 'create-android'
    },
    {
      title: 'Clone Repository',
      description: 'Clone from Git repository',
      icon: FiGitBranch,
      action: 'clone-repo'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Claude Engineer Enhanced</h2>
        <p className="opacity-90">
          Your ultimate agentic software development environment with Python, Android, and AI capabilities.
        </p>
        {currentProject && (
          <div className="mt-4 bg-white bg-opacity-20 rounded p-3">
            <div className="flex items-center space-x-2">
              <FiFolder size={16} />
              <span>Current Project: <strong>{currentProject.name}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-effect rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">System Resources</h3>
            <FiCpu className="text-blue-400" size={20} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">CPU</span>
              <span className="text-green-400">{systemStats.cpu}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Memory</span>
              <span className="text-yellow-400">{systemStats.memory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Disk</span>
              <span className="text-blue-400">{systemStats.disk}</span>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Development Stack</h3>
            <FiCode className="text-green-400" size={20} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Python</span>
              <span className="text-green-400">{systemStats.python}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Conda</span>
              <span className="text-green-400">{systemStats.conda}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Android SDK</span>
              <span className="text-green-400">{systemStats.android}</span>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Activity</h3>
            <FiActivity className="text-purple-400" size={20} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="text-green-400">✓ Claude initialized</div>
            <div className="text-blue-400">✓ Terminal ready</div>
            <div className="text-purple-400">✓ Android SDK loaded</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="glass-effect rounded-lg p-4 text-left hover:bg-gray-700 transition-all group"
              onClick={() => console.log(`Action: ${action.action}`)}
            >
              <div className="flex items-center space-x-3 mb-2">
                <action.icon className="text-blue-400 group-hover:text-blue-300" size={20} />
                <h4 className="font-medium">{action.title}</h4>
              </div>
              <p className="text-sm text-gray-400">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Files */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Files</h3>
        <div className="glass-effect rounded-lg overflow-hidden">
          {recentFiles.map((file, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-800 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <FiFile className="text-gray-400" size={16} />
                <div>
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs text-gray-500">{file.path}</div>
                </div>
              </div>
              <div className="text-xs text-gray-400">{file.modified}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFiles = () => (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">File Explorer</h3>
        <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors">
          <FiPlus size={16} />
          <span>New File</span>
        </button>
      </div>
      <div className="glass-effect rounded-lg p-4 h-full">
        <p className="text-gray-400">File explorer will be implemented here</p>
      </div>
    </div>
  );

  const renderCodeEditor = () => (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Code Editor</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition-colors">
            Save
          </button>
          <button className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors">
            Run
          </button>
        </div>
      </div>
      <div className="glass-effect rounded-lg p-4 h-full">
        <div className="code-editor h-full">
          <textarea 
            className="w-full h-full bg-transparent text-green-400 font-mono resize-none outline-none"
            placeholder="# Start coding here..."
          />
        </div>
      </div>
    </div>
  );

  const renderGit = () => (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Git Repository</h3>
        <button className="flex items-center space-x-2 px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-colors">
          <FiGitBranch size={16} />
          <span>Initialize</span>
        </button>
      </div>
      <div className="glass-effect rounded-lg p-4 h-full">
        <p className="text-gray-400">Git integration will be implemented here</p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'files':
        return renderFiles();
      case 'code':
        return renderCodeEditor();
      case 'git':
        return renderGit();
      default:
        return renderOverview();
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
                  ? 'bg-blue-600 text-white' 
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

export default MainWorkspace;
```
