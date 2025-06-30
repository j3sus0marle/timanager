import { Request, Response } from 'express';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import OrdenCompra from '../models/OrdenCompra';
import Proveedor from '../models/Proveedor';
import RazonSocial from '../models/RazonSocial';
import Vendedor from '../models/Vendedor';

const execFileAsync = promisify(execFile);

export const getOrdenesCompra = async (req: Request, res: Response) => {
  try {
    const ordenesCompra = await OrdenCompra.find()
      .populate('proveedor', 'empresa')
      .populate('razonSocial', 'nombre rfc')
      .populate('vendedor', 'nombre correo telefono')
      .sort({ fecha: -1 });
    res.json(ordenesCompra);
  } catch (err) {
    console.error('Error al obtener órdenes de compra:', err);
    res.status(500).json({ error: 'Error al obtener órdenes de compra' });
  }
};

export const getOrdenCompraById = async (req: Request, res: Response) => {
  try {
    const ordenCompra = await OrdenCompra.findById(req.params.id)
      .populate('proveedor')
      .populate('razonSocial')
      .populate('vendedor');
    if (!ordenCompra) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' });
    }
    res.json(ordenCompra);
  } catch (err) {
    console.error('Error al obtener orden de compra:', err);
    res.status(500).json({ error: 'Error al obtener orden de compra' });
  }
};

export const createOrdenCompra = async (req: Request, res: Response) => {
  try {
    const { numeroOrden, fecha, proveedor, razonSocial, vendedor, datosOrden } = req.body;
    
    // Validar que el proveedor existe
    const proveedorExists = await Proveedor.findById(proveedor);
    if (!proveedorExists) {
      return res.status(400).json({ error: 'El proveedor especificado no existe' });
    }
    
    // Validar que la razón social existe
    const razonSocialExists = await RazonSocial.findById(razonSocial);
    if (!razonSocialExists) {
      return res.status(400).json({ error: 'La razón social especificada no existe' });
    }

    // Validar vendedor si se proporciona
    if (vendedor) {
      const vendedorExists = await Vendedor.findById(vendedor);
      if (!vendedorExists) {
        return res.status(400).json({ error: 'El vendedor especificado no existe' });
      }
    }
    
    const ordenCompra = new OrdenCompra({
      numeroOrden,
      fecha: fecha ? new Date(fecha) : new Date(),
      proveedor,
      razonSocial,
      vendedor: vendedor || undefined,
      datosOrden
    });
    
    await ordenCompra.save();
    
    // Devolver la orden con los datos poblados
    const ordenCreada = await OrdenCompra.findById(ordenCompra._id)
      .populate('proveedor', 'empresa')
      .populate('razonSocial', 'nombre rfc')
      .populate('vendedor', 'nombre correo telefono');
    
    res.status(201).json(ordenCreada);
  } catch (err: any) {
    console.error('Error al crear orden de compra:', err);
    if (err.code === 11000) {
      res.status(400).json({ error: 'El número de orden ya existe' });
    } else {
      res.status(400).json({ error: 'Error al crear orden de compra' });
    }
  }
};

export const updateOrdenCompra = async (req: Request, res: Response) => {
  try {
    const { numeroOrden, fecha, proveedor, razonSocial, vendedor, datosOrden } = req.body;
    
    // Si se cambia el proveedor, validar que existe
    if (proveedor) {
      const proveedorExists = await Proveedor.findById(proveedor);
      if (!proveedorExists) {
        return res.status(400).json({ error: 'El proveedor especificado no existe' });
      }
    }
    
    // Si se cambia la razón social, validar que existe
    if (razonSocial) {
      const razonSocialExists = await RazonSocial.findById(razonSocial);
      if (!razonSocialExists) {
        return res.status(400).json({ error: 'La razón social especificada no existe' });
      }
    }

    // Si se cambia el vendedor, validar que existe
    if (vendedor) {
      const vendedorExists = await Vendedor.findById(vendedor);
      if (!vendedorExists) {
        return res.status(400).json({ error: 'El vendedor especificado no existe' });
      }
    }
    
    const updateData: any = {};
    if (numeroOrden) updateData.numeroOrden = numeroOrden;
    if (fecha) updateData.fecha = new Date(fecha);
    if (proveedor) updateData.proveedor = proveedor;
    if (razonSocial) updateData.razonSocial = razonSocial;
    if (vendedor !== undefined) updateData.vendedor = vendedor || null;
    if (datosOrden) updateData.datosOrden = datosOrden;
    
    const ordenCompra = await OrdenCompra.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('proveedor', 'empresa')
      .populate('razonSocial', 'nombre rfc')
      .populate('vendedor', 'nombre correo telefono');
      
    if (!ordenCompra) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' });
    }
    res.json(ordenCompra);
  } catch (err: any) {
    console.error('Error al actualizar orden de compra:', err);
    if (err.code === 11000) {
      res.status(400).json({ error: 'El número de orden ya existe' });
    } else {
      res.status(400).json({ error: 'Error al actualizar orden de compra' });
    }
  }
};

export const deleteOrdenCompra = async (req: Request, res: Response) => {
  try {
    const ordenCompra = await OrdenCompra.findByIdAndDelete(req.params.id);
    if (!ordenCompra) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' });
    }
    res.json({ message: 'Orden de compra eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar orden de compra:', err);
    res.status(400).json({ error: 'Error al eliminar orden de compra' });
  }
};

