import { FaBug, FaCloudRain, FaChartLine, FaSeedling } from 'react-icons/fa';
import './Chat.css';

const QuickActions = ({ onActionClick }) => {
  const actions = [
    { icon: <FaSeedling />, label: 'Crop Advice', query: 'What crops should I plant this season?' },
    { icon: <FaCloudRain />, label: 'Weather', query: 'What is the weather forecast for farming?' },
    { icon: <FaBug />, label: 'Pest Control', query: 'How to control pests in my crops?' },
    { icon: <FaChartLine />, label: 'Market Prices', query: 'What are the current market prices for crops?' }
  ];

  return (
    <div className="quick-actions">
      {actions.map((action) => (
        <button
          key={action.label}
          className="quick-action-btn"
          onClick={() => onActionClick(action.query)}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;

