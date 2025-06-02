```jsx
import React from 'react';
import { 
  FiCode, 
  FiTerminal, 
  FiFolder, 
  FiMessageCircle, 
  FiSmartphone,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiActivity
} from 'react-icons/fi';

const Sidebar = ({ 
  activeView, 
  onViewChange, 
  isClaudeInitialized, 
  collapsed, 
  onToggleCollapse 
}) => {
  const menuItems = [
    {
      id: 'workspace',
      icon: FiCode,
      label: 'Workspace',
      description: 'Main development workspace'
    },
    {
      id: 'chat',
      icon: FiMessageCircle,
      label: 'Claude Chat',
      description: 'Chat with Claude AI',
      status: isClaudeInitialized ? 'online' : 'offline'
    },
    {
      id: 'terminal',
      icon: FiTerminal,
      label: 'Terminal',
      description: 'Python & miniconda terminal'
    },
    {
      id: 'projects',
      icon: FiFolder,
      label: 'Projects',
      description: 'Manage your projects'
    },
    {
      id: 'android',
      icon: FiSmartphone,
      label: 'Android Studio',
      description: 'Android app development'
    }
  ];

  const bottomItems = [
    {
      id: 'settings',
      icon: FiSettings,
      label: 'Settings',
      description: 'Application settings'
    }
  ];

  const MenuItem = ({ item, isBottom = false }) => (
    <div className="relative group">
      <button
        onClick={() => onViewChange(item.id)}
        className={`
          w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200
          ${activeView === item.id 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }
          ${collapsed ? 'justify-center' : 'justify-start space-x-3'}
        `}
        title={collapsed ? item.label : ''}
      >
        <div className="relative">
          <item.icon size={20} />
          {item.status && (
            <div className={`
              absolute -top-1 -right-1 w-3 h-3 rounded-full
              ${item.status === 'online' ? 'status-online' : 'status-offline'}
            `} />
          )}
        </div>
        
        {!collapsed && (
          <div className="flex-1 text-left">
            <div className="font-medium">{item.label}</div>
            <div className="text-xs text-gray-500">{item.description}</div>
          </div>
        )}
      </button>
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 
                        bg-gray-800 text-white px-2 py-1 rounded text-sm
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        pointer-events-none z-50 whitespace-nowrap">
          {item.label}
          <div className="text-xs text-gray-400">{item.description}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`
      bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="font-bold text-lg text-gradient">Claude Dev</h2>
              <p className="text-xs text-gray-500">Agentic Developer</p>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Status indicator */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <FiActivity className="text-green-400" size={16} />
            <div className="flex-1">
              <div className="text-sm font-medium">System Status</div>
              <div className="text-xs text-gray-500">
                {isClaudeInitialized ? 'All systems operational' : 'Initializing services...'}
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              isClaudeInitialized ? 'status-online' : 'status-processing'
            }`} />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </nav>

      {/* Bottom items */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        {bottomItems.map((item) => (
          <MenuItem key={item.id} item={item} isBottom />
        ))}
      </div>

      {/* Version info */}
      {!collapsed && (
        <div className="px-4 py-2 border-t border-gray-700 text-xs text-gray-500">
          <div>Claude Engineer v2.0</div>
          <div>Enhanced Edition</div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
```
