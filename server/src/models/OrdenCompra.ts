import mongoose, { Schema, Document } from 'mongoose';

export interface IOrdenCompra extends Document {
  numeroOrden: string;
  fecha: Date;
  proveedor: mongoose.Types.ObjectId;
  razonSocial: mongoose.Types.ObjectId;
  datosOrden: any; // JSON flexible que puede variar en estructura
}

const OrdenCompraSchema: Schema = new Schema({
  numeroOrden: { 
    type: String, 
    
    unique: true,
    trim: true
  },
  fecha: { 
    type: Date, 
    
    default: Date.now
  },
  proveedor: { 
    type: Schema.Types.ObjectId, 
    ref: 'Proveedor', 
    
  },
  razonSocial: { 
    type: Schema.Types.ObjectId, 
    ref: 'RazonSocial', 
    
  },
  datosOrden: { 
    type: Schema.Types.Mixed, 
    
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento de las consultas
// Nota: numeroOrden ya tiene índice único automático por unique: true
OrdenCompraSchema.index({ fecha: -1 });
OrdenCompraSchema.index({ proveedor: 1 });
OrdenCompraSchema.index({ razonSocial: 1 });

export default mongoose.model<IOrdenCompra>('OrdenCompra', OrdenCompraSchema);
