import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import Cliente from '../src/models/Cliente';
import Proveedor from '../src/models/Proveedor';
import { InventoryItem } from '../src/models/InventoryItem';
import RazonSocial from '../src/models/RazonSocial';
import Vendedor from '../src/models/Vendedor';
import OrdenCompra from '../src/models/OrdenCompra';

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/timanager')
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error conectando a MongoDB:', err));

// Datos de prueba
const seedData = async () => {
  try {
    // Limpiar datos existentes
    await Promise.all([
      User.deleteMany({}),
      Cliente.deleteMany({}),
      Proveedor.deleteMany({}),
      InventoryItem.deleteMany({}),
      RazonSocial.deleteMany({}),
      Vendedor.deleteMany({}),
      OrdenCompra.deleteMany({})
    ]);

    console.log('Base de datos limpia');

    // Crear usuario admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      username: 'admin',
      password: hashedPassword
    });

    console.log('Usuario admin creado');

    // Crear vendedores
    const vendedores = await Vendedor.create([
      {
        nombre: 'Juan Pérez',
        correo: 'juan@ejemplo.com',
        telefono: '6641234567'
      },
      {
        nombre: 'María García',
        correo: 'maria@ejemplo.com',
        telefono: '6649876543'
      }
    ]);

    console.log('Vendedores creados');

    // Crear razones sociales
    const razonesSociales = await RazonSocial.create([
      {
        nombre: 'Empresa A S.A. de C.V.',
        rfc: 'EMP123456ABC',
        direccion: 'Calle 123, Colonia Centro'
      },
      {
        nombre: 'Corporativo B S.A. de C.V.',
        rfc: 'COR789012XYZ',
        direccion: 'Av. Principal 456, Zona Industrial'
      }
    ]);

    console.log('Razones sociales creadas');

    // Crear proveedores
    const proveedores = await Proveedor.create([
      {
        empresa: 'SYSCOM',
        direccion: 'Calle Syscom 123',
        telefono: '8001234567',
        contactos: [
          {
            nombre: 'Juan Pérez',
            puesto: 'Vendedor',
            correo: 'contacto@syscom.mx',
            telefono: '8001234567'
          }
        ]
      },
      {
        empresa: 'TVC',
        direccion: 'Av TVC 456',
        telefono: '8009876543',
        contactos: [
          {
            nombre: 'María Sánchez',
            puesto: 'Ventas',
            correo: 'ventas@tvc.com',
            telefono: '8009876543'
          }
        ]
      }
    ]);

    console.log('Proveedores creados');

    // Crear clientes
    const clientes = await Cliente.create([
      {
        nombre: 'Cliente Ejemplo 1',
        email: 'cliente1@ejemplo.com',
        telefono: '6642345678',
        direccion: 'Dirección Cliente 1',
        vendedor: vendedores[0]._id
      },
      {
        nombre: 'Cliente Ejemplo 2',
        email: 'cliente2@ejemplo.com',
        telefono: '6643456789',
        direccion: 'Dirección Cliente 2',
        vendedor: vendedores[1]._id
      }
    ]);

    console.log('Clientes creados');

    // Crear items de inventario
    const items = await InventoryItem.create([
      {
        marca: 'CommScope',
        modelo: 'Cat6-UTP-23AWG',
        descripcion: 'Cable UTP Categoría 6 para red',
        proveedor: proveedores[0].empresa,
        unidad: 'METRO',
        precioUnitario: 1200.50,
        cantidad: 100,
        numerosSerie: [],
        categorias: ['Cableado', 'Red']
      },
      {
        marca: 'Cisco',
        modelo: 'CBS350-24P-4G',
        descripcion: 'Switch administrable 24 puertos Gigabit PoE',
        proveedor: proveedores[1].empresa,
        unidad: 'PIEZA',
        precioUnitario: 3500.75,
        cantidad: 10,
        numerosSerie: ['CBS350001', 'CBS350002'],
        categorias: ['Switches', 'Red']
      },
      {
        marca: 'Ubiquiti',
        modelo: 'U6-Pro',
        descripcion: 'Access Point empresarial WiFi 6',
        proveedor: proveedores[0].empresa,
        unidad: 'PIEZA',
        precioUnitario: 2800.00,
        cantidad: 15,
        numerosSerie: ['U6P001', 'U6P002', 'U6P003'],
        categorias: ['WiFi', 'Red']
      }
    ]);

    console.log('Items de inventario creados');

    // Crear órdenes de compra
    const ordenesCompra = await OrdenCompra.create([
      {
        numeroOrden: 'OC-2025-001',
        fecha: new Date(),
        proveedor: proveedores[0]._id,
        razonSocial: razonesSociales[0]._id,
        vendedor: vendedores[0]._id,
        datosOrden: {
          items: [
            {
              item: items[0]._id,
              cantidad: 5,
              precio: items[0].precioUnitario,
              total: items[0].precioUnitario * 5
            }
          ],
          subtotal: items[0].precioUnitario * 5,
          iva: (items[0].precioUnitario * 5) * 0.16,
          total: (items[0].precioUnitario * 5) * 1.16
        }
      },
      {
        numeroOrden: 'OC-2025-002',
        fecha: new Date(),
        proveedor: proveedores[1]._id,
        razonSocial: razonesSociales[1]._id,
        vendedor: vendedores[1]._id,
        datosOrden: {
          items: [
            {
              item: items[1]._id,
              cantidad: 2,
              precio: items[1].precioUnitario,
              total: items[1].precioUnitario * 2
            }
          ],
          subtotal: items[1].precioUnitario * 2,
          iva: (items[1].precioUnitario * 2) * 0.16,
          total: (items[1].precioUnitario * 2) * 1.16
        }
      }
    ]);

    console.log('Órdenes de compra creadas');

    console.log('¡Datos de prueba creados exitosamente!');
    
  } catch (error) {
    console.error('Error creando datos de prueba:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Ejecutar el script
seedData();
