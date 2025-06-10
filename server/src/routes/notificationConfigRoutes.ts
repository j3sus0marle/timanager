import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();
const dataPath = path.join(__dirname, "../../data/emailNotificacion.dat");

// Estructura por defecto
const defaultConfig = {
  emails: [], // array de correos
  notifyOneDayBefore: true,
  notifyOnDeliveryDay: true,
  notifyWhenLate: true,
  lateFrequencyDays: 1
};

// GET config
router.get("/", (req, res) => {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify(defaultConfig, null, 2));
    }
    const data = fs.readFileSync(dataPath, "utf-8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Error leyendo configuración" });
  }
});

// POST/PUT config
router.post("/", (req, res) => {
  try {
    const config = req.body;
    // Asegura que la propiedad se llame lateFrequencyDays
    if (typeof config.lateFrequencyHours !== 'undefined') {
      config.lateFrequencyDays = config.lateFrequencyHours;
      delete config.lateFrequencyHours;
    }
    fs.writeFileSync(dataPath, JSON.stringify(config, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error guardando configuración" });
  }
});

export default router;
