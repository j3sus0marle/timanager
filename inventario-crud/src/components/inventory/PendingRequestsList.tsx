import { useState, useEffect } from 'react';
import { Table, Button, Tag, Modal, Input, message } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import axios from 'axios';

const PendingRequestsList = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Si no hay token, no hacer la petición
      if (!token) {
        setRequests([]);
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}inventory-requests/pending`);
      
      // Asegurarse de que response.data sea un array
      if (Array.isArray(response.data)) {
        setRequests(response.data);
      } else {
        console.error('La respuesta no es un array:', response.data);
        setRequests([]);
      }
    } catch (error: any) {
      // Solo mostrar errores que no sean de autenticación
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error('Error al cargar las solicitudes:', error);
        message.error('Error al cargar las solicitudes. Por favor, intente nuevamente.');
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination);
  };

  const handleProcess = async (requestId: string, action: 'APROBAR' | 'RECHAZAR') => {
    try {
      const token = localStorage.getItem('token');
      console.log('Iniciando proceso de', action, 'para solicitud', requestId);
      
      // Si no hay token, no hacer la petición
      if (!token) {
        message.error('No tiene autorización para realizar esta acción');
        return;
      }

      // Si es rechazo, validar que haya motivo
      if (action === 'RECHAZAR' && !rejectReason.trim()) {
        message.error('Debe ingresar un motivo de rechazo');
        return;
      }

      // Mostrar indicador de carga
      setLoading(true);

      console.log('Enviando petición al servidor...');
      const url = `${import.meta.env.VITE_API_URL}inventory-requests/${requestId}/process`;
      console.log('URL de la petición:', url);
      const response = await axios.post(url, {
        action,
        motivoRechazo: action === 'RECHAZAR' ? rejectReason : undefined
      });

      console.log('Respuesta del servidor:', response.data);

      // Verificar que la respuesta sea exitosa
      if (response.data) {
        message.success({
          content: `Solicitud ${action === 'APROBAR' ? 'aprobada' : 'rechazada'} exitosamente`,
          duration: 4
        });
        setRejectModalVisible(false);
        setRejectReason('');
        console.log('Recargando lista de solicitudes...');
        await loadRequests(); // Recargar la lista
      }
    } catch (error: any) {
      // Manejar errores específicos
      console.error('Error completo:', error);
      if (error.response) {
        console.error('Detalles del error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      if (error.response?.status === 400) {
        message.error(error.response.data.message || 'Error en la solicitud');
      } else if (error.response?.status === 500) {
        message.error('Error interno del servidor. Por favor, contacte al administrador.');
      } else if (error.response?.status !== 401 && error.response?.status !== 403) {
        message.error('Error al procesar la solicitud. Por favor, intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const showRejectModal = (request: any) => {
    setSelectedRequest(request);
    setRejectModalVisible(true);
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'fechaSolicitud',
      key: 'fechaSolicitud',
      render: (fecha: string) => new Date(fecha).toLocaleDateString('es-MX')
    },
    {
      title: 'Solicitante',
      dataIndex: ['solicitanteId', 'username'],
      key: 'solicitante',
      render: (_: any, record: any) => record.solicitanteId?.username || 'N/A'
    },
    {
      title: 'Tipo',
      dataIndex: 'tipoMovimiento',
      key: 'tipoMovimiento',
      render: (tipo: string) => (
        <Tag color={tipo === 'ENTRADA' ? 'green' : 'red'}>
          {tipo}
        </Tag>
      )
    },
    {
      title: 'Inventario',
      dataIndex: 'inventarioTipo',
      key: 'inventarioTipo'
    },
    {
      title: 'Item',
      dataIndex: ['itemId', 'descripcion'],
      key: 'item'
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad'
    },
    {
      title: 'Motivo',
      dataIndex: 'motivoSolicitud',
      key: 'motivoSolicitud',
      ellipsis: true
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: any) => (
        <div>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setSelectedRequest(record);
              setApproveModalVisible(true);
            }}
            style={{ marginRight: 8 }}
          >
            Aprobar
          </Button>
          <Button
            danger
            size="small"
            onClick={() => showRejectModal(record)}
          >
            Rechazar
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <h2>Solicitudes Pendientes</h2>
      
      <Table
        columns={columns}
        dataSource={requests}
        rowKey="_id"
        pagination={pagination}
        onChange={handleTableChange}
        loading={loading}
      />

      {/* Modal de Rechazo */}
      <Modal
        title="Rechazar Solicitud"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
        onOk={() => handleProcess(selectedRequest?._id, 'RECHAZAR')}
        okText="Rechazar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
      >
        <Input.TextArea
          rows={4}
          placeholder="Ingrese el motivo del rechazo"
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
        />
      </Modal>

      {/* Modal de Aprobación */}
      <Modal
        title="Confirmar Aprobación"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        onOk={() => {
          handleProcess(selectedRequest?._id, 'APROBAR');
          setApproveModalVisible(false);
        }}
        okText="Aprobar"
        cancelText="Cancelar"
        okButtonProps={{ type: 'primary' }}
      >
        <p>¿Está seguro que desea aprobar esta solicitud?</p>
        {selectedRequest && (
          <div style={{ marginTop: 16 }}>
            <p><strong>Solicitante:</strong> {selectedRequest.solicitanteId?.username}</p>
            <p><strong>Tipo:</strong> {selectedRequest.tipoMovimiento}</p>
            <p><strong>Item:</strong> {selectedRequest.itemId?.descripcion}</p>
            <p><strong>Cantidad:</strong> {selectedRequest.cantidad}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PendingRequestsList;
