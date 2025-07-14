import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterialElectrico extends Document {
  tipo: string;
  material: string;
  medida: string;
  unidad: 'PZA' | 'MTS';
  proveedor: string;
  precio: number;
  fechaActualizacion: Date;
}

const MaterialElectricoSchema = new Schema<IMaterialElectrico>({
  tipo: { 
    type: String, 
    required: true,
    trim: true 
  },
  material: { 
    type: String, 
    required: true,
    trim: true 
  },
  medida: { 
    type: String, 
    required: true,
    trim: true 
  },
  unidad: { 
    type: String, 
    required: true,
    enum: ['PZA', 'MTS'],
    default: 'PZA'
  },
  proveedor: { 
    type: String, 
    required: true,
    trim: true 
  },
  precio: { 
    type: Number, 
    required: true,
    min: 0 
  },
  fechaActualizacion: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // Esto añade createdAt y updatedAt automáticamente
});

// Middleware para actualizar fechaActualizacion en cada update
MaterialElectricoSchema.pre('findOneAndUpdate', function() {
  this.set({ fechaActualizacion: new Date() });
});

MaterialElectricoSchema.pre('updateOne', function() {
  this.set({ fechaActualizacion: new Date() });
});

export default mongoose.model<IMaterialElectrico>('MaterialElectrico', MaterialElectricoSchema);
