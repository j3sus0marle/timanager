# Módulo de Órdenes de Compra - Frontend

## Descripción

El módulo de Órdenes de Compra permite crear y gestionar órdenes de compra con un formulario inteligente que incluye búsqueda automática de proveedores y razones sociales.

## Ubicación en el Sistema

- **Menú:** Proyectos > Órdenes de Compra
- **Ruta:** `/ordenes-compra`

## Funcionalidades Implementadas

### 1. Lista de Órdenes de Compra
- **Archivo:** `src/components/ordenesCompra/OrdenCompraList.tsx`
- Tabla con paginación
- Búsqueda por número de orden, proveedor o razón social
- Botones de acción (Editar, Eliminar)
- Botón "Nueva Orden" para crear

### 2. Formulario de Orden de Compra (Modal)
- **Archivo:** `src/components/ordenesCompra/OrdenCompraForm.tsx`

#### Características del Formulario:

**Diseño:**
- Modal de tamaño XL (extra large) para mayor espacio
- Header con título dinámico (Nueva/Editar)
- Body con scroll automático si el contenido es muy alto
- Footer con botones de acción

**Campos Básicos:**
- Número de Orden (requerido)
- Fecha (por defecto fecha actual)

**Búsqueda de Proveedor:**
- Campo de búsqueda con autocompletado
- Muestra sugerencias en tiempo real (máximo 5)
- Lista con scroll si hay muchas sugerencias
- Selección con click o Enter
- Alert verde con información completa del proveedor seleccionado
- Muestra contactos como badges azules
- Validación obligatoria

**Búsqueda de Razón Social:**
- Campo de búsqueda con autocompletado
- Busca por nombre o RFC
- Muestra sugerencias en tiempo real (máximo 5)
- Lista con scroll si hay muchas sugerencias
- Selección con click o Enter
- Alert verde con información completa de la razón social seleccionada
- **Direcciones de Envío**: Se muestran automáticamente todas las direcciones disponibles
- Validación obligatoria

**Visualización de Direcciones de Envío:**
- Se muestran automáticamente al seleccionar una razón social
- Layout en tarjetas responsive (hasta 3 columnas)
- Información completa por dirección: nombre, dirección, teléfono, contacto
- Fondo azul claro para diferenciación visual
- Iconos Font Awesome para mejor UX
- Solo aparece si la razón social tiene direcciones registradas

**Carga de Archivo PDF:**
- Selector de archivos que acepta solo PDF
- Validación de tipo de archivo
- Alert azul con información del archivo seleccionado
- Límite de tamaño: 10MB

**Secciones Visuales:**
- Cada sección (Proveedor, Razón Social, PDF) tiene fondo gris claro
- Bordes redondeados y separación clara
- Títulos en azul para cada sección

## Componentes Utilizados

### Desde Bootstrap:
- `Card` - Para estructura de secciones
- `Form` - Para campos de entrada
- `Button` - Para acciones
- `Alert` - Para mostrar información seleccionada
- `ListGroup` - Para sugerencias de búsqueda
- `Badge` - Para mostrar contactos

### Componentes Comunes:
- `SearchBar` - Barra de búsqueda reutilizable
- `DataTable` - Tabla de datos con acciones
- `PaginationCompact` - Paginación compacta

## Estados del Formulario

El formulario maneja los siguientes estados:

```typescript
// Datos básicos
const [numeroOrden, setNumeroOrden] = useState("");
const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

// Proveedor
const [proveedorBusqueda, setProveedorBusqueda] = useState("");
const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
const [proveedoresSugerencias, setProveedoresSugerencias] = useState<Proveedor[]>([]);

// Razón Social
const [razonSocialBusqueda, setRazonSocialBusqueda] = useState("");
const [razonSocialSeleccionada, setRazonSocialSeleccionada] = useState<RazonSocial | null>(null);
const [razonesSocialesSugerencias, setRazonesSocialesSugerencias] = useState<RazonSocial[]>([]);

// Archivo PDF
const [archivoPdf, setArchivoPdf] = useState<File | null>(null);
```

## Flujo de Trabajo

### Para el Usuario:

1. **Acceder al módulo:** Menú Proyectos > Órdenes de Compra
2. **Crear nueva orden:** Click en "Nueva Orden de Compra" (botón verde)
3. **Modal se abre:** Formulario en ventana modal grande
4. **Llenar datos básicos:** Número de orden y fecha
5. **Seleccionar proveedor:** 
   - Escribir nombre del proveedor en la sección gris
   - Ver sugerencias en lista desplegable
   - Seleccionar de las sugerencias o presionar Enter
   - Verificar que aparezca el alert verde con todos los datos
6. **Seleccionar razón social:**
   - Escribir nombre o RFC en la sección gris
   - Ver sugerencias en lista desplegable
   - Seleccionar de las sugerencias o presionar Enter
   - Verificar que aparezca el alert verde con todos los datos
7. **Cargar PDF:** Seleccionar archivo PDF de la orden (opcional)
8. **Guardar:** Click en "Guardar Orden" en el footer del modal
9. **Cerrar:** Click en "Cancelar" o en la X del modal para cerrar

### Validaciones:
- Número de orden es requerido
- Debe seleccionarse un proveedor
- Debe seleccionarse una razón social
- Solo archivos PDF son permitidos

## Integración con Backend

### APIs utilizadas:
- `GET /api/proveedores/` - Para búsqueda de proveedores
- `GET /api/razones-sociales/` - Para búsqueda de razones sociales
- `POST /api/ordenes-compra/` - Para crear órdenes (pendiente)
- `PUT /api/ordenes-compra/:id` - Para actualizar órdenes (pendiente)
- `DELETE /api/ordenes-compra/:id` - Para eliminar órdenes (pendiente)

## Próximos Pasos

### Funcionalidades Pendientes:
1. **Conectar con API del backend** para CRUD completo
2. **Implementar carga de archivos PDF** al servidor
3. **Agregar visualización de PDF** cargado
4. **Implementar edición** de órdenes existentes
5. **Agregar filtros avanzados** en la lista
6. **Exportar datos** a Excel/PDF
7. **Historial de cambios** en las órdenes

### Mejoras de UX:
1. **Loading states** durante búsquedas
2. **Mensajes de error** más específicos
3. **Confirmaciones** antes de eliminar
4. **Shortcuts de teclado** para navegación rápida

## Archivos del Módulo

```
src/
├── components/
│   └── ordenesCompra/
│       ├── OrdenCompraList.tsx     # Lista principal
│       └── OrdenCompraForm.tsx     # Formulario de creación/edición
├── pages/
│   └── OrdenesCompra.tsx           # Página principal
└── types.d.ts                      # Tipos TypeScript (OrdenCompra)
```

## Estilos y Diseño

El módulo utiliza Bootstrap para el diseño y sigue los mismos patrones visuales que el resto de la aplicación:
- Cards para organizar secciones
- Alertas para mostrar información seleccionada
- Badges para información adicional
- Colores consistentes con el tema de la aplicación
