import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter } from 'react-router-dom';
import { setupAxiosInterceptors } from './utils/axiosInterceptors';

// Configurar interceptores de Axios
setupAxiosInterceptors();



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
