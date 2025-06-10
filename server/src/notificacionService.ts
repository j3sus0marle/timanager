import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import Guia from "./models/Guia";
import dayjs from "dayjs";

const configPath = path.join(__dirname, "../data/emailNotificacion.dat");

const transporter = nodemailer.createTransport({
  host: "mail.tiservicesmxli.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER || "soporte@tiservicesmxli.com",
    pass: process.env.SMTP_PASS || "@s0portE", // Poner la contraseña real en variable de entorno
  },
});

function getConfig() {
  if (!fs.existsSync(configPath)) return null;
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

function guiaInfoHtml(guia: any) {
  return `<b>Número de Guía:</b> ${guia.numeroGuia}<br/>
<b>Proveedor:</b> ${guia.proveedor}<br/>
<b>Paquetería:</b> ${guia.paqueteria}<br/>
<b>Fecha Pedido:</b> ${guia.fechaPedido ? new Date(guia.fechaPedido).toLocaleDateString() : ""}<br/>
<b>Fecha Llegada:</b> ${guia.fechaLlegada ? new Date(guia.fechaLlegada).toLocaleDateString() : ""}<br/>
<b>Proyectos:</b> ${guia.proyectos?.join(", ") || ""}<br/>
<b>Estado:</b> ${guia.estado}`;
}

export async function revisarYNotificarGuias() {
  const config = getConfig();
  if (!config || !config.emails || config.emails.length === 0) return;

  const hoy = dayjs();
  const guias = await Guia.find({});
  for (const guia of guias) {
    if (!guia.fechaLlegada) continue;
    const llegada = dayjs(guia.fechaLlegada);
    const diff = llegada.diff(hoy, "day");
    let enviar = false;
    let asunto = "";
    let cuerpo = "";

    if (config.notifyOneDayBefore && diff === 1 && guia.estado === "en transito") {
      enviar = true;
      asunto = `Recordatorio: Paquete por llegar mañana (${guia.numeroGuia})`;
      cuerpo = `El siguiente paquete está programado para llegar mañana:<br/><br/>${guiaInfoHtml(guia)}`;
    }
    if (config.notifyOnDeliveryDay && diff === 0 && guia.estado === "en transito") {
      enviar = true;
      asunto = `Recordatorio: Paquete por llegar hoy (${guia.numeroGuia})`;
      cuerpo = `El siguiente paquete está programado para llegar hoy:<br/><br/>${guiaInfoHtml(guia)}`;
    }

    // Notificar de inmediato si el paquete sale el mismo día que se da de alta
    if (
      config.notifyOnDeliveryDay &&
      guia.fechaPedido &&
      guia.fechaLlegada &&
      dayjs(guia.fechaPedido).isSame(dayjs(guia.fechaLlegada), "day") &&
      guia.estado === "en transito"
    ) {
      enviar = true;
      asunto = `Recordatorio: Paquete sale y llega hoy (${guia.numeroGuia})`;
      cuerpo = `El siguiente paquete sale y llega hoy:<br/><br/>${guiaInfoHtml(guia)}`;
    }

    // Notificar si hoy está entre fechaPedido y fechaLlegada (para botón de prueba)
    if (
      process.env.FORCE_NOTIFY_BETWEEN === "1" &&
      guia.fechaPedido &&
      guia.fechaLlegada &&
      dayjs().isAfter(dayjs(guia.fechaPedido).subtract(1, "day")) &&
      dayjs().isBefore(dayjs(guia.fechaLlegada).add(1, "day"))
    ) {
      enviar = true;
      asunto = `Recordatorio: Paquete en tránsito (${guia.numeroGuia})`;
      cuerpo = `El siguiente paquete está en tránsito (fecha entre pedido y llegada):<br/><br/>${guiaInfoHtml(guia)}`;
    }

    if (config.notifyWhenLate && guia.estado === "atrasado") {
      // Controlar frecuencia: guardar último envío en archivo temporal
      const lastSentPath = path.join(__dirname, `../data/lastSent_${guia._id}.dat`);
      let lastSent = 0;
      if (fs.existsSync(lastSentPath)) {
        lastSent = Number(fs.readFileSync(lastSentPath, "utf-8"));
      }
      const now = Date.now();
      const msPerDay = 24 * 60 * 60 * 1000;
      if (now - lastSent >= (config.lateFrequencyDays || 1) * msPerDay) {
        enviar = true;
        asunto = `Recordatorio: Paquete atrasado (${guia.numeroGuia})`;
        cuerpo = `El siguiente paquete está atrasado:<br/><br/>${guiaInfoHtml(guia)}`;
        fs.writeFileSync(lastSentPath, String(now));
      }
    }

    if (enviar) {
      try {
        await transporter.sendMail({
          from: 'soporte@tiservicesmxli.com',
          to: config.emails.join(","),
          subject: asunto,
          html: cuerpo,
        });
      } catch (err) {
        console.error("Error enviando correo de notificación:", err);
      }
    }
  }
}
