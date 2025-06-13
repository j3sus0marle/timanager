import express, { Request, Response } from "express";
import { InventoryExteriorMovement } from "../models/InventoryExteriorMovement";
import { InventoryExteriorItem } from "../models/InventoryExteriorItem";
import { authMiddleware } from "./auth";

const router = express.Router();

// Crear un movimiento de inventario exterior
router.post("/", authMiddleware, (req: Request, res: Response) => {
  const { itemId, tipo, cantidad, fecha, comentario } = req.body;
  const usuario = (req as any).user?.username || "";
  InventoryExteriorItem.findById(itemId)
    .then((item) => {
      if (!item) return res.status(404).json({ error: "Item no encontrado" });
      InventoryExteriorMovement.create({ itemId, tipo, cantidad, fecha, comentario, usuario })
        .then((movimiento) => res.status(201).json(movimiento))
        .catch(() => res.status(500).json({ error: "Error al registrar movimiento" }));
    })
    .catch(() => res.status(500).json({ error: "Error al registrar movimiento" }));
});

// Obtener movimientos por intervalo de fechas y/o por itemId
router.get("/", (req: Request, res: Response) => {
  const { desde, hasta, itemId } = req.query;
  const filtro: any = {};
  if (itemId) filtro.itemId = itemId;
  if (desde || hasta) {
    filtro.fecha = {};
    if (desde) filtro.fecha.$gte = new Date(desde as string);
    if (hasta) filtro.fecha.$lte = new Date(hasta as string);
  }
  InventoryExteriorMovement.find(filtro).populate("itemId")
    .then((movimientos) => res.json(movimientos))
    .catch(() => res.status(500).json({ error: "Error al obtener movimientos" }));
});

export default router;
