import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';
import ChatbotIcon from '../components/ChatbotIcon';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await registerUser(username, email, password);
      } else {
        await loginUser(username, password);
      }
      navigate('/chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister((prev) => !prev);
    setError('');
  };

  return (
    <div className="auth-page">
      {/* Floating particles for animated background */}
      <div className="landing-particles">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
      </div>

      <div className="auth-card" style={{ zIndex: 10, position: 'relative' }}>
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <ChatbotIcon />
          </div>
          <h2 className="auth-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="auth-subtitle">
            {isRegister
              ? 'Sign up to start chatting with Quill Bot'
              : 'Log in to continue your conversation'}
          </p>
        </div>

        {/* Error Message */}
        {error && <div className="auth-error">{error}</div>}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        {/* Toggle */}
        <div className="auth-toggle">
          <span>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button onClick={toggleMode} className="auth-toggle-btn">
            {isRegister ? 'Login' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
