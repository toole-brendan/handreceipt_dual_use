import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import '@/styles/components/auth/login.css';

type Role = 'officer' | 'nco' | 'soldier';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [devRole, setDevRole] = useState<Role>('officer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      // In development, allow any login
      if (process.env.NODE_ENV === 'development') {
        dispatch({ type: 'auth/loginStart' });
        
        dispatch({
          type: 'auth/loginSuccess',
          payload: {
            user: {
              id: '1',
              username: username || 'dev-user',
              role: devRole,
              personnelId: 'DEV-001'
            },
            token: 'dev-token'
          }
        });

        navigate('/');
        return;
      }

      // In production, this would validate credentials
      setError('Invalid username or password');
    } catch (error) {
      setError('Could not log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        <div className="title-container">
          <h1>HandReceipt</h1>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className={error ? 'error' : ''}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={error ? 'error' : ''}
              disabled={loading}
            />
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="form-group">
              <select
                value={devRole}
                onChange={(e) => setDevRole(e.target.value as Role)}
                className="dev-role-select"
              >
                <option value="officer">Officer</option>
                <option value="nco">NCO</option>
                <option value="soldier">Soldier</option>
              </select>
              <div className="dev-role-hint">
                Development mode: Select role for testing
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className={`login-button ${loading ? 'disabled' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner" />
            ) : (
              <div className="button-text-container">
                <span className="button-text">Login</span>
                <span className="button-subtext">Click to authenticate</span>
              </div>
            )}
          </button>

          <div className="login-links">
            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
            <Link to="/create-account" className="auth-link">
              Create Account
            </Link>
          </div>
        </form>

        <div className="help-text">
          Having trouble? Contact your unit's S6 office
        </div>

        {process.env.NODE_ENV === 'development' && (
          <p className="dev-mode-notice">
            Development mode: Authentication is bypassed
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;