import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 60 * 1000; // 1 minute before timeout

const SessionTimeout: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let warningTimer: NodeJS.Timeout;
    let logoutTimer: NodeJS.Timeout;

    const resetTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);

      warningTimer = setTimeout(() => {
        setShowWarning(true);
      }, SESSION_TIMEOUT - WARNING_TIME);

      logoutTimer = setTimeout(() => {
        navigate('/login');
      }, SESSION_TIMEOUT);
    };

    resetTimers();

    window.addEventListener('mousemove', resetTimers);
    window.addEventListener('keypress', resetTimers);

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      window.removeEventListener('mousemove', resetTimers);
      window.removeEventListener('keypress', resetTimers);
    };
  }, [navigate]);

  const handleContinue = () => {
    setShowWarning(false);
  };

  return (
    <Dialog
      open={showWarning}
      onClose={handleContinue}
      aria-labelledby="session-timeout-dialog-title"
      aria-describedby="session-timeout-dialog-description"
    >
      <DialogTitle id="session-timeout-dialog-title">
        Session Timeout Warning
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="session-timeout-dialog-description">
          Your session will expire in 1 minute. Do you want to continue?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleContinue} variant="contained" color="primary">
          Continue Session
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeout;
