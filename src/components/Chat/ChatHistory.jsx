import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { FaEllipsisV, FaPen, FaShareAlt, FaTrash } from 'react-icons/fa';
import './Chat.css';

const ChatHistory = ({
  history,
  activeHistoryId,
  onHistorySelect,
  onHistoryClick,
  onRename,
  onShare,
  onDelete,
  openMenuId,
  onMenuToggle,
  onCloseMenus
}) => {
  const listRef = useRef(null);

  const handleClick = (item) => {
    if (onHistoryClick) {
      onHistoryClick(item.id);
    } else if (onHistorySelect) {
      onHistorySelect(item.text);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!openMenuId) return;
      if (listRef.current && !listRef.current.contains(event.target)) {
        onCloseMenus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId, onCloseMenus]);

  return (
    <div className="chat-history" ref={listRef}>
      <div className="history-header">
        <h3>Chat History</h3>
      </div>
      {history.length === 0 ? (
        <div className="history-empty">
          No chats yet.
          <br />
          Start a conversation to see it listed here.
        </div>
      ) : (
        <div className="history-items">
          {history.map((item) => {
            const isActive = activeHistoryId === item.id;
            const isMenuOpen = openMenuId === item.id;

            return (
              <div
                key={item.id}
                className={`history-item-wrapper ${isActive ? 'active' : ''} ${
                  isMenuOpen ? 'menu-open' : ''
                }`}
              >
                <button
                  className="history-item"
                  onClick={() => handleClick(item)}
                  title="Click to open this conversation"
                >
                  <span className="history-text">{item.text}</span>
                  <span className="history-time">{format(item.timestamp, 'MMM d • HH:mm')}</span>
                </button>
                <button
                  className="history-menu-btn"
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                  onClick={(event) => {
                    event.stopPropagation();
                    onMenuToggle(item.id);
                  }}
                  title="More options"
                >
                  <FaEllipsisV />
                  <span className="sr-only">Chat options</span>
                </button>
                {isMenuOpen && (
                  <div className="history-menu" role="menu">
                    <button
                      className="history-menu-item"
                      role="menuitem"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRename(item.id);
                        onCloseMenus();
                      }}
                      title="Rename (Ctrl/Cmd + R)"
                    >
                      <FaPen /> Rename
                    </button>
                    <button
                      className="history-menu-item"
                      role="menuitem"
                      onClick={(event) => {
                        event.stopPropagation();
                        onShare(item.id);
                        onCloseMenus();
                      }}
                      title="Share"
                    >
                      <FaShareAlt /> Share
                    </button>
                    <button
                      className="history-menu-item danger"
                      role="menuitem"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(item.id);
                        onCloseMenus();
                      }}
                      title="Delete (Ctrl/Cmd + D)"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
