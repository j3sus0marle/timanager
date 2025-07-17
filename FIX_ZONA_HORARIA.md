# Fix de Zona Horaria y Fecha Editable para Órdenes de Compra

## Problema Identificado
El sistema estaba mostrando fechas incorrectas en las órdenes de compra debido a problemas de zona horaria. Específicamente:
- Al crear una orden nueva, se mostraba un día adelantado (17 cuando debería ser 16)
- Al procesar la orden, la fecha se corregía
- Esto ocurría tanto en desarrollo como en producción
- **Adicionalmente**: Los usuarios no podían editar la fecha de las órdenes durante la edición

## Causa Raíz
JavaScript `new Date()` utiliza la zona horaria del sistema donde se ejecuta el código, sin considerar la zona horaria específica del negocio (Mexicali, Baja California - America/Tijuana).

## Solución Implementada

### 1. Creación de Utilidades de Fecha

#### Backend (`server/src/utils/dateUtils.ts`)
- Clase `DateUtils` con métodos para manejar fechas en zona horaria de Mexicali
- Zona horaria configurada: `America/Tijuana` (UTC-8 en invierno, UTC-7 en verano)
- Métodos principales:
  - `getCurrentDateInMexicali()`: Fecha actual en zona horaria de Mexicali
  - `formatForOrdenCompra()`: Formato dd/mm/yyyy para documentos
  - `parseToMexicaliDate()`: Convierte strings de fecha a zona horaria correcta
  - `formatDateForInput()`: Formato yyyy-mm-dd para inputs HTML

#### Frontend (`inventario-crud/src/utils/dateUtils.ts`)
- Clase similar para el frontend con métodos complementarios
- `formatForBackend()`: Prepara fechas para envío al servidor
- `dateToInputFormat()`: Convierte fechas de MongoDB a formato de input
- `getTodayForInput()`: Fecha actual para inputs HTML

### 2. Actualización de Controladores

#### `ordenCompraController.ts`
Reemplazado `new Date()` por `DateUtils.getCurrentDateInMexicali()` en:
- Creación de órdenes de compra
- Actualización de órdenes existentes
- Generación de números de orden con timestamp
- Formateo de fechas para PDF
- Filtros de búsqueda por rango de fechas

### 3. Actualización de Servicios

#### `pdfGenerator.ts`
- Reemplazado formateo de fecha por `DateUtils.formatForOrdenCompra()`
- Garantiza fechas consistentes en documentos PDF

### 4. Actualización de Frontend

#### `OrdenCompraForm.tsx`
- Inicialización de fecha con zona horaria correcta
- Conversión de fechas de MongoDB al formato correcto para inputs
- Uso de utilidades para resetear formularios
- **Campo de fecha editable** en el formulario principal

#### `ModalResultados.tsx`
- Formateo correcto de fechas antes de envío al backend
- Manejo de fechas existentes y nuevas
- **NUEVO: Campo de fecha editable** en la sección de configuración del modal
- Inicialización automática de la fecha desde los datos existentes o fecha actual
- Validación y formateo correcto para envío al backend

## Archivos Modificados

### Backend
- `server/src/utils/dateUtils.ts` (NUEVO)
- `server/src/controllers/ordenCompraController.ts`
- `server/src/services/pdfGenerator.ts`

### Frontend
- `inventario-crud/src/utils/dateUtils.ts` (NUEVO)
- `inventario-crud/src/components/ordenesCompra/OrdenCompraForm.tsx`
- `inventario-crud/src/components/ordenesCompra/ModalResultados.tsx`

## Resultado Esperado

Después de estos cambios:

1. **Creación de órdenes**: La fecha mostrada será siempre la fecha actual de Mexicali
2. **Procesamiento de PDF**: Las fechas se mantendrán consistentes
3. **Edición de fechas**: Los usuarios pueden modificar la fecha tanto en el formulario principal como en el modal de resultados
4. **Filtros de fecha**: Respetarán el inicio y fin del día en zona horaria local
5. **Documentos PDF**: Mostrarán fechas en formato mexicano (dd/mm/yyyy)
6. **Interfaz de usuario**: Los campos de fecha mostrarán valores coherentes y serán editables en todo momento

## Implementación

Para aplicar estos cambios:

1. Reiniciar el servidor backend
2. Refrescar la aplicación frontend
3. Verificar que las nuevas órdenes muestren la fecha correcta desde el inicio

## Zona Horaria Configurada

- **Zona**: America/Tijuana
- **Región**: Mexicali, Baja California
- **UTC Offset**: 
  - Invierno: UTC-8
  - Verano: UTC-7 (horario de verano del Pacífico)

Esta configuración garantiza que todas las fechas en el sistema reflejen la hora local del negocio, independientemente de donde esté alojado el servidor.
