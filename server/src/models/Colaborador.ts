import mongoose, { Schema, Document } from 'mongoose';
import { getRazonSocialById } from '../controllers/razonSocialController';

export interface IColaborador extends Document {
  numeroEmpleado: string;
  nombre: string;
  nss: string; // Número de Seguro Social
  puesto: string;
  fotografia?: string; // URL o path a la imagen
  fechaAltaIMSS: Date;
  razonSocialId: mongoose.Types.ObjectId;
  activo: boolean;
}

const ColaboradorSchema: Schema = new Schema({
  numeroEmpleado: { 
    type: String, 
    unique: true 
  },
  nombre: { 
    type: String, 
    required: true 
  },
  nss: { 
    type: String, 
    required: true,
    unique: true
  },
  puesto: { 
    type: String, 
    required: true 
  },
  fotografia: { 
    type: String 
  },
  fechaAltaIMSS: { 
    type: Date, 
    required: true 
  },
  razonSocialId: { 
    type: Schema.Types.ObjectId, 
    ref: 'RazonSocial',
    required: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Añade createdAt y updatedAt
});

// Middleware para generar número de empleado automáticamente
ColaboradorSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Colaborador').countDocuments();
    this.numeroEmpleado = `EMP${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model<IColaborador>('Colaborador', ColaboradorSchema);
