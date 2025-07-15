import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button, Modal, Form, Badge } from 'react-bootstrap';
import DataTable from '../common/DataTable';
import SearchBar from '../common/SearchBar';
import PaginationCompact from '../common/PaginationCompact';
import { CotizacionCanalizacion, ItemCotizacionCanalizacion, Cliente, MaterialCanalizacion } from '../../types';

// Componente para fila de producto
const ProductRow: React.FC<{
  item: Partial<ItemCotizacionCanalizacion>;
  index: number;
  isEditing: boolean;
  materiales: MaterialCanalizacion[];
  onUpdate: (index: number, field: string, value: any) => void;
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
  onCancelEdit: () => void;
  disabled: boolean;
  isNew?: boolean;
  onSave?: () => void;
}> = ({ item, index, isEditing, materiales, onUpdate, onDelete, onEdit, onCancelEdit, disabled, isNew = false, onSave }) => {
  const [productSearchTerm, setProductSearchTerm] = useState(item.descripcion || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<MaterialCanalizacion[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatearMoneda = (valor: number) => {
    return `$${valor.toLocaleString('es-MX', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // Efecto para cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  const importe = (item.cantidad || 1) * (item.precioUnitario || 0);

  const handleProductSearch = (value: string) => {
    setProductSearchTerm(value);
    onUpdate(index, 'descripcion', value);
    setSelectedIndex(-1); // Reset selected index
    
    console.log('Buscando:', value, 'Materiales disponibles:', materiales.length); // Debug
    
    if (value.length > 1) {
      updateDropdownPosition(); // Actualizar posición del dropdown
      
      const searchTerms = value.toLowerCase().split(' ').filter(term => term.length > 0);
      
      const filtered = materiales.filter(material => {
        // Crear un texto combinado con todos los campos del material
        const combinedText = `${material.tipo} ${material.material} ${material.medida} ${material.proveedor || ''}`.toLowerCase();
        
        // Verificar si TODOS los términos de búsqueda están presentes en el texto combinado
        const matchesAllTerms = searchTerms.every(term => 
          combinedText.includes(term)
        );
        
        // También verificar coincidencias individuales en campos específicos para mayor flexibilidad
        const matchesIndividualFields = searchTerms.some(term =>
          material.material.toLowerCase().includes(term) ||
          material.tipo.toLowerCase().includes(term) ||
          material.medida.toLowerCase().includes(term) ||
          (material.proveedor && material.proveedor.toLowerCase().includes(term))
        );
        
        return matchesAllTerms || matchesIndividualFields;
      });
      
      // Ordenar por relevancia: primero los que coinciden con todos los términos
      const sortedFiltered = filtered.sort((a, b) => {
        const aCombined = `${a.tipo} ${a.material} ${a.medida} ${a.proveedor || ''}`.toLowerCase();
        const bCombined = `${b.tipo} ${b.material} ${b.medida} ${b.proveedor || ''}`.toLowerCase();
        
        const aMatchesAll = searchTerms.every(term => aCombined.includes(term));
        const bMatchesAll = searchTerms.every(term => bCombined.includes(term));
        
        if (aMatchesAll && !bMatchesAll) return -1;
        if (!aMatchesAll && bMatchesAll) return 1;
        
        // Si ambos coinciden igual, ordenar alfabéticamente
        return aCombined.localeCompare(bCombined);
      });
      
      console.log('Resultados filtrados:', sortedFiltered.length); // Debug
      setProductSuggestions(sortedFiltered.slice(0, 10)); // Limitar a 10 resultados
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectProduct = (material: MaterialCanalizacion) => {
    const descripcion = `${material.tipo} - ${material.material} - ${material.medida}`;
    setProductSearchTerm(descripcion);
    onUpdate(index, 'descripcion', descripcion);
    onUpdate(index, 'precioUnitario', material.precio);
    onUpdate(index, 'materialCanalizacion', material._id);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || productSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < productSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : productSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < productSuggestions.length) {
          selectProduct(productSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Componente del dropdown que se renderiza usando portal
  const DropdownPortal = () => {
    if (!showSuggestions) return null;

    return createPortal(
      <div 
        ref={dropdownRef}
        className="bg-white border rounded shadow-lg" 
        style={{ 
          position: 'absolute',
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          zIndex: 99999, 
          maxHeight: '300px', 
          overflowY: 'auto'
        }}
      >
        {productSuggestions.length > 0 ? (
          productSuggestions.map((material, suggestionIndex) => (
            <div
              key={material._id}
              className={`p-2 border-bottom cursor-pointer ${suggestionIndex === selectedIndex ? 'bg-primary text-white' : ''}`}
              onClick={() => selectProduct(material)}
              style={{ cursor: 'pointer', fontSize: '0.875rem' }}
              onMouseEnter={() => setSelectedIndex(suggestionIndex)}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <strong className={suggestionIndex === selectedIndex ? 'text-white' : 'text-primary'}>
                    {material.tipo}
                  </strong>
                  <span className="mx-1">-</span>
                  <strong>{material.material}</strong>
                  <br />
                  <small className={suggestionIndex === selectedIndex ? 'text-white-50' : 'text-muted'}>
                    <i className="fas fa-ruler me-1"></i>
                    {material.medida}
                    {material.proveedor && (
                      <>
                        <span className="mx-2">•</span>
                        <i className="fas fa-building me-1"></i>
                        {material.proveedor}
                      </>
                    )}
                  </small>
                </div>
                <div className="text-end">
                  <span className={`fw-bold ${suggestionIndex === selectedIndex ? 'text-white' : 'text-success'}`}>
                    {formatearMoneda(material.precio)}
                  </span>
                  <br />
                  <small className={suggestionIndex === selectedIndex ? 'text-white-50' : 'text-muted'}>
                    {material.unidad}
                  </small>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 text-center text-muted">
            <i className="fas fa-search me-2"></i>
            No se encontraron productos con "{productSearchTerm}"
          </div>
        )}
      </div>,
      document.body
    );
  };

  if (!isEditing) {
    // Modo visualización
    return (
      <tr className={disabled ? 'table-secondary' : ''}>
        <td className="align-middle">
          <Badge bg="secondary">{isNew ? 'Nuevo' : index + 1}</Badge>
        </td>
        <td className="align-middle">{item.descripcion}</td>
        <td className="align-middle text-center">{item.cantidad}</td>
        <td className="align-middle text-end">{formatearMoneda(item.precioUnitario || 0)}</td>
        <td className="align-middle text-end fw-bold">{formatearMoneda(importe)}</td>
        <td className="align-middle">
          <div className="d-flex gap-1 justify-content-center">
            <Button 
              variant="warning" 
              size="sm"
              onClick={() => onEdit(index)}
              disabled={disabled}
              title="Editar producto"
            >
              <i className="fas fa-pencil-alt me-1"></i>
              Editar
            </Button>
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => onDelete(index)}
              disabled={disabled}
              title="Eliminar producto"
            >
              <i className="fas fa-trash-alt me-1"></i>
              Eliminar
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  // Modo edición
  return (
    <>
      <tr className="table-warning">
        <td className="align-middle">
          <Badge bg="warning">{isNew ? 'Nuevo' : index + 1}</Badge>
        </td>
        <td className="align-middle">
          <Form.Control
            ref={inputRef}
            as="textarea"
            rows={2}
            size="sm"
            value={productSearchTerm}
            onChange={(e) => handleProductSearch(e.target.value)}
            onFocus={updateDropdownPosition}
            onKeyDown={handleKeyDown}
            placeholder="Buscar material (ej: 'Tubo 3/4', 'PD Metálico', 'DIAR 1/2')..."
            autoComplete="off"
          />
        </td>
        <td className="align-middle">
          <Form.Control
            type="number"
            size="sm"
            value={item.cantidad || 1}
            onChange={(e) => onUpdate(index, 'cantidad', parseFloat(e.target.value) || 1)}
            min="1"
            step="0.01"
            placeholder="0"
          />
        </td>
        <td className="align-middle">
          <Form.Control
            type="number"
            size="sm"
            value={item.precioUnitario || 0}
            onChange={(e) => onUpdate(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </td>
        <td className="align-middle">
          <div className="fw-bold text-end">
            {formatearMoneda(importe)}
          </div>
        </td>
        <td className="align-middle">
          <div className="d-flex gap-1 justify-content-center">
            {isNew ? (
              <>
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={onSave}
                  disabled={!item.descripcion || !item.cantidad || !item.precioUnitario}
                  title="Guardar producto"
                >
                  <i className="fas fa-check me-1"></i>
                  Guardar
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={onCancelEdit}
                  title="Cancelar"
                >
                  <i className="fas fa-times me-1"></i>
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={() => onUpdate(index, 'save', true)}
                  disabled={!item.descripcion || !item.cantidad || !item.precioUnitario}
                  title="Guardar cambios"
                >
                  <i className="fas fa-save me-1"></i>
                  Guardar
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={onCancelEdit}
                  title="Cancelar edición"
                >
                  <i className="fas fa-times me-1"></i>
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </td>
      </tr>
      <DropdownPortal />
    </>
  );
};

const CotizacionCanalizacionList: React.FC = () => {
  // Estados básicos
  const [cotizaciones, setCotizaciones] = useState<CotizacionCanalizacion[]>([]);
  const [filteredCotizaciones, setFilteredCotizaciones] = useState<CotizacionCanalizacion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCotizacion, setEditingCotizacion] = useState<CotizacionCanalizacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para formulario
  const [formData, setFormData] = useState<Partial<CotizacionCanalizacion>>({
    cliente: '',
    numeroPresupuesto: '',
    fecha: new Date().toISOString().split('T')[0], // Fecha actual
    vigencia: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días desde hoy
    items: [],
    subtotal: 0,
    utilidad: 30, // 30% por defecto
    total: 0,
    estado: 'Borrador',
    comentarios: ''
  });
  
  // Estados para autocompletado de cliente
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSuggestions, setClienteSuggestions] = useState<Cliente[]>([]);
  const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);
  
  // Estados para autocompletado de productos
  const [materiales, setMateriales] = useState<MaterialCanalizacion[]>([]);

  // Estados para tabla de productos
  const [currentItem, setCurrentItem] = useState<Partial<ItemCotizacionCanalizacion>>({
    descripcion: '',
    cantidad: 1,
    precioUnitario: 0,
    subtotal: 0
  });

  // Estados para edición de items
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [isEditingItem, setIsEditingItem] = useState(false);

  useEffect(() => {
    fetchCotizaciones();
    fetchClientes();
    fetchMateriales();
  }, []);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, cotizaciones]);

  const fetchCotizaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/cotizaciones-canalizacion');
      if (!response.ok) throw new Error('Error al cargar cotizaciones');
      const data = await response.json();
      setCotizaciones(data);
      setFilteredCotizaciones(data);
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
      setError('Error al cargar las cotizaciones');
      setCotizaciones([]);
      setFilteredCotizaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes');
      if (!response.ok) throw new Error('Error al cargar clientes');
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setClientes([]);
    }
  };

  const fetchMateriales = async () => {
    try {
      const response = await fetch('/api/material-canalizacion');
      if (!response.ok) throw new Error('Error al cargar materiales');
      const data = await response.json();
      setMateriales(data);
    } catch (error) {
      console.error('Error al cargar materiales:', error);
      setMateriales([]);
    }
  };

  // Generar número de presupuesto automático
  const generatePresupuestoNumber = () => {
    const maxNumber = cotizaciones.reduce((max, cotizacion) => {
      const match = cotizacion.numeroPresupuesto.match(/PME-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    
    return `PME-${(maxNumber + 1).toString().padStart(3, '0')}`;
  };

  // Manejar búsqueda de clientes
  const handleClienteSearch = (value: string) => {
    setFormData({ ...formData, cliente: value });
    
    if (value.length > 1) {
      const filtered = clientes.filter(cliente =>
        cliente.nombreEmpresa.toLowerCase().includes(value.toLowerCase())
      );
      setClienteSuggestions(filtered);
      setShowClienteSuggestions(true);
    } else {
      setShowClienteSuggestions(false);
    }
  };

  // Seleccionar cliente
  const selectCliente = (cliente: Cliente) => {
    setFormData({ ...formData, cliente: cliente.nombreEmpresa });
    setShowClienteSuggestions(false);
  };

  // Agregar nueva fila
  const addNewRow = () => {
    setIsEditingItem(true);
    setEditingItemIndex(-1); // -1 indica nueva fila
    setCurrentItem({
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0
    });
  };

  // Guardar nuevo item
  const saveNewItem = () => {
    if (currentItem.descripcion && currentItem.cantidad && currentItem.precioUnitario) {
      const newItem = {
        ...currentItem,
        unidad: 'PZA',
        subtotal: (currentItem.cantidad || 1) * (currentItem.precioUnitario || 0)
      } as ItemCotizacionCanalizacion;
      
      const newItems = [...(formData.items || []), newItem];
      const newSubtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      const newTotal = newSubtotal * (1 + (formData.utilidad || 30) / 100);
      
      setFormData({
        ...formData,
        items: newItems,
        subtotal: newSubtotal,
        total: newTotal
      });
      
      // Salir del modo edición
      setIsEditingItem(false);
      setEditingItemIndex(null);
      setCurrentItem({
        descripcion: '',
        cantidad: 1,
        precioUnitario: 0,
        subtotal: 0
      });
    }
  };

  // Actualizar item existente
  const updateItem = (index: number, field: string, value: any) => {
    if (field === 'save') {
      // Guardar cambios del item existente
      const items = formData.items || [];
      const item = items[index];
      if (item) {
        const updatedItem = {
          ...item,
          subtotal: (item.cantidad || 1) * (item.precioUnitario || 0)
        };
        
        const newItems = [...items];
        newItems[index] = updatedItem;
        const newSubtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
        const newTotal = newSubtotal * (1 + (formData.utilidad || 30) / 100);
        
        setFormData({
          ...formData,
          items: newItems,
          subtotal: newSubtotal,
          total: newTotal
        });
        
        setIsEditingItem(false);
        setEditingItemIndex(null);
      }
    } else {
      // Actualizar campo específico
      const items = formData.items || [];
      const newItems = [...items];
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Recalcular subtotal si cambió cantidad o precio
        if (field === 'cantidad' || field === 'precioUnitario') {
          const cantidad = field === 'cantidad' ? value : newItems[index].cantidad;
          const precio = field === 'precioUnitario' ? value : newItems[index].precioUnitario;
          newItems[index].subtotal = cantidad * precio;
        }
        
        setFormData({ ...formData, items: newItems });
      }
    }
  };

  // Actualizar currentItem para nueva fila
  const updateCurrentItem = (_index: number, field: string, value: any) => {
    setCurrentItem(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalcular subtotal si cambió cantidad o precio
      if (field === 'cantidad' || field === 'precioUnitario') {
        const cantidad = field === 'cantidad' ? value : prev.cantidad;
        const precio = field === 'precioUnitario' ? value : prev.precioUnitario;
        updated.subtotal = (cantidad || 1) * (precio || 0);
      }
      
      return updated;
    });
  };

  // Editar item
  const editItem = (index: number) => {
    setIsEditingItem(true);
    setEditingItemIndex(index);
  };

  // Cancelar edición
  const cancelEdit = () => {
    setIsEditingItem(false);
    setEditingItemIndex(null);
    setCurrentItem({
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0
    });
  };

  // Remover item
  const removeItem = (index: number) => {
    const newItems = formData.items?.filter((_, i) => i !== index) || [];
    const newSubtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
    const newTotal = newSubtotal * (1 + (formData.utilidad || 30) / 100);
    
    setFormData({
      ...formData,
      items: newItems,
      subtotal: newSubtotal,
      total: newTotal
    });

    // Si estamos editando el item que se está eliminando, cancelar la edición
    if (isEditingItem && editingItemIndex === index) {
      cancelEdit();
    } else if (isEditingItem && editingItemIndex !== null && editingItemIndex > index) {
      // Ajustar el índice si estamos editando un item después del eliminado
      setEditingItemIndex(editingItemIndex - 1);
    }
  };

  // Actualizar utilidad y recalcular total
  const updateUtilidad = (utilidad: number) => {
    const newTotal = (formData.subtotal || 0) * (1 + utilidad / 100);
    setFormData({
      ...formData,
      utilidad,
      total: newTotal
    });
  };

  const handleNew = () => {
    setEditingCotizacion(null);
    const today = new Date().toISOString().split('T')[0];
    const vigenciaDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 días desde hoy
    
    setFormData({
      cliente: '',
      numeroPresupuesto: generatePresupuestoNumber(),
      fecha: today,
      vigencia: vigenciaDate,
      items: [],
      subtotal: 0,
      utilidad: 30,
      total: 0,
      estado: 'Borrador',
      comentarios: ''
    });
    
    // Limpiar estados de edición
    setIsEditingItem(false);
    setEditingItemIndex(null);
    setCurrentItem({
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0
    });
    
    setShowModal(true);
  };

  const handleEdit = (cotizacion: CotizacionCanalizacion) => {
    setEditingCotizacion(cotizacion);
    setFormData(cotizacion);
    
    // Limpiar estados de edición de items
    setIsEditingItem(false);
    setEditingItemIndex(null);
    setCurrentItem({
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0
    });
    
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      console.log('Datos a enviar:', formData); // Debug log
      
      const url = editingCotizacion 
        ? `/api/cotizaciones-canalizacion/${editingCotizacion._id}`
        : '/api/cotizaciones-canalizacion';
      
      const method = editingCotizacion ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error del servidor:', errorData);
        alert(`Error al guardar cotización: ${response.status} - ${errorData}`);
        return;
      }

      setShowModal(false);
      fetchCotizaciones();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al guardar cotización: ${errorMessage}`);
      console.error('Error completo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta cotización?')) return;
    
    try {
      const response = await fetch(`/api/cotizaciones-canalizacion/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        alert('Error al eliminar la cotización');
        return;
      }

      fetchCotizaciones();
    } catch (error) {
      alert('Error al eliminar la cotización');
      console.error('Error:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (!value) {
      setFilteredCotizaciones(cotizaciones);
    } else {
      const lower = value.toLowerCase();
      const filtered = cotizaciones.filter(cotizacion => {
        const clienteStr = typeof cotizacion.cliente === 'string' 
          ? cotizacion.cliente 
          : cotizacion.cliente.nombreEmpresa;
        
        return clienteStr.toLowerCase().includes(lower) ||
               cotizacion.numeroPresupuesto.toLowerCase().includes(lower) ||
               cotizacion.estado.toLowerCase().includes(lower);
      });
      setFilteredCotizaciones(filtered);
    }
    setCurrentPage(1);
  };

  const getEstadoBadge = (estado: string) => {
    const variants: { [key: string]: string } = {
      'Borrador': 'secondary',
      'Enviada': 'info',
      'Aceptada': 'success',
      'Rechazada': 'danger',
      'Vencida': 'warning'
    };
    return <Badge bg={variants[estado] || 'secondary'}>{estado}</Badge>;
  };

  const columns = [
    { key: 'numeroPresupuesto', label: 'No. Presupuesto' },
    { 
      key: 'cliente', 
      label: 'Cliente',
      render: (cotizacion: CotizacionCanalizacion) => 
        typeof cotizacion.cliente === 'string' 
          ? cotizacion.cliente 
          : cotizacion.cliente.nombreEmpresa
    },
    { 
      key: 'total', 
      label: 'Total',
      render: (cotizacion: CotizacionCanalizacion) => `$${cotizacion.total.toFixed(2)}`
    },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (cotizacion: CotizacionCanalizacion) => getEstadoBadge(cotizacion.estado)
    },
    {
      key: 'fechaCreacion',
      label: 'Fecha',
      render: (cotizacion: CotizacionCanalizacion) => new Date(cotizacion.fechaCreacion).toLocaleDateString()
    }
  ];

  // Paginación
  const totalPages = Math.ceil(filteredCotizaciones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredCotizaciones.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container-fluid mt-4 px-1 px-sm-3">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch gap-2 mb-3">
        <SearchBar 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por cliente, número o estado..." 
          className="flex-grow-1"
        />
        <Button variant="success" onClick={handleNew}>
          Nueva Cotización
        </Button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando cotizaciones...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="table-responsive" style={{ minHeight: `calc(100vh - 270px)`, maxHeight: `calc(100vh - 270px)`, overflowY: "auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
            <DataTable
              data={currentItems}
              columns={columns}
              actions={(cotizacion) => (
                <div className="d-flex flex-column flex-sm-row align-items-stretch gap-1">
                  <Button
                    variant="warning"
                    size="sm"
                    className="w-100 w-sm-auto"
                    onClick={() => handleEdit(cotizacion)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-100 w-sm-auto"
                    onClick={() => handleDelete(cotizacion._id!)}
                  >
                    Eliminar
                  </Button>
                </div>
              )}
              className="small"
              style={{ marginBottom: 0 }}
            />
          </div>

          <div className="d-flex justify-content-center my-3">
            <PaginationCompact
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {/* Modal de formulario */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-light border-bottom">
          <Modal.Title>
            {editingCotizacion ? 'Editar' : 'Nueva'} Cotización de Canalización
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">
          <Form>
            {/* Primera fila: Cliente y Número de Presupuesto */}
            <div className="row">
              <div className="col-md-8">
                <Form.Group className="mb-2">
                  <Form.Label>Cliente</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      value={typeof formData.cliente === 'string' ? formData.cliente : formData.cliente?.nombreEmpresa || ''}
                      onChange={(e) => handleClienteSearch(e.target.value)}
                      placeholder="Buscar cliente..."
                      autoComplete="off"
                    />
                    {showClienteSuggestions && clienteSuggestions.length > 0 && (
                      <div className="position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-sm" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                        {clienteSuggestions.map(cliente => (
                          <div
                            key={cliente._id}
                            className="p-2 border-bottom cursor-pointer hover-bg-light"
                            onClick={() => selectCliente(cliente)}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <strong>{cliente.nombreEmpresa}</strong><br />
                            <small className="text-muted">{cliente.direccion}</small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-2">
                  <Form.Label>No. Presupuesto</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.numeroPresupuesto}
                    onChange={(e) => setFormData({ ...formData, numeroPresupuesto: e.target.value })}
                    readOnly={!editingCotizacion}
                  />
                </Form.Group>
              </div>
            </div>

            {/* Segunda fila: Fecha, Vigencia, Utilidad y Estado */}
            <div className="row">
              <div className="col-md-3">
                <Form.Group className="mb-2">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.fecha instanceof Date ? formData.fecha.toISOString().split('T')[0] : (formData.fecha || '')}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group className="mb-2">
                  <Form.Label>Vigencia</Form.Label>
                  <Form.Control
                    type="date"
                    value={
                      formData.vigencia instanceof Date
                        ? formData.vigencia.toISOString().split('T')[0]
                        : (formData.vigencia || '')
                    }
                    onChange={(e) => setFormData({ ...formData, vigencia: e.target.value })}
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group className="mb-2">
                  <Form.Label>Utilidad (%)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.utilidad}
                    onChange={(e) => updateUtilidad(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.1"
                  />
                </Form.Group>
              </div>
              <div className="col-md-3">
                <Form.Group className="mb-2">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as CotizacionCanalizacion['estado'] })}
                  >
                    <option value="Borrador">Borrador</option>
                    <option value="Enviada">Enviada</option>
                    <option value="Aceptada">Aceptada</option>
                    <option value="Rechazada">Rechazada</option>
                    <option value="Vencida">Vencida</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            {/* Tercera fila: Comentarios */}
            <div className="row">
              <div className="col-md-12">
                <Form.Group className="mb-3">
                  <Form.Label>Comentarios</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.comentarios}
                    onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                    placeholder="Comentarios adicionales sobre la cotización..."
                  />
                </Form.Group>
              </div>
            </div>

            {/* Tabla de productos */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-primary mb-0">
                  <i className="fas fa-shopping-cart me-2"></i>
                  Productos en la Cotización
                </h5>
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={addNewRow}
                  disabled={isEditingItem}
                >
                  <i className="fas fa-plus me-1"></i>
                  Agregar Producto
                </Button>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '5%' }}>#</th>
                      <th style={{ width: '35%' }}>Descripción</th>
                      <th style={{ width: '10%' }}>Cantidad</th>
                      <th style={{ width: '15%' }}>Precio Unitario</th>
                      <th style={{ width: '15%' }}>Importe</th>
                      <th style={{ width: '20%' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items && formData.items.map((item, index) => (
                      <ProductRow
                        key={index}
                        item={item}
                        index={index}
                        isEditing={isEditingItem && editingItemIndex === index}
                        materiales={materiales}
                        onUpdate={updateItem}
                        onDelete={removeItem}
                        onEdit={editItem}
                        onCancelEdit={cancelEdit}
                        disabled={isEditingItem && editingItemIndex !== index}
                      />
                    ))}
                    {/* Fila para nuevo producto si está en modo agregar */}
                    {isEditingItem && editingItemIndex === -1 && (
                      <ProductRow
                        item={currentItem}
                        index={-1}
                        isEditing={true}
                        materiales={materiales}
                        onUpdate={updateCurrentItem}
                        onDelete={() => {}}
                        onEdit={() => {}}
                        onCancelEdit={cancelEdit}
                        disabled={false}
                        isNew={true}
                        onSave={saveNewItem}
                      />
                    )}
                  </tbody>
                </table>
              </div>
              {(!formData.items || formData.items.length === 0) && !isEditingItem && (
                <div className="text-center py-4 text-muted">
                  <i className="fas fa-box-open fa-3x mb-3 text-secondary"></i>
                  <p className="mb-0">No hay productos agregados.</p>
                  <p className="small">Haz clic en "Agregar Producto" para comenzar.</p>
                </div>
              )}
            </div>

            {/* Totales */}
            <div className="row">
              <div className="col-md-12 d-flex justify-content-end">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0">
                        <i className="fas fa-calculator me-2"></i>
                        Resumen de Totales
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between py-2 border-bottom">
                        <span>Subtotal:</span>
                        <span className="fw-bold">${(formData.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="d-flex justify-content-between py-2 border-bottom">
                        <span>Utilidad ({formData.utilidad}%):</span>
                        <span className="text-success fw-bold">+${(((formData.subtotal || 0) * (formData.utilidad || 0)) / 100).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="d-flex justify-content-between py-3 bg-light rounded mt-2">
                        <span className="fw-bold text-primary">Total:</span>
                        <span className="fw-bold text-primary fs-5">${(formData.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={isEditingItem}
          >
            {editingCotizacion ? 'Actualizar' : 'Guardar'} Cotización
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CotizacionCanalizacionList;
