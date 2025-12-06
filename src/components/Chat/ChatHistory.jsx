import { format } from 'date-fns';
import './Chat.css';

const ChatHistory = ({ history, onHistorySelect }) => {
  return (
    <div className="chat-history">
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
          {history.map((item) => (
            <button
              key={item.id}
              className="history-item"
              onClick={() => onHistorySelect(item.text)}
              title="Tap to re-ask this question"
            >
              <span className="history-text">{item.text}</span>
              <span className="history-time">{format(item.timestamp, 'MMM d • HH:mm')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;

