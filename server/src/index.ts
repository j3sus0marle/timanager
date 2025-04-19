import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import itemRoutes from "./routes/itemRoutes";

dotenv.config();
const app: Application = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || "")
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

app.use("/api/items", itemRoutes);

const PORT = process.env.PORT || 6051;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
