import cron from "node-cron";
import { revisarYNotificarGuias } from "./notificacionService";

// Ejecutar cada hora
cron.schedule("0 * * * *", async () => {
  try {
    await revisarYNotificarGuias();
    console.log("[CRON] Notificaciones de guías revisadas y enviadas");
  } catch (err) {
    console.error("[CRON] Error al enviar notificaciones de guías", err);
  }
});
