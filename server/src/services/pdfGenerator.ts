import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

interface OrdenCompraData {
  numeroOrden: string;
  fecha: string;
  proveedor: {
    empresa: string;
    direccion: string;
    telefono: string;
    contactos?: Array<{
      nombre: string;
      correo: string;
      telefono: string;
      extension?: string;
    }>;
  };
  razonSocial: {
    nombre: string;
    direccionEmpresa: string;
    telEmpresa: string;
    emailEmpresa: string;
  };
  direccionEnvio: {
    contacto?: string;
    nombre?: string;
    direccion: string;
    telefono: string;
  };
  vendedor?: {
    nombre: string;
    correo: string;
    telefono: string;
  };
  datosPdf?: {
    datosExtraidos?: {
      folio?: string;
      formaPago?: string;
      usoMercancia?: string;
      productos?: Array<{
        cantidad: number | string;
        unidad?: string;
        codigo?: string;
        clave?: string;
        descripcion?: string;
        concepto?: string;
        marca?: string;
        modelo?: string;
        precioUnitario?: number;
        precio?: number;
        importe?: number;
        total?: number;
      }>;
      totales?: {
        subTotal: number;
        iva: number;
        total: number;
      };
    };
  };
  productos?: Array<any>;
  totalesCalculados?: {
    subTotal: number;
    iva: number;
    total: number;
  };
}

export class PdfGeneratorService {
  private templatesPath: string;

  constructor() {
    this.templatesPath = path.join(__dirname, '..', 'templates');
  }

