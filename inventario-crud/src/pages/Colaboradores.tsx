import React from 'react';
import { useNavigate } from 'react-router-dom';
import ColaboradorList from '../components/colaboradores/ColaboradorList';
import { FaFileAlt } from 'react-icons/fa';

const Colaboradores: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Colaboradores</h2>
        <button
          className="btn btn-warning d-flex align-items-center gap-2"
          onClick={() => navigate('/papeleria')}
        >
          <FaFileAlt />
          Documentos
        </button>
      </div>
      <ColaboradorList />
    </div>
  );
};

export default Colaboradores;