// Función adicional para buscar órdenes por proveedor
export const getOrdenesByProveedor = async (req: Request, res: Response) => {
  try {
    const { proveedorId } = req.params;
    const ordenesCompra = await OrdenCompra.find({ proveedor: proveedorId })
      .populate('proveedor', 'empresa')
      .populate('razonSocial', 'nombre rfc')
      .sort({ fecha: -1 });
    res.json(ordenesCompra);
  } catch (err) {
    console.error('Error al obtener órdenes por proveedor:', err);
    res.status(500).json({ error: 'Error al obtener órdenes por proveedor' });
  }
};

// Función adicional para buscar órdenes por razón social
export const getOrdenesByRazonSocial = async (req: Request, res: Response) => {
  try {
    const { razonSocialId } = req.params;
    const ordenesCompra = await OrdenCompra.find({ razonSocial: razonSocialId })
      .populate('proveedor', 'empresa')
      .populate('razonSocial', 'nombre rfc')
      .sort({ fecha: -1 });
    res.json(ordenesCompra);
  } catch (err) {
    console.error('Error al obtener órdenes por razón social:', err);
    res.status(500).json({ error: 'Error al obtener órdenes por razón social' });
  }
};

// Función para buscar órdenes por rango de fechas
export const getOrdenesByDateRange = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    const filtro: any = {};
    if (fechaInicio && fechaFin) {
      filtro.fecha = {
        $gte: new Date(fechaInicio as string),
        $lte: new Date(fechaFin as string)
      };
    }
    
    const ordenesCompra = await OrdenCompra.find(filtro)
      .populate('proveedor', 'empresa')
      .populate('razonSocial', 'nombre rfc')
      .sort({ fecha: -1 });
    res.json(ordenesCompra);
  } catch (err) {
    console.error('Error al obtener órdenes por rango de fechas:', err);
    res.status(500).json({ error: 'Error al obtener órdenes por rango de fechas' });
  }
};

export const procesarPdf = async (req: Request, res: Response) => {
  try {
    // Verificar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo PDF' });
    }

    // Obtener el proveedor desde el body
    const { proveedor } = req.body;
    if (!proveedor) {
      return res.status(400).json({ error: 'Debe especificar el proveedor' });
    }

    const rutaArchivo = req.file.path;
    
    try {
      // Determinar qué script usar según el proveedor
      const scriptPath = getScriptPath(proveedor);
      
      if (!scriptPath) {
        return res.status(400).json({ 
          error: `No hay script de procesamiento disponible para el proveedor: ${proveedor}` 
        });
      }

      // Ejecutar el script Python
      console.log(`Ejecutando script: ${scriptPath} con archivo: ${rutaArchivo}`);
      
      const { stdout, stderr } = await execFileAsync('python', [scriptPath, rutaArchivo], {
        timeout: 30000 // 30 segundos de timeout
      });

      if (stderr) {
        console.warn('Warning del script Python:', stderr);
      }

      // Parsear el resultado JSON
      let datosExtraidos;
      try {
        datosExtraidos = JSON.parse(stdout);
      } catch (parseError) {
        console.error('Error al parsear JSON del script:', parseError);
        console.error('Salida del script:', stdout);
        return res.status(500).json({ 
          error: 'Error al procesar la respuesta del script de extracción' 
        });
      }

      // Retornar los datos extraídos
      res.json({
        success: true,
        proveedor: proveedor,
        archivo: req.file.originalname,
        datosExtraidos: datosExtraidos,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error al ejecutar script:', error);
      res.status(500).json({ 
        error: 'Error al procesar el archivo PDF',
        detalles: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      // Limpiar archivo temporal
      try {
        fs.unlinkSync(rutaArchivo);
        console.log(`Archivo temporal eliminado: ${rutaArchivo}`);
      } catch (unlinkError) {
        console.warn('No se pudo eliminar archivo temporal:', unlinkError);
      }
    }

  } catch (error) {
    console.error('Error general en procesarPdf:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Determina qué script usar según el proveedor
 */
function getScriptPath(proveedor: string): string | null {
  const scriptsDir = path.join(__dirname, '..', '..', 'scripts');
  
  // Normalizar nombre del proveedor para comparación
  const proveedorNormalizado = proveedor.toLowerCase().trim();
  
  // Mapeo de proveedores a scripts
  const scriptMap: { [key: string]: string } = {
    'syscom': 'extraer_datos_syscom.py',
    'cti': 'extraer_datos_cti.py',
    'nextiraone': 'extraer_datos_nextiraone.py',
    // Agregar más proveedores aquí según sea necesario
  };

  // Buscar coincidencia exacta primero
  if (scriptMap[proveedorNormalizado]) {
    const scriptPath = path.join(scriptsDir, scriptMap[proveedorNormalizado]);
    if (fs.existsSync(scriptPath)) {
      return scriptPath;
    }
  }

  // Buscar coincidencia parcial
  for (const [key, scriptName] of Object.entries(scriptMap)) {
    if (proveedorNormalizado.includes(key) || key.includes(proveedorNormalizado)) {
      const scriptPath = path.join(scriptsDir, scriptName);
      if (fs.existsSync(scriptPath)) {
        return scriptPath;
      }
    }
  }

  console.warn(`No se encontró script para el proveedor: ${proveedor}`);
  return null;
}