  private formatearMoneda(valor: number): string {
    return `$${valor.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
  }

  private procesarDatosOrden(datosOrden: OrdenCompraData): any {
    // Extraer información del proveedor
    const proveedor = datosOrden.proveedor;
    const contactoPrincipal = proveedor.contactos && proveedor.contactos.length > 0
      ? proveedor.contactos[0]
      : { nombre: '', correo: '', telefono: '', extension: '' };
    
    // Extraer información de razón social (facturar a)
    const razonSocial = datosOrden.razonSocial;
    
    // Extraer información de envío
    const direccionEnvio = datosOrden.direccionEnvio;
    
    // Extraer información del vendedor (solicita)
    const vendedor = datosOrden.vendedor;
    
    // Extraer datos del PDF si existen
    const datosPdf = datosOrden.datosPdf?.datosExtraidos || {};
    
    // Usar totales calculados si están disponibles, sino usar los del PDF
    const totales = datosOrden.totalesCalculados || datosPdf.totales || {
      subTotal: 0,
      iva: 0,
      total: 0
    };

    // Mapear variables para la plantilla
    const plantillaVars = {
      // Información del documento
      noDocVal: datosOrden.numeroOrden || '',
      fechaDoc: datosOrden.fecha || new Date().toLocaleDateString('es-MX'),
      numCotizacion: datosPdf.folio || '',
      
      // Información del proveedor
      nomProveedor: proveedor.empresa || '',
      dirProveedor: proveedor.direccion || '',
      telProveedor: proveedor.telefono || '',
      
      // Contacto del proveedor
      contactoProveedor: contactoPrincipal.nombre || '',
      emailProveedorContacto: contactoPrincipal.correo || '',
      telProveedorContato: contactoPrincipal.telefono ? 
        `${contactoPrincipal.telefono} ${contactoPrincipal.extension ? 'Ext. ' + contactoPrincipal.extension : ''}` : '',
      
      // Facturar a (razón social)
      nomFacturar: razonSocial.nombre || '',
      dirFacturar: razonSocial.direccionEmpresa || '',
      telFacturar: razonSocial.telEmpresa || '',
      
      // Solicitante (vendedor si está disponible, sino datos de la empresa)
      solicitante: vendedor?.nombre || razonSocial.nombre || '',
      emailSolicitante: vendedor?.correo || razonSocial.emailEmpresa || '',
      telSolicitante: vendedor?.telefono || razonSocial.telEmpresa || '',
      
      // Entregar a (dirección de envío)
      receptor: direccionEnvio.contacto || direccionEnvio.nombre || '',
      direccionReceptor: direccionEnvio.direccion || '',
      telefonoReceptor: direccionEnvio.telefono || '',
      
      // Totales
      subtotal: this.formatearMoneda(totales.subTotal),
      iva: '16%', // Valor por defecto, se puede cambiar según el JSON
      importeIva: this.formatearMoneda(totales.iva),
      total: this.formatearMoneda(totales.total),
      
      // Información adicional
      usoMercancia: datosPdf.usoMercancia || 'G03 - GASTOS EN GENERAL',
      formaPago: datosPdf.formaPago || 'POR DEFINIR',
      moneda: 'MXN'
    };
    
    return plantillaVars;
  }

  private generarFilasProductos(productos: Array<any>): string {
    if (!productos || productos.length === 0) {
      return '<tr><td colspan="10">No hay productos</td></tr>';
    }

    return productos.map((producto, index) => {
      const cantidad = producto.cantidad || 0;
      const precioUnitario = producto.precioUnitario || producto.precio || 0;
      const precioLista = producto.precioLista || 0;
      const importe = producto.importe || producto.total || (cantidad * precioUnitario);
      const almacen = producto.alm || producto.almacen || '';
      
      return `
        <tr>
          <td class="col-codigo">${producto.codigo || producto.clave || ''}</td>
          <td class="col-descripcion" colspan="3">${producto.descripcion || producto.concepto || ''}</td>
          <td class="col-u">${producto.unidad || ''}</td>
          <td class="col-cant">${cantidad}</td>
          <td class="col-pu">${this.formatearMoneda(precioUnitario)}</td>
          <td class="col-alm">${almacen}</td>
          <td class="col-lista">${precioLista > 0 ? this.formatearMoneda(precioLista) : ''}</td>
          <td class="col-importe">${this.formatearMoneda(importe)}</td>
        </tr>
      `;
    }).join('');
  }

  public async generarPdfOrdenCompra(datosOrden: OrdenCompraData): Promise<Buffer> {
    let browser;
    
    try {
      // Leer la plantilla HTML
      const templatePath = path.join(this.templatesPath, 'ordenCompra.html');
      let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
      
      // Procesar los datos de la orden
      const plantillaVars = this.procesarDatosOrden(datosOrden);
      
      // Generar las filas de productos
      const productos = datosOrden.productos || datosOrden.datosPdf?.datosExtraidos?.productos || [];
      const filasProductos = this.generarFilasProductos(productos);
      
      // Reemplazar variables en el HTML
      Object.keys(plantillaVars).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlTemplate = htmlTemplate.replace(regex, plantillaVars[key] || '');
      });
      
      // Reemplazar la sección de productos
      htmlTemplate = htmlTemplate.replace('{{productos}}', filasProductos);
      
      // Leer CSS
      const cssPath = path.join(this.templatesPath, 'ordenCompra.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      
      // Convertir imágenes a base64 para embeber en el HTML
      const imgTopPath = path.join(this.templatesPath, 'img', 'top.png');
      const imgBottomPath = path.join(this.templatesPath, 'img', 'bottom-2.png');
      
      let imgTopBase64 = '';
      let imgBottomBase64 = '';
      
      try {
        if (fs.existsSync(imgTopPath)) {
          const imgTopBuffer = fs.readFileSync(imgTopPath);
          imgTopBase64 = `data:image/png;base64,${imgTopBuffer.toString('base64')}`;
          htmlTemplate = htmlTemplate.replace(/src="img\/top\.png"/g, `src="${imgTopBase64}"`);
          console.log('Imagen top.png cargada correctamente, tamaño:', imgTopBuffer.length, 'bytes');
        } else {
          console.warn('Imagen top.png no encontrada en:', imgTopPath);
        }
        
        if (fs.existsSync(imgBottomPath)) {
          const imgBottomBuffer = fs.readFileSync(imgBottomPath);
          imgBottomBase64 = `data:image/png;base64,${imgBottomBuffer.toString('base64')}`;
          htmlTemplate = htmlTemplate.replace(/src="img\/bottom-2\.png"/g, `src="${imgBottomBase64}"`);
          console.log('Imagen bottom-2.png cargada correctamente, tamaño:', imgBottomBuffer.length, 'bytes');
        } else {
          console.warn('Imagen bottom-2.png no encontrada en:', imgBottomPath);
        }
      } catch (imgError) {
        console.error('Error al cargar imágenes:', imgError);
        // Continuar sin las imágenes en caso de error
      }
      
      // Crear HTML completo con CSS embebido
      const htmlCompleto = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Orden de Compra - ${plantillaVars.noDocVal}</title>
          <style>${cssContent}</style>
        </head>
        <body>
          ${htmlTemplate.replace(/<html[^>]*>[\s\S]*?<\/head>/, '').replace(/<body[^>]*>|<\/body>|<\/html>/g, '')}
        </body>
        </html>
      `;
      
      console.log('Iniciando generación de PDF para orden:', datosOrden.numeroOrden);
      
      // Inicializar Puppeteer con configuración más estable y conservadora
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--max-old-space-size=4096',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-default-apps'
        ],
        timeout: 60000,
        protocolTimeout: 60000
      });
      
      const page = await browser.newPage();
      console.log('Página de Puppeteer creada correctamente');
      
      // Configurar timeouts más largos
      page.setDefaultTimeout(60000);
      page.setDefaultNavigationTimeout(60000);
      
      // Configurar el viewport para formato carta (8.5 x 11 pulgadas)
      await page.setViewport({ 
        width: 816,   // 8.5 pulgadas * 96 DPI
        height: 1056, // 11 pulgadas * 96 DPI
        deviceScaleFactor: 1.0
      });
      console.log('Viewport configurado correctamente');
      
      // Cargar el HTML con configuración simplificada
      await page.setContent(htmlCompleto, { 
        waitUntil: 'domcontentloaded',  // Cambio a domcontentloaded para ser menos estricto
        timeout: 30000
      });
      console.log('HTML cargado en la página');
      
      // Esperar a que las imágenes base64 se procesen
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Esperando carga de imágenes...');
      
      // Aplicar ajustes a las imágenes de forma más segura
      try {
        await page.evaluate(() => {
          const topImg = document.querySelector('img[src*="data:image/png;base64"]') as HTMLImageElement;
          if (topImg) {
            topImg.style.maxHeight = '200px'; // Aumentado para que coincida con CSS
            topImg.style.width = '100%';
            topImg.style.objectFit = 'contain';
            topImg.style.display = 'block';
            topImg.style.margin = '0'; // Sin márgenes
            topImg.style.padding = '0';
          }
        });
        console.log('Estilos de imagen aplicados');
      } catch (evalError) {
        console.warn('Error al aplicar estilos de imagen:', evalError);
        // Continuar sin los estilos personalizados
      }
      
      // Configurar media type para impresión
      await page.emulateMediaType('print');
      console.log('Media type configurado para impresión');
      
      // Espera final antes de generar PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Iniciando generación del archivo PDF...');
      
      // Generar PDF con configuración simplificada y más estable
      try {
        console.log('Llamando a page.pdf()...');
        const pdfBuffer = await page.pdf({
          format: 'Letter',  // Cambio a formato carta
          printBackground: true,
          displayHeaderFooter: false,
          margin: {
            top: '0.25in',     // Márgenes reducidos
            right: '0.25in',
            bottom: '0.25in',
            left: '0.25in'
          },
          timeout: 120000  // Timeout más largo específicamente para la generación del PDF
        });
        
        console.log('PDF generado correctamente, tamaño:', pdfBuffer.length, 'bytes');
        return Buffer.from(pdfBuffer);
      } catch (pdfError) {
        console.error('Error específico al generar PDF:', pdfError);
        
        // Intentar una segunda vez con configuración aún más simple
        console.log('Intentando generar PDF con configuración básica...');
        try {
          const pdfBufferSimple = await page.pdf({
            format: 'Letter',  // También en el fallback usar carta
            margin: {
              top: '0.25in',
              right: '0.25in', 
              bottom: '0.25in',
              left: '0.25in'
            },
            timeout: 120000
          });
          console.log('PDF generado con configuración básica, tamaño:', pdfBufferSimple.length, 'bytes');
          return Buffer.from(pdfBufferSimple);
        } catch (secondError) {
          console.error('Error en segundo intento:', secondError);
          throw pdfError; // Lanzar el error original
        }
      }
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw new Error(`Error al generar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('Error al cerrar browser:', closeError);
        }
      }
    }
  }
}
