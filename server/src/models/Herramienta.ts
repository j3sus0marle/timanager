import mongoose, { Schema, Document } from 'mongoose';

export interface IHerramienta extends Document {
  nombre: string;
  marca: string;
  modelo: string;
  valor: number;
  serialNumber: string;
  colaboradorId: mongoose.Types.ObjectId;
  fechaAsignacion: Date;
  activo: boolean;
}

const HerramientaSchema: Schema = new Schema({
  nombre: { 
    type: String, 
    required: true 
  },
  marca: { 
    type: String, 
    required: true 
  },
  modelo: { 
    type: String, 
    required: true 
  },
  valor: { 
    type: Number, 
    required: true 
  },
  serialNumber: { 
    type: String, 
    required: true,
    unique: true
  },
  colaboradorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Colaborador',
    required: true
  },
  fechaAsignacion: { 
    type: Date, 
    default: Date.now 
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IHerramienta>('Herramienta', HerramientaSchema);
