import { useState } from 'react';
import { FaMicrophone, FaPaperPlane } from 'react-icons/fa';
import './Chat.css';

const MessageInput = ({ onSendMessage, isCentered, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className={`message-input-container ${isCentered ? 'centered' : ''}`}>
      <form className={`message-input-form ${isCentered ? 'centered' : ''}`} onSubmit={handleSubmit}>
        <input
          className="message-input"
          type="text"
          placeholder="Ask about crops, weather, fertilizers..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
        />
        <button className="voice-button" type="button" title="Voice input coming soon" disabled={disabled}>
          <FaMicrophone />
        </button>
        <button className="send-button" type="submit" disabled={disabled}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

