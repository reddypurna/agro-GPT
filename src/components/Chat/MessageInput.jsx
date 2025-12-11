import { useState, useEffect } from 'react';
import { FaMicrophone, FaPaperPlane, FaStop } from 'react-icons/fa';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import './Chat.css';

const MessageInput = ({ onSendMessage, isCentered, disabled, inputRef }) => {
  const [input, setInput] = useState('');

  const handleTranscript = (transcript) => {
    setInput(transcript);
  };

  const { isListening, error, startListening, stopListening, isSupported } = useVoiceInput(handleTranscript);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    onSendMessage(input.trim());
    setInput('');
  };

  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    if (error) {
      console.warn('Voice input error:', error);
    }
  }, [error]);

  return (
    <div className={`message-input-container ${isCentered ? 'centered' : ''}`}>
      <form className={`message-input-form ${isCentered ? 'centered' : ''}`} onSubmit={handleSubmit}>
        <input
          className="message-input"
          type="text"
          placeholder="Ask about crops, weather, fertilizers..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled || isListening}
          ref={inputRef}
        />
        {isSupported && (
          <button
            className={`voice-button ${isListening ? 'listening' : ''}`}
            type="button"
            title={isListening ? 'Stop listening' : 'Start voice input'}
            onClick={handleVoiceClick}
            disabled={disabled}
          >
            {isListening ? <FaStop /> : <FaMicrophone />}
          </button>
        )}
        <button className="send-button" type="submit" disabled={disabled || isListening || !input.trim()}>
          <FaPaperPlane />
        </button>
      </form>
      {isListening && (
        <div className="voice-indicator">
          <span className="voice-pulse"></span>
          Listening...
        </div>
      )}
      {error && !isListening && (
        <div className="voice-error">Voice input unavailable. Please type your message.</div>
      )}
    </div>
  );
};

export default MessageInput;
