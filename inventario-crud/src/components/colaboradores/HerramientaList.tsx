import React, { useState } from 'react';
import { Card, Button, Modal, Form, Input, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Herramienta {
  _id: string;
  nombre: string;
  marca: string;
  modelo: string;
  valor: number;
  serialNumber: string;
  fechaAsignacion: string;
}

interface HerramientaListProps {
  colaboradorId: string;
  herramientas: Herramienta[];
  onHerramientasChange: () => void;
}

const HerramientaList: React.FC<HerramientaListProps> = ({ 
  colaboradorId, 
  herramientas, 
  onHerramientasChange 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHerramienta, setEditingHerramienta] = useState<Herramienta | null>(null);
  const [form] = Form.useForm();

  const handleAddOrEdit = async (values: any) => {
    try {
      if (editingHerramienta) {
        // Actualizar herramienta existente
        await axios.put(`http://localhost:6051/api/herramientas/${editingHerramienta._id}`, {
          ...values,
          colaboradorId
        });
        message.success('Herramienta actualizada correctamente');
      } else {
        // Crear nueva herramienta
        await axios.post('http://localhost:6051/api/herramientas', {
          ...values,
          colaboradorId
        });
        message.success('Herramienta agregada correctamente');
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingHerramienta(null);
      onHerramientasChange();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al procesar la herramienta');
    }
  };

  const handleDelete = async (herramientaId: string) => {
    try {
      await axios.delete(`http://localhost:6051/api/herramientas/${herramientaId}`);
      message.success('Herramienta eliminada correctamente');
      onHerramientasChange();
    } catch (error) {
      message.error('Error al eliminar la herramienta');
    }
  };

  const openEditModal = (herramienta: Herramienta) => {
    setEditingHerramienta(herramienta);
    form.setFieldsValue(herramienta);
    setModalVisible(true);
  };

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setEditingHerramienta(null);
          form.resetFields();
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Agregar Herramienta
      </Button>

      <Card
        size="small"
        style={{ width: '100%', marginBottom: '8px', background: '#f5f5f5' }}
        bodyStyle={{ padding: '8px 16px' }}
      >
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <span style={{ width: '200px', fontWeight: 'bold' }}>Nombre</span>
          <span style={{ width: '150px', fontWeight: 'bold' }}>Marca</span>
          <span style={{ width: '150px', fontWeight: 'bold' }}>Modelo</span>
          <span style={{ width: '120px', fontWeight: 'bold' }}>Valor</span>
          <span style={{ width: '150px', fontWeight: 'bold' }}>Número de Serie</span>
          <span style={{ width: '150px', fontWeight: 'bold' }}>Fecha de Asignación</span>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {herramientas.map((herramienta) => (
          <Card
            key={herramienta._id}
            size="small"
            style={{ width: '100%' }}
            bodyStyle={{ padding: '8px 16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flex: 1 }}>
                <span style={{ width: '200px' }}><strong>{herramienta.nombre}</strong></span>
                <span style={{ width: '150px' }}>{herramienta.marca}</span>
                <span style={{ width: '150px' }}>{herramienta.modelo}</span>
                <span style={{ width: '120px' }}>${herramienta.valor.toFixed(2)}</span>
                <span style={{ width: '150px' }}>S/N: {herramienta.serialNumber}</span>
                <span style={{ width: '150px' }}>{new Date(herramienta.fechaAsignacion).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(herramienta)}
                />
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleDelete(herramienta._id)}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title={editingHerramienta ? "Editar Herramienta" : "Agregar Herramienta"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingHerramienta(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrEdit}
        >
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="marca"
            label="Marca"
            rules={[{ required: true, message: 'Por favor ingresa la marca' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="modelo"
            label="Modelo"
            rules={[{ required: true, message: 'Por favor ingresa el modelo' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="valor"
            label="Valor ($)"
            rules={[{ required: true, message: 'Por favor ingresa el valor' }]}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              formatter={(value) => value ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={(displayValue) => {
                const stringValue = displayValue?.replace(/\$\s?|(,*)/g, '') || '0';
                return Number(stringValue);
              }}
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="serialNumber"
            label="Número de Serie (S/N)"
            rules={[{ required: true, message: 'Por favor ingresa el número de serie' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingHerramienta ? 'Actualizar' : 'Guardar'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HerramientaList;
