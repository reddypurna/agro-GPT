import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMoon, FaSignOutAlt, FaSun, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from '../../context/LocationContext';
import ChatHistory from './ChatHistory';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import QuickActions from './QuickActions';
import WeatherWidget from './WeatherWidget';
import { storage } from '../../utils/storage';
import './Chat.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { location } = useLocation();
  const navigate = useNavigate();
  const endRef = useRef(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    const stored = storage.getItem('chatMessages');
    if (stored && Array.isArray(stored)) {
      const hydrated = stored.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
      }));
      setMessages(hydrated);
    }
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
    } else if (hydratedHistory.length) {
      setActiveHistoryId(hydratedHistory[0].id);
    }
    setRestoring(false);
  }, []);

  useEffect(() => {
    if (!restoring) {
      storage.setItem('chatMessages', messages);
    }
  }, [messages, restoring]);

  useEffect(() => {
    if (!restoring) {
      storage.setItem('chatHistory', history);
    }
  }, [history, restoring]);

  useEffect(() => {
    if (!restoring && activeHistoryId) {
      storage.setItem('activeHistoryId', activeHistoryId);
    }
  }, [activeHistoryId, restoring]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (text) => {
    const userMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    upsertHistoryItem(text, userMessage.timestamp);

    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      setMessages((prev) => [...prev, botResponse]);
    }, 900);
  };

  const handleNewChat = () => {
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
    storage.removeItem('chatMessages');
  };

  const generateBotResponse = (userText) => {
    const lower = userText.toLowerCase();

    if (lower.includes('weather') || lower.includes('rain')) {
      return {
        id: Date.now(),
        text: location
          ? 'Based on your location, expect warm conditions with scattered showers. Need recommendations for specific crops?'
          : 'Allow location access so I can tailor weather advice to your field.',
        sender: 'bot',
        timestamp: new Date()
      };
    }

    if (lower.includes('crop') || lower.includes('plant')) {
      return {
        id: Date.now(),
        text: 'Sure! Tell me your soil type or location so I can suggest the best crops for this season.',
        sender: 'bot',
        timestamp: new Date()
      };
    }

    if (lower.includes('fertilizer')) {
      return {
        id: Date.now(),
        text: 'Balanced NPK fertilizers work for most cereals. For tailored advice, share the crop stage and soil test values.',
        sender: 'bot',
        timestamp: new Date()
      };
    }

    if (lower.includes('pest')) {
      return {
        id: Date.now(),
        text: 'Pest pressure varies by season. Describe the pest or share an image via the profile section for precise help.',
        sender: 'bot',
        timestamp: new Date()
      };
    }

    return {
      id: Date.now(),
      text: `I can help with crop planning, pest control, inputs, and market insights. Could you provide a bit more detail about "${userText}"?`,
      sender: 'bot',
      timestamp: new Date()
    };
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userHistory = history;

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

  return (
    <div className="chatbot-container">
      <div className="chat-layout">
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <button className="new-chat-button" onClick={handleNewChat}>
              + New Chat
            </button>
          </div>
          <ChatHistory history={userHistory} onHistorySelect={handleSendMessage} />
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
              <button className="profile-btn" onClick={() => navigate('/profile')}>
                Profile
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

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

          <MessageInput onSendMessage={handleSendMessage} isCentered={!hasMessages} disabled={restoring} />
        </div>
      </div>
    </div>
  );
};

export default ChatBot;

