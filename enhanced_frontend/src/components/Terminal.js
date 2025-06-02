```jsx
import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { 
  FiTerminal, 
  FiPlus, 
  FiX, 
  FiRefreshCw, 
  FiMaximize2,
  FiMinimize2,
  FiSettings
} from 'react-icons/fi';

const TerminalTab = ({ session, isActive, onSelect, onClose, isMinimized }) => (
  <div 
    className={`
      flex items-center space-x-2 px-3 py-2 cursor-pointer border-r border-gray-700
      ${isActive ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
      ${isMinimized ? 'opacity-50' : ''}
    `}
    onClick={onSelect}
  >
    <FiTerminal size={14} />
    <span className="text-sm">{session.name}</span>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="hover:text-red-400 transition-colors"
    >
      <FiX size={14} />
    </button>
  </div>
);

const Terminal = () => {
  const terminalRef = useRef();
  const xtermRef = useRef();
  const fitAddonRef = useRef();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentCommand, setCurrentCommand] = useState('');

  useEffect(() => {
    // Create initial terminal session
    createNewSession();
    
    return () => {
      // Cleanup
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (activeSessionId && terminalRef.current && !isMinimized) {
      initializeTerminal();
    }
  }, [activeSessionId, isMinimized]);

  const initializeTerminal = () => {
    if (xtermRef.current) {
      xtermRef.current.dispose();
    }

    const term = new XTerm({
      theme: {
        background: '#0f172a',
        foreground: '#e2e8f0',
        cursor: '#10b981',
        cursorAccent: '#0f172a',
        selection: 'rgba(59, 130, 246, 0.3)',
        black: '#0f172a',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#8b5cf6',
        cyan: '#06b6d4',
        white: '#e2e8f0',
        brightBlack: '#374151',
        brightRed: '#f87171',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#60a5fa',
        brightMagenta: '#a78bfa',
        brightCyan: '#22d3ee',
        brightWhite: '#f8fafc'
      },
      fontSize: 14,
      fontFamily: 'Fira Code, Monaco, Consolas, monospace',
      cursorBlink: true,
      allowTransparency: true,
      scrollback: 1000,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('\x1b[32m╭──────────────────────────────────────────────────────────────╮\x1b[0m');
    term.writeln('\x1b[32m│                  Claude Engineer Terminal                    │\x1b[0m');
    term.writeln('\x1b[32m│              Python + Miniconda Environment                  │\x1b[0m');
    term.writeln('\x1b[32m╰──────────────────────────────────────────────────────────────╯\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[36mWelcome to your enhanced development environment!\x1b[0m');
    term.writeln('\x1b[33mType "help" for available commands\x1b[0m');
    term.writeln('');
    
    showPrompt();

    // Handle user input
    let currentLine = '';
    
    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.keyCode === 13) { // Enter
        term.writeln('');
        if (currentLine.trim()) {
          executeCommand(currentLine.trim());
          setCommandHistory(prev => [...prev, currentLine.trim()]);
          setHistoryIndex(-1);
        }
        currentLine = '';
        // Don't show prompt here, executeCommand will handle it
      } else if (domEvent.keyCode === 8) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (domEvent.keyCode === 38) { // Arrow up
        if (commandHistory.length > 0) {
          const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          
          // Clear current line
          term.write('\r\x1b[K');
          showPrompt();
          
          // Write history command
          const historyCommand = commandHistory[newIndex];
          currentLine = historyCommand;
          term.write(historyCommand);
        }
      } else if (domEvent.keyCode === 40) { // Arrow down
        if (historyIndex !== -1) {
          const newIndex = historyIndex === commandHistory.length - 1 ? -1 : historyIndex + 1;
          setHistoryIndex(newIndex);
          
          // Clear current line
          term.write('\r\x1b[K');
          showPrompt();
          
          // Write history command or empty
          const historyCommand = newIndex === -1 ? '' : commandHistory[newIndex];
          currentLine = historyCommand;
          term.write(historyCommand);
        }
      } else if (printable) {
        currentLine += key;
        term.write(key);
      }
    });

    // Handle terminal resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  };

  const showPrompt = () => {
    if (xtermRef.current) {
      xtermRef.current.write('\x1b[32m➜\x1b[0m \x1b[36m~/claude-dev\x1b[0m \x1b[32m$\x1b[0m ');
    }
  };

  const executeCommand = async (command) => {
    const term = xtermRef.current;
    if (!term) return;

    try {
      // Handle built-in commands
      if (command === 'help') {
        term.writeln('\x1b[36mAvailable commands:\x1b[0m');
        term.writeln('  help          - Show this help message');
        term.writeln('  clear         - Clear terminal');
        term.writeln('  conda list    - List conda packages');
        term.writeln('  python        - Start Python interpreter');
        term.writeln('  buildozer     - Android app building tool');
        term.writeln('  kivy          - Kivy framework tools');
        term.writeln('  ls, pwd, cd   - Basic shell commands');
        term.writeln('');
        showPrompt();
        return;
      }

      if (command === 'clear') {
        term.clear();
        showPrompt();
        return;
      }

      // For other commands, send to backend
      const response = await fetch(`/api/terminal/${activeSessionId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.output) {
          // Process and display output
          const lines = result.output.split('\n');
          lines.forEach(line => {
            if (line.trim()) {
              term.writeln(line);
            }
          });
        }
      } else {
        term.writeln('\x1b[31mError executing command\x1b[0m');
      }
    } catch (error) {
      term.writeln(`\x1b[31mCommand failed: ${error.message}\x1b[0m`);
    }

    showPrompt();
  };

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/terminal/create', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        const newSession = {
          id: result.session_id,
          name: `Terminal ${sessions.length + 1}`,
        };

        setSessions(prev => [...prev, newSession]);
        setActiveSessionId(newSession.id);
      }
    } catch (error) {
      console.error('Failed to create terminal session:', error);
    }
  };

  const closeSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Terminal Header */}
      <div className="bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FiTerminal className="text-green-400" size={16} />
            <span className="font-medium">Terminal</span>
          </div>
          
          {/* Terminal tabs */}
          <div className="flex">
            {sessions.map(session => (
              <TerminalTab
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onSelect={() => setActiveSessionId(session.id)}
                onClose={() => closeSession(session.id)}
                isMinimized={isMinimized}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={createNewSession}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="New terminal"
          >
            <FiPlus size={16} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title={isMinimized ? "Restore" : "Minimize"}
          >
            {isMinimized ? <FiMaximize2 size={16} /> : <FiMinimize2 size={16} />}
          </button>
          <button
            onClick={() => {
              if (fitAddonRef.current) {
                fitAddonRef.current.fit();
              }
            }}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Fit to size"
          >
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      {!isMinimized && (
        <div className="flex-1 bg-terminal-bg">
          {activeSession ? (
            <div 
              ref={terminalRef} 
              className="h-full w-full p-4"
              style={{ background: '#0f172a' }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FiTerminal size={48} className="mx-auto mb-4 opacity-50" />
                <p>No terminal sessions</p>
                <button
                  onClick={createNewSession}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Create Terminal
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Terminal;
```
