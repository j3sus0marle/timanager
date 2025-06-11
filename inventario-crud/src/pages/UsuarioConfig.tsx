import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = import.meta.env.VITE_API_URL + "auth";

export default function UsuarioConfig({ username, onUpdate }: { username: string; onUpdate: (newUsername: string) => void }) {
  const [newUsername, setNewUsername] = useState(username);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/update-user`,
        {
          username,
          newUsername,
          password,
          newPassword,
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      setSuccess('Usuario actualizado correctamente.');
      onUpdate(newUsername);
      setPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: 420 }}>
        <h3 className="mb-4 text-center" style={{ color: '#495057' }}>Configuración de Usuario</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre de usuario</label>
            <input
              type="text"
              className="form-control"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="editPasswordSwitch"
              checked={editPassword}
              onChange={() => setEditPassword(!editPassword)}
            />
            <label className="form-check-label" htmlFor="editPasswordSwitch">
              Cambiar contraseña
            </label>
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña actual</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={!editPassword}
              required={editPassword}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nueva contraseña</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              disabled={!editPassword}
              required={editPassword}
            />
          </div>
          <button type="submit" className="btn w-100" style={{ backgroundColor: '#495057', color: '#fff' }} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
        {success && <div className="alert alert-success mt-3 mb-0 py-2 text-center">{success}</div>}
        {error && <div className="alert alert-danger mt-3 mb-0 py-2 text-center">{error}</div>}
      </div>
    </div>
  );
}
