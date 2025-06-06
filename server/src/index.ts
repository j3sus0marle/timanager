import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import itemRoutes from "./routes/itemRoutes";
import vendedoresRoutes from './routes/vendedores'
import clienteRoutes from './routes/clientes';
import inventoryRoutes from "./routes/inventoryRoutes";
import inventoryMovementsRoutes from "./routes/inventoryMovementsRoutes";

dotenv.config();
const app: Application = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || "")
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

app.use("/api/items", itemRoutes);
app.use('/api/vendedores', vendedoresRoutes);
app.use('/api/clientes', clienteRoutes);
app.use("/api/inventario", inventoryRoutes);
app.use("/api/inventory-movements", inventoryMovementsRoutes);

const PORT = process.env.PORT || 6051;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
