```jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainWorkspace from './components/MainWorkspace';
import Terminal from './components/Terminal';
import ProjectExplorer from './components/ProjectExplorer';
import ClaudeChat from './components/ClaudeChat';
import AndroidStudio from './components/AndroidStudio';
import Split from 'react-split';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('workspace');
  const [isClaudeInitialized, setIsClaudeInitialized] = useState(false);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Initialize Claude on app start
    initializeClaude();
    // Load projects
    loadProjects();
  }, []);

  const initializeClaude = async () => {
    try {
      const response = await fetch('/api/claude/init', {
        method: 'POST',
      });
      if (response.ok) {
        setIsClaudeInitialized(true);
      }
    } catch (error) {
      console.error('Failed to initialize Claude:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'workspace':
        return <MainWorkspace currentProject={currentProject} />;
      case 'chat':
        return <ClaudeChat isInitialized={isClaudeInitialized} />;
      case 'android':
        return <AndroidStudio projects={projects} onProjectChange={setCurrentProject} />;
      case 'projects':
        return (
          <ProjectExplorer 
            projects={projects} 
            onProjectSelect={setCurrentProject}
            onProjectsUpdate={loadProjects}
          />
        );
      default:
        return <MainWorkspace currentProject={currentProject} />;
    }
  };

  return (
    <Router>
      <div className="app-container h-screen bg-gray-900 text-gray-100 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <Sidebar 
            activeView={activeView}
            onViewChange={setActiveView}
            isClaudeInitialized={isClaudeInitialized}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gradient">
                  Claude Engineer Enhanced
                </h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isClaudeInitialized ? 'status-online' : 'status-offline'}`}></div>
                  <span className="text-sm text-gray-400">
                    {isClaudeInitialized ? 'Claude Ready' : 'Initializing...'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {currentProject && (
                  <div className="text-sm text-gray-400">
                    Project: <span className="text-blue-400">{currentProject.name}</span>
                  </div>
                )}
              </div>
            </header>
            
            {/* Main Content with Terminal Split */}
            <div className="flex-1">
              <Split
                direction="vertical"
                sizes={[70, 30]}
                minSize={[300, 200]}
                className="split-vertical h-full"
              >
                {/* Main workspace */}
                <div className="bg-gray-900">
                  {renderMainContent()}
                </div>
                
                {/* Terminal */}
                <div className="bg-gray-900 border-t border-gray-700">
                  <Terminal />
                </div>
              </Split>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
```
