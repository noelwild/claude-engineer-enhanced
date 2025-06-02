```jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  FiSend, 
  FiUser, 
  FiBot,
  FiTrash2,
  FiDownload,
  FiCopy,
  FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';

const ClaudeChat = ({ isInitialized }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hello! I'm Claude, your enhanced AI development assistant. I can help you with:

• **Full-stack development** - Create React, Flask, FastAPI applications
• **Android development** - Build Kivy apps and compile with buildozer  
• **Code review & debugging** - Analyze and improve your code
• **Architecture planning** - Design scalable applications
• **Terminal operations** - Execute commands and manage environments

What would you like to build today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !isInitialized || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: result.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response from Claude');
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      role: 'assistant',
      content: 'Chat cleared. How can I help you?',
      timestamp: new Date()
    }]);
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const exportChat = () => {
    const chatText = messages.map(msg => 
      `${msg.role.toUpperCase()}: ${msg.content}\n`
    ).join('\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claude-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const isError = message.isError;

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-4xl ${isUser ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
          {/* Avatar */}
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            ${isUser ? 'bg-blue-600 ml-3' : isError ? 'bg-red-600 mr-3' : 'bg-purple-600 mr-3'}
          `}>
            {isUser ? <FiUser size={16} /> : isError ? <FiAlertCircle size={16} /> : <FiBot size={16} />}
          </div>

          {/* Message content */}
          <div className={`
            rounded-lg p-4 max-w-3xl
            ${isUser 
              ? 'bg-blue-600 text-white' 
              : isError 
                ? 'bg-red-900 border border-red-600' 
                : 'glass-effect'
            }
          `}>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {message.content}
              </pre>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs opacity-70">
              <span>
                {message.timestamp.toLocaleTimeString()}
              </span>
              <button
                onClick={() => copyMessage(message.content)}
                className="hover:opacity-100 transition-opacity"
                title="Copy message"
              >
                <FiCopy size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isInitialized) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing Claude...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <FiBot size={20} />
            </div>
            <div>
              <h2 className="font-semibold">Claude AI Assistant</h2>
              <p className="text-sm text-gray-400">Enhanced Development Mode</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={exportChat}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Export chat"
            >
              <FiDownload size={16} />
            </button>
            <button
              onClick={clearChat}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Clear chat"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex space-x-3 max-w-4xl">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                <FiBot size={16} />
              </div>
              <div className="glass-effect rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="loading-spinner"></div>
                  <span className="text-sm text-gray-400">Claude is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Claude anything about development, coding, or building apps..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 transition-colors"
              rows="3"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? <FiRefreshCw className="animate-spin" size={16} /> : <FiSend size={16} />}
            <span>Send</span>
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ClaudeChat;
```
