import mongoose, { Document, Schema } from "mongoose";

export interface IInventoryRequest extends Document {
  tipoMovimiento: 'ENTRADA' | 'SALIDA';
  inventarioTipo: 'INTERIOR' | 'EXTERIOR';
  itemId: mongoose.Types.ObjectId;
  cantidad: number;
  solicitanteId: mongoose.Types.ObjectId;
  fechaSolicitud: Date;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  aprobadorId?: mongoose.Types.ObjectId;
  fechaAprobacion?: Date;
  motivoSolicitud: string;
  motivoRechazo?: string;
  numerosSerie?: string[];
}

const InventoryRequestSchema = new Schema({
  tipoMovimiento: {
    type: String,
    enum: ['ENTRADA', 'SALIDA'],
    required: true
  },
  inventarioTipo: {
    type: String,
    enum: ['INTERIOR', 'EXTERIOR'],
    required: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  solicitanteId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Permitir solicitudes sin usuario identificado
  },
  fechaSolicitud: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['PENDIENTE', 'APROBADA', 'RECHAZADA'],
    default: 'PENDIENTE'
  },
  aprobadorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  fechaAprobacion: {
    type: Date
  },
  motivoSolicitud: {
    type: String,
    required: true
  },
  motivoRechazo: {
    type: String
  },
  numerosSerie: [{
    type: String
  }]
});

// Índices para mejorar las consultas
InventoryRequestSchema.index({ estado: 1, fechaSolicitud: -1 });
InventoryRequestSchema.index({ solicitanteId: 1, estado: 1 });

export const InventoryRequest = mongoose.model<IInventoryRequest>('InventoryRequest', InventoryRequestSchema);
