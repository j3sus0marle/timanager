import mongoose, { Schema, Document } from 'mongoose';

export interface IGuia extends Document {
  numeroGuia: string;
  proveedor: string;
  paqueteria: string;
  fechaPedido: Date;
  fechaLlegada: Date;
  proyectos: string[];
  estado: 'entregado' | 'no entregado' | 'en transito' | 'atrasado';
  comentarios?: string; // Nuevo campo
}

const GuiaSchema: Schema = new Schema({
  numeroGuia: { type: String,  },
  proveedor: { type: String,  },
  paqueteria: { type: String,  },
  fechaPedido: { type: Date,  },
  fechaLlegada: { type: Date,  },
  proyectos: { type: [String], default: [] },
  estado: { type: String, enum: ['entregado', 'no entregado', 'en transito', 'atrasado'],  },
  comentarios: { type: String, default: '' }, // Nuevo campo
});

export default mongoose.model<IGuia>('Guia', GuiaSchema);
