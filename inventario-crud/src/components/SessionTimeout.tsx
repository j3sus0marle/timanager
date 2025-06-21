import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SessionTimeoutProps {
  token: string | null;
  onLogout: () => void;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT = 4 * 60 * 60 * 1000; // 4 horas

const SessionTimeout: React.FC<SessionTimeoutProps> = ({ token, onLogout, timeoutMs = DEFAULT_TIMEOUT }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) return;
    let timeoutId: NodeJS.Timeout;
    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onLogout();
        navigate('/login');
      }, timeoutMs);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [token, onLogout, navigate, timeoutMs]);
  return null;
};

export default SessionTimeout;
