// ...existing code...
import { Router, Request, Response } from "express";
import { InventoryMovement } from "../models/InventoryMovement";
import { InventoryItem } from "../models/InventoryItem";

const router: Router = Router();

// Crear un movimiento de inventario
router.post("/", (req: Request, res: Response) => {
  const { itemId, tipo, cantidad, fecha } = req.body;
  InventoryItem.findById(itemId)
    .then(item => {
      if (!item) return res.status(404).json({ error: "Item no encontrado" });
      InventoryMovement.create({ itemId, tipo, cantidad, fecha })
        .then(movimiento => res.status(201).json(movimiento))
        .catch(() => res.status(500).json({ error: "Error al registrar movimiento" }));
    })
    .catch(() => res.status(500).json({ error: "Error al registrar movimiento" }));
});

// Obtener movimientos por intervalo de fechas y/o por itemId
router.get("/", (req: Request, res: Response) => {
  const { desde, hasta, itemId } = req.query;
  const filtro = {} as any;
  if (itemId) filtro.itemId = itemId;
  if (desde || hasta) {
    filtro.fecha = {};
    if (desde) filtro.fecha.$gte = new Date(desde as string);
    if (hasta) filtro.fecha.$lte = new Date(hasta as string);
  }
  InventoryMovement.find(filtro).populate("itemId")
    .then(movimientos => res.json(movimientos))
    .catch(() => res.status(500).json({ error: "Error al obtener movimientos" }));
});

export default router;
// ...existing code...
