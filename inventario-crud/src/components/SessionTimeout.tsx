import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface SessionTimeoutProps {
  token: string | null;
  onLogout: () => void;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT = 90 * 60 * 1000; // 1.5 horas

const SessionTimeout: React.FC<SessionTimeoutProps> = ({ token, onLogout, timeoutMs = DEFAULT_TIMEOUT }) => {
  const navigate = useNavigate();
  const [isWarningShown, setIsWarningShown] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    let timeoutId: NodeJS.Timeout;
    let warningTimeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      setIsWarningShown(false);

      // Advertencia 5 minutos antes del cierre de sesión
      warningTimeoutId = setTimeout(() => {
        if (!isWarningShown) {
          setIsWarningShown(true);
          toast.warning('Tu sesión expirará en 5 minutos por inactividad. Mueve el mouse o presiona una tecla para mantener la sesión activa.', {
            position: "top-center",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClose: () => setIsWarningShown(false)
          });
        }
      }, timeoutMs - 5 * 60 * 1000); // 5 minutos antes

      // Cierre de sesión
      timeoutId = setTimeout(() => {
        toast.error('Tu sesión ha expirado por inactividad.', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });
        setTimeout(() => {
          onLogout();
          navigate('/login');
        }, 1000);
      }, timeoutMs);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [token, onLogout, navigate, timeoutMs, isWarningShown]);

  return null;
};

export default SessionTimeout;
