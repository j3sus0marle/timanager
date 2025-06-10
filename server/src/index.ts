import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import itemRoutes from "./routes/itemRoutes";
import vendedoresRoutes from './routes/vendedores'
import inventoryRoutes from "./routes/inventoryRoutes";
import inventoryMovementsRoutes from "./routes/inventoryMovementsRoutes";
import inventoryExteriorRoutes from "./routes/inventoryExteriorRoutes";
import inventoryMovementsExteriorRoutes from "./routes/inventoryMovementsExteriorRoutes";
import clientesRoutes from "./routes/clientes";
import guiasRoutes from "./routes/guias";
import notificationConfigRoutes from "./routes/notificationConfigRoutes";
import { revisarYNotificarGuias } from "./notificacionService";
import "./cronNotificaciones";

dotenv.config();
const app: Application = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || "")
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

app.use("/api/items", itemRoutes);
app.use('/api/vendedores', vendedoresRoutes);
app.use("/api/inventario", inventoryRoutes);
app.use("/api/inventory-movements", inventoryMovementsRoutes);
app.use("/api/inventario-exterior", inventoryExteriorRoutes);
app.use("/api/inventory-movements-exterior", inventoryMovementsExteriorRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/guias", guiasRoutes);
app.use("/api/notification-config", notificationConfigRoutes);

app.post("/api/notificar-guias", async (req, res) => {
  try {
    if (req.headers["x-force-notify-between"] === "1") {
      process.env.FORCE_NOTIFY_BETWEEN = "1";
    } else {
      process.env.FORCE_NOTIFY_BETWEEN = undefined;
    }
    await revisarYNotificarGuias();
    process.env.FORCE_NOTIFY_BETWEEN = undefined;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error enviando notificaciones" });
  }
});

const PORT = process.env.PORT || 6051;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
