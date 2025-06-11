import dotenv from "dotenv";
dotenv.config();
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
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Poner la contraseña real en variable de entorno
  },
});

function getConfig() {
  if (!fs.existsSync(configPath)) return null;
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

// Nueva función para generar tabla HTML por estado
function guiasEstadoHtml(guias: any[], titulo: string) {
  if (!guias.length) return '';
  return `<h3>${titulo}</h3><table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse; margin-bottom:16px;">
    <thead><tr>
      <th>Número</th><th>Proveedor</th><th>Paquetería</th><th>Fecha Pedido</th><th>Fecha Llegada</th><th>Proyectos</th><th>Comentarios</th>
    </tr></thead>
    <tbody>
      ${guias.map(g => `<tr>
        <td>${g.numeroGuia}</td>
        <td>${g.proveedor}</td>
        <td>${g.paqueteria}</td>
        <td>${g.fechaPedido ? new Date(g.fechaPedido).toLocaleDateString() : ''}</td>
        <td>${g.fechaLlegada ? new Date(g.fechaLlegada).toLocaleDateString() : ''}</td>
        <td>${g.proyectos?.join(', ') || ''}</td>
        <td>${g.comentarios || ''}</td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

export async function revisarYNotificarGuias() {
  const config = getConfig();
  if (!config || !config.emails || config.emails.length === 0) return;

  const hoy = dayjs();
  const guias = await Guia.find({});

  // Agrupar guías por estado relevante
  const enTransito: any[] = [];
  const atrasadas: any[] = [];
  const entregadas: any[] = [];
  const noEntregadas: any[] = [];

  for (const guia of guias) {
    switch (guia.estado) {
      case 'en transito':
        enTransito.push(guia);
        break;
      case 'atrasado':
        atrasadas.push(guia);
        break;
      case 'entregado':
        entregadas.push(guia);
        break;
      case 'no entregado':
        noEntregadas.push(guia);
        break;
    }
  }

  let cuerpo = '';
  cuerpo += guiasEstadoHtml(enTransito, 'Guías en tránsito');
  cuerpo += guiasEstadoHtml(atrasadas, 'Guías atrasadas');
  cuerpo += guiasEstadoHtml(noEntregadas, 'Guías no entregadas');
  cuerpo += guiasEstadoHtml(entregadas, 'Guías entregadas');

  if (!cuerpo) return; // No hay nada que notificar

  const asunto = `Resumen de guías (${hoy.format('DD/MM/YYYY')})`;

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
