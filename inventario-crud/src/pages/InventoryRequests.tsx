import React, { useState } from 'react';
import { Tabs } from 'antd';
import PendingRequestsList from '../components/inventory/PendingRequestsList';
import MyRequestsList from '../components/inventory/MyRequestsList';

const InventoryRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const items = [
    {
      key: '1',
      label: 'Mis Solicitudes',
      children: <MyRequestsList />
    },
    {
      key: '2',
      label: 'Solicitudes Pendientes',
      children: <PendingRequestsList />
    }
  ];

  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Gestión de Solicitudes de Inventario</h2>
          
          <Tabs activeKey={activeTab} items={items} onChange={handleTabChange} />
        </div>
      </div>
    </div>
  );
};

export default InventoryRequests;
