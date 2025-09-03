import React from 'react';
import ColaboradorList from '../components/colaboradores/ColaboradorList';

const Colaboradores: React.FC = () => {
  return (
    <div>
      <h2 className="mb-4">Colaboradores</h2>
      <ColaboradorList />
    </div>
  );
};

export default Colaboradores;
