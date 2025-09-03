import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumento extends Document {
  documentoId: number;
  nombre: string;
  url: string;
  fechaSubida: Date;
  fechaVencimiento?: Date;
  colaboradorId: mongoose.Types.ObjectId;
  tipo: string; // 'pdf' | 'image'
}

const DocumentoSchema: Schema = new Schema({
  documentoId: {
    type: Number,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  fechaSubida: {
    type: Date,
    default: Date.now
  },
  fechaVencimiento: {
    type: Date
  },
  colaboradorId: {
    type: Schema.Types.ObjectId,
    ref: 'Colaborador',
    required: true
  },
  tipo: {
    type: String,
    enum: ['pdf', 'image'],
    required: true
  }
}, {
  timestamps: true
});

// Auto-incrementar documentoId
DocumentoSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Documento').countDocuments();
    this.documentoId = count + 1;
  }
  next();
});

export default mongoose.model<IDocumento>('Documento', DocumentoSchema);
