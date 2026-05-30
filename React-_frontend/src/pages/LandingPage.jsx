import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/api';
import ChatbotIcon from '../components/ChatbotIcon';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartChatting = () => {
    if (isAuthenticated()) {
      navigate('/chat');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      {/* Floating particles for depth */}
      <div className="landing-particles">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
      </div>

      <div className="landing-container">
        {/* Hero Section */}
        <div className="landing-hero">
          <div className="landing-icon-wrapper">
            <ChatbotIcon />
          </div>
          <h1 className="landing-title">Welcome to Your Quill Bot</h1>
          <p className="landing-tagline">
            Your intelligent companion for seamless conversations.
          </p>
          <p className="landing-description">
            Powered by advanced AI, Quill Bot helps you explore topics in
            electrical machines, engineering concepts, and much more — all
            through natural, friendly conversation.
          </p>
          <button className="landing-cta" onClick={handleStartChatting}>
            Start Chatting
            <span className="material-symbols-outlined cta-arrow">arrow_forward</span>
          </button>
        </div>

        {/* Feature Cards */}
        <div className="landing-features">
          <div className="feature-card">
            <span className="material-symbols-outlined feature-icon">bolt</span>
            <h3>Instant Answers</h3>
            <p>Get accurate, AI-generated responses in seconds.</p>
          </div>
          <div className="feature-card">
            <span className="material-symbols-outlined feature-icon">history</span>
            <h3>Chat History</h3>
            <p>All your conversations saved and accessible anytime.</p>
          </div>
          <div className="feature-card">
            <span className="material-symbols-outlined feature-icon">security</span>
            <h3>Secure & Private</h3>
            <p>Your data is encrypted and safely stored.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
