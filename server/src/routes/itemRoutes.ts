import { Router, Request, Response } from "express";
import { Item, IItem } from "../models/Item";

const router: Router = Router();

// Obtener todos los items
router.get("/", async (_req: Request, res: Response) => {
  const items = await Item.find();
  res.json(items);
});

// Crear un nuevo item
router.post("/", async (req: Request, res: Response) => {
  const nuevoItem: IItem = new Item(req.body);
  await nuevoItem.save();
  res.json(nuevoItem);
});

// Actualizar un item existente
router.put("/:id", async (req: Request, res: Response) => {
  const itemActualizado = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(itemActualizado);
});

// Eliminar un item
router.delete("/:id", async (req: Request, res: Response) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Item eliminado" });
});

export default router;
