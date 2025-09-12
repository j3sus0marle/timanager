import mongoose from 'mongoose';
import { InventoryItem } from '../src/models/InventoryItem';
import { InventoryExteriorItem } from '../src/models/InventoryExteriorItem';
import dotenv from 'dotenv';

dotenv.config();

// Datos de ejemplo
const marcas = [
  'Dell', 'HP', 'Lenovo', 'Cisco', 'Ubiquiti', 'TP-Link', 'D-Link', 
  'Aruba', 'Fortinet', 'APC', 'Tripp Lite', 'Panduit', 'Commscope'
];

const categoriasInterior = [
  'Papelería', 'Herramientas', 'Cables', 'Conectores', 
  'Accesorios de Red', 'Material Eléctrico', 'Consumibles'
];

const categoriasExterior = [
  'Switches', 'Access Points', 'Routers', 'Firewalls', 
  'UPS', 'Servidores', 'Almacenamiento', 'Telefonía IP'
];

const proveedores = [
  'TVC', 'Syscom', 'CT Internacional', 'Ingram Micro', 
  'Tech Data', 'PCH Mayoreo', 'Grupo Dice'
];

const unidades = ['Pieza', 'Metro', 'Caja', 'Rollo', 'Kit', 'Paquete'];

// Generadores de datos
const generarDescripcionInterior = () => {
  const items = [
    'Cable UTP Cat6', 'Conector RJ45', 'Canaleta PVC', 'Patch Cord', 
    'Jack RJ45', 'Organizador de Cables', 'Charola para Rack',
    'Grapa para Cable', 'Cinta de Aislar', 'Terminal Eléctrica',
    'Cinchos de Plástico', 'Etiquetas para Cable', 'Tubería Conduit',
    'Conectores de Fibra', 'Patch Panel', 'PDU para Rack'
  ];
  return items[Math.floor(Math.random() * items.length)];
};

const generarDescripcionExterior = () => {
  const items = [
    'Switch 48 puertos PoE', 'Access Point WiFi 6', 'Router Empresarial',
    'Firewall Next-Gen', 'UPS 3KVA', 'Servidor Torre', 'NAS 8 bahías',
    'Teléfono IP', 'Switch Core', 'Controladora WiFi', 'Gateway VoIP',
    'Storage SAN', 'Rack 42U', 'KVM Switch', 'Load Balancer'
  ];
  return items[Math.floor(Math.random() * items.length)];
};

const generarModelo = (marca: string) => {
  const modelos: { [key: string]: string[] } = {
    'Dell': ['PowerEdge R740', 'OptiPlex 7090', 'Latitude 5520'],
    'HP': ['ProLiant DL380', 'EliteDesk 800', 'ZBook Fury'],
    'Cisco': ['Catalyst 9300', 'ISR 4451-X', 'Meraki MR46'],
    'Ubiquiti': ['UniFi AP AC Pro', 'EdgeRouter 4', 'UniFi Switch 48'],
    'Fortinet': ['FortiGate 100F', 'FortiAP 231F', 'FortiSwitch 424E']
  };
  
  if (marca in modelos) {
    return modelos[marca][Math.floor(Math.random() * modelos[marca].length)];
  }
  
  // Modelo genérico para otras marcas
  return `Modelo-${Math.floor(Math.random() * 1000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
};

const generarNumeroSerie = (marca: string) => {
  const prefijo = marca.substring(0, 3).toUpperCase();
  const numero = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const letra = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${prefijo}${numero}${letra}`;
};

const generarPrecioUnitario = (esExterior: boolean) => {
  if (esExterior) {
    // Precios más altos para inventario exterior (1000 a 50000)
    return Math.floor(Math.random() * 49000) + 1000;
  } else {
    // Precios más bajos para inventario interior (10 a 1000)
    return Math.floor(Math.random() * 990) + 10;
  }
};

async function seedDatabase() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timanager');
    console.log('Conectado a MongoDB');

    // Limpiar colecciones existentes
    await InventoryItem.deleteMany({});
    await InventoryExteriorItem.deleteMany({});
    console.log('Colecciones limpiadas');

    // Generar items para inventario interior
    const inventoryItems = Array(20).fill(null).map(() => {
      const marca = marcas[Math.floor(Math.random() * marcas.length)];
      const numerosSerie = [generarNumeroSerie(marca)]; // Solo un número de serie
      
      return {
        marca,
        modelo: generarModelo(marca),
        descripcion: generarDescripcionInterior(),
        proveedor: proveedores[Math.floor(Math.random() * proveedores.length)],
        unidad: unidades[Math.floor(Math.random() * unidades.length)],
        precioUnitario: generarPrecioUnitario(false),
        cantidad: 1, // Cantidad fija de 1
        numerosSerie,
        categorias: [
          categoriasInterior[Math.floor(Math.random() * categoriasInterior.length)]
        ]
      };
    });

    // Generar items para inventario exterior
    const inventoryExteriorItems = Array(20).fill(null).map(() => {
      const marca = marcas[Math.floor(Math.random() * marcas.length)];
      const numerosSerie = [generarNumeroSerie(marca)]; // Solo un número de serie

      return {
        marca,
        modelo: generarModelo(marca),
        descripcion: generarDescripcionExterior(),
        proveedor: proveedores[Math.floor(Math.random() * proveedores.length)],
        unidad: unidades[Math.floor(Math.random() * unidades.length)],
        precioUnitario: generarPrecioUnitario(true),
        cantidad: 1, // Cantidad fija de 1
        numerosSerie,
        categorias: [
          categoriasExterior[Math.floor(Math.random() * categoriasExterior.length)]
        ]
      };
    });

    // Insertar los datos
    await InventoryItem.insertMany(inventoryItems);
    await InventoryExteriorItem.insertMany(inventoryExteriorItems);

    console.log('Datos de prueba insertados exitosamente:');
    console.log(`- ${inventoryItems.length} items en inventario interior`);
    console.log(`- ${inventoryExteriorItems.length} items en inventario exterior`);

  } catch (error) {
    console.error('Error al sembrar la base de datos:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
seedDatabase();
