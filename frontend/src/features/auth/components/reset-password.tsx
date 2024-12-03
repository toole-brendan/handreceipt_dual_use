import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '@/styles/components/auth/shared.css';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or expired reset token');
    }
  }, [token]);

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
    setPasswordStrength(calculatePasswordStrength(formData.newPassword));
  }, [formData.newPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.newPassword || !formData.confirmPassword) {
      setStatus('error');
      setMessage('All fields are required');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return false;
    }

    if (passwordStrength < 3) {
      setStatus('error');
      setMessage('Password does not meet minimum requirements');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !token) return;
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage(null);
    setStatus('idle');

    try {
      // In development, simulate password reset
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStatus('success');
        setMessage('Password has been successfully reset');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      // In production, this would reset the password
      setStatus('error');
      setMessage('Password reset not implemented in production yet');
    } catch (error) {
      setStatus('error');
      setMessage('Could not reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRequirementStatus = (requirement: string): boolean => {
    switch (requirement) {
      case 'length':
        return formData.newPassword.length >= 8;
      case 'uppercase':
        return /[A-Z]/.test(formData.newPassword);
      case 'lowercase':
        return /[a-z]/.test(formData.newPassword);
      case 'number':
        return /[0-9]/.test(formData.newPassword);
      case 'special':
        return /[^A-Za-z0-9]/.test(formData.newPassword);
      default:
        return false;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-header">
          <h1>New Password</h1>
          <div className="auth-description">
            Create a new password for your account
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
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="New Password"
              className={status === 'error' ? 'error' : ''}
              disabled={loading || !token}
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
              placeholder="Confirm New Password"
              className={status === 'error' ? 'error' : ''}
              disabled={loading || !token}
            />
          </div>

          <div className="password-requirements">
            <span>Password must contain:</span>
            <ul>
              <li className={getRequirementStatus('length') ? 'met' : ''}>
                At least 8 characters
              </li>
              <li className={getRequirementStatus('uppercase') ? 'met' : ''}>
                One uppercase letter
              </li>
              <li className={getRequirementStatus('lowercase') ? 'met' : ''}>
                One lowercase letter
              </li>
              <li className={getRequirementStatus('number') ? 'met' : ''}>
                One number
              </li>
              <li className={getRequirementStatus('special') ? 'met' : ''}>
                One special character
              </li>
            </ul>
          </div>

          <button 
            type="submit" 
            className={`auth-button ${loading || !token ? 'disabled' : ''}`}
            disabled={loading || !token}
          >
            {loading ? (
              <div className="loading-spinner" />
            ) : (
              'Save New Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 