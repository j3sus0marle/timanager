import mongoose, { Schema, Document } from 'mongoose';

export interface ICotizacionCanalizacion extends Document {
  numeroPresupuesto: string;
  cliente: string;
  fecha: Date;
  vigencia: Date;
  subtotal: number;
  utilidad: number; // Porcentaje de utilidad
  total: number;
  estado: 'Borrador' | 'Enviada' | 'Aceptada' | 'Rechazada' | 'Vencida';
  items: IItemCotizacionCanalizacion[];
  comentarios?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  calcularTotales(): void;
}

export interface IItemCotizacionCanalizacion {
  materialCanalizacion?: string; // Referencia al ID del material (opcional)
  descripcion: string;
  cantidad: number;
  unidad: 'PZA' | 'MTS';
  precioUnitario: number;
  subtotal: number;
}

const ItemCotizacionCanalizacionSchema = new Schema<IItemCotizacionCanalizacion>({
  materialCanalizacion: { 
    type: String, 
    required: false // Ahora es opcional 
  },
  descripcion: { 
    type: String, 
    required: true,
    trim: true 
  },
  cantidad: { 
    type: Number, 
    required: true,
    min: 0 
  },
  unidad: { 
    type: String, 
    required: true,
    enum: ['PZA', 'MTS']
  },
  precioUnitario: { 
    type: Number, 
    required: true,
    min: 0 
  },
  subtotal: { 
    type: Number, 
    required: true,
    min: 0 
  }
});

const CotizacionCanalizacionSchema = new Schema<ICotizacionCanalizacion>({
  numeroPresupuesto: { 
    type: String, 
    required: true,
    unique: true,
    trim: true 
  },
  cliente: { 
    type: String, 
    required: true,
    trim: true 
  },
  fecha: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  vigencia: { 
    type: Date, 
    required: true 
  },
  subtotal: { 
    type: Number, 
    required: true,
    min: 0,
    default: 0 
  },
  utilidad: { 
    type: Number, 
    required: true,
    min: 0,
    default: 0 
  },
  total: { 
    type: Number, 
    required: true,
    min: 0,
    default: 0 
  },
  estado: { 
    type: String, 
    required: true,
    enum: ['Borrador', 'Enviada', 'Aceptada', 'Rechazada', 'Vencida'],
    default: 'Borrador'
  },
  items: [ItemCotizacionCanalizacionSchema],
  comentarios: { 
    type: String,
    trim: true 
  },
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  },
  fechaActualizacion: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Middleware para actualizar fechaActualizacion y recalcular totales
CotizacionCanalizacionSchema.pre('findOneAndUpdate', function() {
  this.set({ fechaActualizacion: new Date() });
});

CotizacionCanalizacionSchema.pre('updateOne', function() {
  this.set({ fechaActualizacion: new Date() });
});

// Método para calcular totales automáticamente
CotizacionCanalizacionSchema.methods.calcularTotales = function() {
  this.subtotal = this.items.reduce((sum: number, item: IItemCotizacionCanalizacion) => {
    return sum + item.subtotal;
  }, 0);
  
  // Aplicar utilidad al subtotal para obtener el total
  this.total = this.subtotal * (1 + this.utilidad / 100);
};

// Middleware para calcular totales antes de guardar
CotizacionCanalizacionSchema.pre('save', function() {
  if (this.items && this.items.length > 0) {
    this.calcularTotales();
  }
});

export default mongoose.model<ICotizacionCanalizacion>('CotizacionCanalizacion', CotizacionCanalizacionSchema);
