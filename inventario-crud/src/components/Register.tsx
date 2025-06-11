import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = import.meta.env.VITE_API_URL + "auth";

export default function Register({ onRegister }: { onRegister: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post(`${API_URL}/register`, { username, password });
      setSuccess('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
      setUsername('');
      setPassword('');
      onRegister();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="register-container card shadow p-4" style={{ minWidth: 340, maxWidth: 380 }}>
        <h2 className="mb-4 text-center" style={{ color: '#495057' }}>Registro</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn w-100" style={{ backgroundColor: '#495057', color: '#fff' }}>Registrar</button>
        </form>
        <div className="text-center mt-3">
          <span>¿Ya tienes cuenta? </span>
          <a href="/login" className="text-decoration-underline" style={{ color: '#495057', cursor: 'pointer' }}>
            Inicia sesión aquí
          </a>
        </div>
        {error && <div className="alert alert-danger mt-3 mb-0 py-2 text-center">{error}</div>}
        {success && <div className="alert alert-success mt-3 mb-0 py-2 text-center">{success}</div>}
      </div>
    </div>
  );
}
