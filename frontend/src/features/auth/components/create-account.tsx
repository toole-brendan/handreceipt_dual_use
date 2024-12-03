import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '@/styles/components/auth/shared.css';

type Role = 'officer' | 'nco' | 'soldier';

const CreateAccount: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: '' as Role,
    unit: '',
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.username || !formData.password || !formData.confirmPassword || !formData.role || !formData.unit) {
      setStatus('error');
      setMessage('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return false;
    }

    if (passwordStrength < 3) {
      setStatus('error');
      setMessage('Password is not strong enough');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage(null);
    setStatus('idle');

    try {
      // In development, simulate account creation
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStatus('success');
        setMessage('Account created successfully');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      // In production, this would create the account
      setStatus('error');
      setMessage('Account creation not implemented in production yet');
    } catch (error) {
      setStatus('error');
      setMessage('Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-header">
          <h1>Create Account</h1>
          <div className="auth-description">
            Join HandReceipt to manage your unit's equipment
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {message && (
            <div className={`status-message ${status}`}>
              {message}
            </div>
          )}

          <div className="form-group">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              className={status === 'error' ? 'error' : ''}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className={status === 'error' ? 'error' : ''}
              disabled={loading}
            />
            <div className="password-strength">
              <div className={`strength-bar strength-${passwordStrength}`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className={`bar ${index < passwordStrength ? 'filled' : ''}`} />
                ))}
              </div>
              <span className="strength-text">
                {passwordStrength === 0 && 'Very Weak'}
                {passwordStrength === 1 && 'Weak'}
                {passwordStrength === 2 && 'Fair'}
                {passwordStrength === 3 && 'Good'}
                {passwordStrength === 4 && 'Strong'}
                {passwordStrength === 5 && 'Very Strong'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm Password"
              className={status === 'error' ? 'error' : ''}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={status === 'error' ? 'error' : ''}
              disabled={loading}
            >
              <option value="">Select Role</option>
              <option value="officer">Officer</option>
              <option value="nco">NCO</option>
              <option value="soldier">Soldier</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              placeholder="Unit Information"
              className={status === 'error' ? 'error' : ''}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className={`auth-button ${loading ? 'disabled' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner" />
            ) : (
              'Create Account'
            )}
          </button>

          <div className="auth-links">
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccount; 