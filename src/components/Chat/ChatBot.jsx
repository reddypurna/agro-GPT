import './Chat.css'; // Should point to src/components/Chat/Chat.css
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMoon, FaQuestionCircle, FaSignOutAlt, FaSun, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';
import ChatHistory from './ChatHistory';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import QuickActions from './QuickActions';
import WeatherWidget from './WeatherWidget';
import { storage } from '../../utils/storage';
import SettingsModal from './SettingsModal';
import { FaCog } from 'react-icons/fa';
import { queryAgent, saveChat } from '../../utils/agentApi';


const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { location } = useLocation();

  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const hasMessages = messages.length > 0;

  // Store messages per chat session
  const getChatMessagesKey = (chatId) => `chatMessages_${chatId}`;
  const getChatMessages = (chatId) => {
    const key = getChatMessagesKey(chatId);
    return storage.getItem(key) || [];
  };
  const saveChatMessages = (chatId, msgs) => {
    const key = getChatMessagesKey(chatId);
    storage.setItem(key, msgs);
  };

  useEffect(() => {
    const storedHistory = storage.getItem('chatHistory');
    let hydratedHistory = [];
    if (storedHistory && Array.isArray(storedHistory)) {
      hydratedHistory = storedHistory.map((entry) => ({
        ...entry,
        timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
        titleLocked:
          typeof entry.titleLocked === 'boolean'
            ? entry.titleLocked
            : entry.text !== 'New conversation'
      }));
      setHistory(hydratedHistory);
    }
    const storedActive = storage.getItem('activeHistoryId');
    if (storedActive) {
      setActiveHistoryId(storedActive);
      const storedMessages = getChatMessages(storedActive);
      if (storedMessages && Array.isArray(storedMessages)) {
        const hydrated = storedMessages.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }));
        setMessages(hydrated);
      }
    } else if (hydratedHistory.length) {
      const firstId = hydratedHistory[0].id;
      setActiveHistoryId(firstId);
      const storedMessages = getChatMessages(firstId);
      if (storedMessages && Array.isArray(storedMessages)) {
        const hydrated = storedMessages.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }));
        setMessages(hydrated);
      }
    }
    setRestoring(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restoring && activeHistoryId) {
      saveChatMessages(activeHistoryId, messages);
      storage.setItem('activeHistoryId', activeHistoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, activeHistoryId, restoring]);

  useEffect(() => {
    if (!restoring) {
      storage.setItem('chatHistory', history);
    }
  }, [history, restoring]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pushNotification = useCallback((text) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((note) => note.id !== id));
    }, 2000);
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async(text) => {
    const userMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    upsertHistoryItem(text, userMessage.timestamp);

    // Simulate typing delay for more natural feel
    const typingDelay = Math.random() * 300 + 500;
    try {
      const data = await queryAgent(text);
    
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: data.answer || 'No response from AgroGPT',
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    
      if (user?.id) {
        saveChat(user.id, text, data.answer);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          text: '❌ Unable to reach AgroGPT backend.',
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
    
  };
//////////////////////////////
  const handleNewChat = useCallback(() => {
    const timestamp = new Date();
    const newId = timestamp.getTime();
    const placeholder = {
      id: newId,
      text: 'New conversation',
      titleLocked: false,
      timestamp
    };
    setHistory((prev) => [placeholder, ...prev]);
    setActiveHistoryId(newId);
    setMessages([]);
    setOpenMenuId(null);
    pushNotification('New chat created');
  }, [pushNotification]);

  const handleLoadChat = useCallback((chatId) => {
    setActiveHistoryId(chatId);
    const storedMessages = getChatMessages(chatId);
    if (storedMessages && Array.isArray(storedMessages)) {
      const hydrated = storedMessages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
      }));
      setMessages(hydrated);
    } else {
      setMessages([]);
    }
    setOpenMenuId(null);
  }, []);

  const generateBotResponse = (userText) => {
    const lower = userText.toLowerCase();

    // More natural, conversational responses
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('temperature')) {
      return {
        id: Date.now(),
        text: location
          ? `Based on your location, I'm seeing warm conditions with scattered showers expected. This is great for most crops! Would you like specific recommendations for your area?`
          : `I'd love to give you weather advice! Please allow location access so I can provide personalized recommendations for your farm.`,
        sender: 'bot',
        timestamp: new Date()
      };
    }

    if (lower.includes('crop') || lower.includes('plant') || lower.includes('seed')) {
      return {
        id: Date.now(),
        text: `Great question! I can help you choose the best crops. To give you the most accurate recommendations, could you tell me your soil type or share your location? I can then suggest crops that will thrive in your conditions.`,
        sender: 'bot',
        timestamp: new Date()
      };
    }

    if (lower.includes('fertilizer') || lower.includes('fertiliser') || lower.includes('nutrient')) {
      return {
        id: Date.now(),
        text: `Fertilizer selection is crucial for healthy crops! A balanced NPK fertilizer works well for most cereals. For more tailored advice, could you share what stage your crops are at and any soil test results you have?`,
        sender: 'bot',
        timestamp: new Date()
      };
    }

    if (lower.includes('pest') || lower.includes('insect') || lower.includes('disease')) {
      return {
        id: Date.now(),
        text: `Pest and disease management is important for crop health. The best approach depends on the specific pest and your crop type. Can you describe what you're seeing, or share a photo through the profile section? I can then provide targeted solutions.`,
        sender: 'bot',
        timestamp: new Date()
      };
    }

    if (lower.includes('harvest') || lower.includes('harvesting')) {
      return {
        id: Date.now(),
        text: `Harvest timing is critical for maximizing yield and quality! The ideal time depends on your crop type and maturity indicators. What crop are you planning to harvest? I can help you determine the best timing.`,
        sender: 'bot',
        timestamp: new Date()
      };
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return {
        id: Date.now(),
        text: `Hello! I'm your Agriculture Assistant. I'm here to help with crop management, weather advice, pest control, and more. What would you like to know today?`,
        sender: 'bot',
        timestamp: new Date()
      };
    }

    return {
      id: Date.now(),
      text: `I understand you're asking about "${userText}". As your agriculture assistant, I can help with crop planning, pest control, fertilizer recommendations, weather insights, and market trends. Could you provide a bit more detail so I can give you the best advice?`,
      sender: 'bot',
      timestamp: new Date()
    };
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const clearHistory = () => {
    setHistory([]);
    setMessages([]);
    setActiveHistoryId(null);
    storage.removeItem('chatHistory');
    storage.removeItem('activeHistoryId');
    // Also remove all individual chat messages
    // This is a simplification; ideally we'd track all chat IDs to delete them
    setShowSettings(false);
  };

  const handleSaveChat = useCallback(() => {
    if (!activeHistoryId) {
      pushNotification('No active chat to save yet');
      return;
    }
    saveChatMessages(activeHistoryId, messages);
    storage.setItem('chatHistory', history);
    pushNotification('Chat saved');
  }, [activeHistoryId, history, messages, pushNotification]);

  const handleRenameChat = useCallback(
    (chatId) => {
      const existing = history.find((item) => item.id === chatId);
      const nextTitle = window.prompt('Rename chat', existing?.text || '');
      if (!nextTitle || !nextTitle.trim()) {
        pushNotification('Rename cancelled');
        return;
      }

      setHistory((prev) =>
        prev.map((item) =>
          item.id === chatId
            ? { ...item, text: nextTitle.trim(), titleLocked: true }
            : item
        )
      );
      pushNotification('Chat renamed');
    },
    [history, pushNotification]
  );

  const handleShareChat = useCallback(
    async (chatId) => {
      const shareMessages =
        chatId === activeHistoryId ? messages : getChatMessages(chatId) || [];

      const printable =
        shareMessages.length === 0
          ? 'No messages in this chat yet.'
          : shareMessages
              .map(
                (msg) =>
                  `${msg.sender === 'user' ? 'You' : 'Bot'}: ${msg.text}`
              )
              .join('\n');

      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(printable);
          pushNotification('Chat copied to clipboard');
        } else {
          throw new Error('Clipboard unavailable');
        }
      } catch (error) {
        console.error('Share failed', error);
        pushNotification('Unable to share this chat');
      }
    },
    [activeHistoryId, messages, pushNotification]
  );

  const handleDeleteChat = useCallback(
    (chatId) => {
      setHistory((prev) => {
        const nextHistory = prev.filter((item) => item.id !== chatId);
        storage.removeItem(getChatMessagesKey(chatId));

        if (chatId === activeHistoryId) {
          const nextActive = nextHistory[0]?.id || null;
          setActiveHistoryId(nextActive);
          if (nextActive) {
            const storedMessages = getChatMessages(nextActive);
            if (storedMessages && Array.isArray(storedMessages)) {
              const hydrated = storedMessages.map((msg) => ({
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
              }));
              setMessages(hydrated);
            } else {
              setMessages([]);
            }
          } else {
            setMessages([]);
          }
        }

        return nextHistory;
      });
      pushNotification('Chat deleted');
    },
    [activeHistoryId, pushNotification]
  );

  const toggleHelpPanel = useCallback(() => {
    setShowHelp((prev) => !prev);
    setOpenMenuId(null);
  }, []);

  const handleMenuToggle = useCallback((chatId) => {
    setOpenMenuId((prev) => (prev === chatId ? null : chatId));
  }, []);

  const closeMenus = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  const upsertHistoryItem = (text, timestamp = new Date()) => {
    setHistory((prev) => {
      if (activeHistoryId) {
        return prev.map((entry) => {
          if (entry.id !== activeHistoryId) {
            return entry;
          }
          if (entry.titleLocked) {
            return { ...entry, timestamp };
          }
          return { ...entry, text, timestamp, titleLocked: true };
        });
      }
      const newId = timestamp.getTime();
      setActiveHistoryId(newId);
      return [
        { id: newId, text, timestamp, titleLocked: true },
        ...prev
      ];
    });
  };

  useEffect(() => {
    const handleShortcuts = (event) => {
      const key = event.key.toLowerCase();
      const isMeta = event.metaKey || event.ctrlKey;

      if (isMeta && key === 'n') {
        event.preventDefault();
        handleNewChat();
      } else if (isMeta && key === 's') {
        event.preventDefault();
        handleSaveChat();
      } else if (isMeta && key === 'd') {
        event.preventDefault();
        if (activeHistoryId) {
          handleDeleteChat(activeHistoryId);
        }
      } else if (isMeta && key === 'r') {
        event.preventDefault();
        if (activeHistoryId) {
          handleRenameChat(activeHistoryId);
        }
      } else if (isMeta && event.key === '/') {
        event.preventDefault();
        toggleHelpPanel();
      } else if (!isMeta && event.key === '/') {
        event.preventDefault();
        focusInput();
        closeMenus();
      } else if (event.key === 'Escape') {
        closeMenus();
        setShowHelp(false);
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [
    activeHistoryId,
    closeMenus,
    focusInput,
    handleDeleteChat,
    handleNewChat,
    handleRenameChat,
    handleSaveChat,
    toggleHelpPanel
  ]);

  return (
    <div className="chatbot-container">
      <div className="chat-layout">
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <button
              className="new-chat-button"
              onClick={handleNewChat}
              title="New chat (Ctrl/Cmd + N)"
            >
              + New Chat
            </button>
            <button
              className="save-chat-button"
              onClick={handleSaveChat}
              title="Save chat (Ctrl/Cmd + S)"
              aria-label="Save chat"
            >
              Save
            </button>
          </div>
          <ChatHistory
            history={history}
            activeHistoryId={activeHistoryId}
            onHistorySelect={handleLoadChat}
            onHistoryClick={handleLoadChat}
            onRename={handleRenameChat}
            onShare={handleShareChat}
            onDelete={handleDeleteChat}
            openMenuId={openMenuId}
            onMenuToggle={handleMenuToggle}
            onCloseMenus={closeMenus}
          />
          <WeatherWidget location={location} />
        </aside>
        <div className="chat-main">
          <div className="chatbot-header">
            <div className="header-left">
              <FaUserCircle className="header-icon" />
              <div className="user-info">
                <span className="user-name">{user?.name || user?.email}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            </div>
            <div className="header-right">
              <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                {theme === 'light' ? <FaMoon /> : <FaSun />}
              </button>
              <button
                className="help-btn"
                onClick={toggleHelpPanel}
                title="Shortcuts (Ctrl/Cmd + /)"
                aria-label="Open keyboard shortcuts"
              >
                <FaQuestionCircle />
              </button>
              <button className="settings-btn" onClick={() => setShowSettings(true)} title="Settings">
                <FaCog />
              </button>
              <button className="profile-btn" onClick={() => navigate('/profile')}>
                Profile
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            onClearHistory={clearHistory}
          />

          <div className={`chatbot-content ${hasMessages ? '' : 'chatbot-content-empty'}`}>
            {hasMessages ? (
              <>
                <QuickActions onActionClick={handleSendMessage} />
                <MessageList messages={messages} />
                <div ref={endRef} />
              </>
            ) : (
              <div className="chat-empty-state">
                <h2>Start a farming conversation</h2>
                <p>Ask about weather, pests, crops, fertilizers, or market trends.</p>
                <QuickActions onActionClick={handleSendMessage} />
              </div>
            )}
          </div>

          <MessageInput
            onSendMessage={handleSendMessage}
            isCentered={!hasMessages}
            disabled={restoring}
            inputRef={inputRef}
          />
        </div>
      </div>
      {showHelp && (
        <div className="help-overlay" role="dialog" aria-modal="true" onClick={toggleHelpPanel}>
          <div
            className="help-panel"
            onClick={(event) => event.stopPropagation()}
            role="document"
          >
            <div className="help-header">
              <h3>Keyboard Shortcuts</h3>
              <button
                className="close-help-btn"
                onClick={toggleHelpPanel}
                title="Close (Esc)"
                aria-label="Close shortcuts panel"
              >
                ×
              </button>
            </div>
            <ul className="shortcut-list">
              <li>
                <span>New chat</span>
                <span className="shortcut-kbd">Ctrl/Cmd + N</span>
              </li>
              <li>
                <span>Save chat</span>
                <span className="shortcut-kbd">Ctrl/Cmd + S</span>
              </li>
              <li>
                <span>Delete chat</span>
                <span className="shortcut-kbd">Ctrl/Cmd + D</span>
              </li>
              <li>
                <span>Rename chat</span>
                <span className="shortcut-kbd">Ctrl/Cmd + R</span>
              </li>
              <li>
                <span>Focus chat input</span>
                <span className="shortcut-kbd">/</span>
              </li>
              <li>
                <span>Toggle shortcuts</span>
                <span className="shortcut-kbd">Ctrl/Cmd + /</span>
              </li>
              <li>
                <span>Close menu/panel</span>
                <span className="shortcut-kbd">Esc</span>
              </li>
            </ul>
          </div>
        </div>
      )}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {notifications.map((note) => (
          <div key={note.id} className="toast">
            {note.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatBot;