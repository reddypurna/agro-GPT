import { format } from 'date-fns';
import { FaRobot, FaUser } from 'react-icons/fa';
import './Chat.css';

const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${
            message.sender === 'user' ? 'user-message' : 'bot-message'
          }`}
        >
          <div className="message-avatar">
            {message.sender === 'user' ? <FaUser /> : <FaRobot />}
          </div>
          <div className="message-content">
            <div className="message-text">{message.text}</div>
            <div className="message-time">
              {format(message.timestamp, 'HH:mm')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;

