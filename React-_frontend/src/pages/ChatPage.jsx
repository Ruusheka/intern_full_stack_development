import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatbotIcon from '../components/ChatbotIcon';
import ChatForm from '../components/ChatForm';
import ChatMessage from '../components/ChatMessage';
import { askQuestion, logoutUser, getCurrentUser, isAuthenticated, clearHistory } from '../services/api';
import { Zap, Plug, Activity, Cpu, Hand } from 'lucide-react';

const ChatPage = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatBot, setShowChatbot] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const chatBodyRef = useRef(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const generateBotResponse = async (history) => {
    const updateHistory = (text) => {
      setChatHistory(prev => [
        ...prev.filter(msg => msg.text !== "Thinking..."),
        { role: "model", text }
      ]);
    };

    const lastUserMessage = history.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) return;

    try {
      const data = await askQuestion(lastUserMessage.text);
      const responseText = data.answer
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();
      updateHistory(responseText);
    } catch (error) {
      console.error("API Error:", error.message);
      if (error.message.includes('Session expired')) {
        navigate('/login');
        return;
      }
      updateHistory("⚠️ Failed to get response from bot");
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleClearChat = () => {
    // Only clear the frontend chat view, do not delete from backend database
    setChatHistory([]);
  };

  const toggleChat = () => {
    setShowChatbot(prev => !prev);
    setMinimized(false);
  };

  return (
    <div className={`container ${showChatBot ? "show-chatbot" : ""}`}>
      {/* Top navbar */}
      <div className="chat-page-navbar">
        <div className="chat-page-brand">
          <ChatbotIcon />
          <span>Quill Bot</span>
        </div>
        <div className="chat-page-nav-right">
          <span className="chat-page-user">Hi, {user?.username || 'User'}</span>
          <button onClick={handleLogout} className="chat-page-logout">
            Logout
          </button>
        </div>
      </div>

      {/* ===== ELECTRICAL THEMED BACKGROUND ===== */}
      <div className="elec-bg">
        <svg className="circuit-svg" viewBox="0 0 1200 700" preserveAspectRatio="none">
          <path className="circuit-line cl-1" d="M0,350 H200 L230,300 H400 L430,350 H600" />
          <path className="circuit-line cl-2" d="M600,350 H750 L780,400 H950 L980,350 H1200" />
          <path className="circuit-line cl-3" d="M300,0 V150 L350,180 V350" />
          <path className="circuit-line cl-4" d="M900,700 V550 L850,520 V350" />
          <path className="circuit-line cl-5" d="M0,500 H150 L180,450 H350 L380,500 H500" />
          <path className="circuit-line cl-6" d="M700,200 H850 L880,250 H1050 L1080,200 H1200" />
          <circle className="circuit-node cn-1" cx="200" cy="350" r="4" />
          <circle className="circuit-node cn-2" cx="600" cy="350" r="4" />
          <circle className="circuit-node cn-3" cx="350" cy="180" r="4" />
          <circle className="circuit-node cn-4" cx="850" cy="520" r="4" />
          <circle className="circuit-node cn-5" cx="500" cy="500" r="4" />
          <circle className="circuit-node cn-6" cx="700" cy="200" r="4" />
        </svg>

        <div className="elec-symbols">
          <span className="elec-sym es-1"><Zap size={32} /></span>
          <span className="elec-sym es-2"><Plug size={28} /></span>
          <span className="elec-sym es-3"><Activity size={28} /></span>
          <span className="elec-sym es-4"><Zap size={24} /></span>
          <span className="elec-sym es-5"><Cpu size={28} /></span>
          <span className="elec-sym es-6"><Activity size={28} /></span>
          <span className="elec-sym es-7"><Zap size={20} /></span>
          <span className="elec-sym es-8"><Plug size={28} /></span>
        </div>

        <div className="energy-rings">
          <div className="energy-ring er-1"></div>
          <div className="energy-ring er-2"></div>
          <div className="energy-ring er-3"></div>
        </div>

        <div className="elec-hero">
          <div className="elec-bot-icon">
            <ChatbotIcon />
            <div className="elec-pulse-ring"></div>
            <div className="elec-pulse-ring pr-2"></div>
          </div>
          <h1 className="elec-title">Ask Your Queries to <span className="elec-highlight">Quill Bot</span></h1>
          <p className="elec-subtitle">
            Your AI-powered assistant for Electrical Machines — Transformers, Motors, Generators & more
          </p>
          <div className="elec-chips">
            <span className="elec-chip"><span className="material-symbols-outlined">electric_bolt</span> Transformers</span>
            <span className="elec-chip"><span className="material-symbols-outlined">settings</span> DC Motors</span>
            <span className="elec-chip"><span className="material-symbols-outlined">cycle</span> Induction Motors</span>
            <span className="elec-chip"><span className="material-symbols-outlined">bolt</span> Generators</span>
          </div>
          <p className="elec-hint">
            <span className="material-symbols-outlined">arrow_forward</span>
            Click the chat button to start asking
          </p>
        </div>
      </div>

      {/* Backdrop overlay when chat is expanded */}
      {showChatBot && <div className="chat-backdrop" onClick={toggleChat}></div>}

      {/* Toggle button */}
      <button
        onClick={toggleChat}
        id="chatbot-toggler"
        className={showChatBot ? "open" : ""}
      >
        <span className="material-symbols-outlined mode-comment">mode_comment</span>
        <span className="material-symbols-outlined close">close</span>
      </button>

      {/* Chatbot popup — now center-expanded when visible */}
      <div className={`chatbot-popup ${showChatBot ? "chatbot-expanded" : ""} ${minimized ? "minimized" : ""}`}>
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <div className="header-actions">
            <button
              className="material-symbols-outlined clear-button"
              onClick={handleClearChat}
              title="Clear Chat"
            >
              delete
            </button>
            <button
              className={`material-symbols-outlined arrow-button ${minimized ? "rotated" : ""}`}
              onClick={() => setMinimized(prev => !prev)}
              title="Minimize"
            >
              keyboard_arrow_down
            </button>
          </div>
        </div>

        {!minimized && (
          <div className="chat-body" ref={chatBodyRef}>
            <div className="message bot-message">
              <ChatbotIcon />
              <p className="message-text">
                Hey there 👋 <br />
                Ask me anything about Electrical Machines!
              </p>
            </div>
            {chatHistory.map((chat, index) => (
              <ChatMessage key={index} chat={chat} />
            ))}
          </div>
        )}

        {!minimized && (
          <div className="chat-footer">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
