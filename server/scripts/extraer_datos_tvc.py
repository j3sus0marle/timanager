import re
import json
import PyPDF2
import sys

def extraer_informacion_cotizacion_tvc(texto_pdf):
    """
    Extrae información de una cotización TVC y la convierte a JSON
    Solo incluye campos con valor real de la cotización
    """
    
    # Extraer folio
    folio_match = re.search(r'Folio\s+(\d+)', texto_pdf)
    folio = folio_match.group(1) if folio_match else ""
    
    # Extraer fecha
    fecha_match = re.search(r'(\d{4}-\d{2}-\d{2})', texto_pdf)
    fecha = fecha_match.group(1) if fecha_match else ""
    
    # Extraer ejecutivo (vendedor asignado)
    ejecutivo_match = re.search(r'Vendedor asignado:\s*\d+\s*-\s*([^/]+)', texto_pdf)
    ejecutivo = ejecutivo_match.group(1).strip() if ejecutivo_match else ""
    
    # Extraer productos de forma dinámica
    productos = []
    
    # Buscar tabla de productos después de "Detalle del pedido"
    detalle_match = re.search(r'Detalle del pedido(.*?)(?=Los precios mostrados|©|$)', texto_pdf, re.DOTALL)
    
    if detalle_match:
        detalle_texto = detalle_match.group(1)
        
        # Buscar claves de producto (formato alfanumérico)
        claves_productos = re.findall(r'\b([A-Z]{2,}\d{6,})\b', detalle_texto)
        
        for clave in claves_productos:
            # Para cada clave, buscar los datos asociados
            patron_producto = rf'{re.escape(clave)}\s+([^\n]+(?:\n[^\n]+)*?)\s+(\d+)\s+\$([0-9,]+\.\d{{2}})\s+(-?\d+\.\d{{2}}%)\s+\$([0-9,]+\.\d{{2}})\s+\$([0-9,]+\.\d{{2}})'
            
            match = re.search(patron_producto, detalle_texto, re.MULTILINE | re.DOTALL)
            
            if match:
                descripcion = re.sub(r'\s+', ' ', match.group(1).strip())
                cantidad = float(match.group(2))
                precio_distribuidor = float(match.group(5).replace(',', ''))
                importe = float(match.group(6).replace(',', ''))
                
                # Solo campos con valor real según encabezados TVC
                producto = {
                    "codigo": clave,
                    "descripcion": descripcion,
                    "cantidad": cantidad,
                    "precioUnitario": precio_distribuidor,
                    "importe": importe
                }
                productos.append(producto)
            else:
                # Método alternativo: buscar datos por separado
                desc_match = re.search(rf'{re.escape(clave)}\s+([^\n]+(?:\n[^\$\d]+)*)', detalle_texto)
                cantidad_match = re.search(rf'{re.escape(clave)}.*?\n.*?(\d+)\s+\$', detalle_texto, re.DOTALL)
                precios_matches = re.findall(r'\$([0-9,]+\.\d{2})', detalle_texto)
                
                if desc_match and cantidad_match and len(precios_matches) >= 3:
                    descripcion = re.sub(r'\s+', ' ', desc_match.group(1).strip())
                    cantidad = float(cantidad_match.group(1))
                    precio_distribuidor = float(precios_matches[1].replace(',', ''))
                    importe = float(precios_matches[2].replace(',', ''))

                    # Solo campos con valor real según encabezados TVC
                    producto = {
                        "codigo": clave,
                        "descripcion": descripcion,
                        "cantidad": cantidad,
                        "precioUnitario": precio_distribuidor,
                        "importe": importe
                    }
                    productos.append(producto)
    
    # Extraer costo de envío
    envio_match = re.search(r'Envío\s+MXN\s+\$([0-9,]+\.\d{2})', texto_pdf)
    if envio_match:
        costo_envio = float(envio_match.group(1).replace(',', ''))
        if costo_envio > 0:
            producto_envio = {
                "codigo": "ENVIO",
                "descripcion": "Servicio de envío",
                "cantidad": 1.0,
                "precioUnitario": costo_envio,
                "importe": costo_envio
            }
            productos.append(producto_envio)
    
    # Extraer totales
    subtotal_match = re.search(r'Subtotal\s+MXN\s+\$([0-9,]+\.\d{2})', texto_pdf)
    iva_match = re.search(r'IVA\s+MXN\s+\$([0-9,]+\.\d{2})', texto_pdf)
    total_match = re.search(r'Total\s+MXN\s+\$([0-9,]+\.\d{2})', texto_pdf)
    
    subtotal = float(subtotal_match.group(1).replace(',', '')) if subtotal_match else 0.0
    iva = float(iva_match.group(1).replace(',', '')) if iva_match else 0.0
    total = float(total_match.group(1).replace(',', '')) if total_match else 0.0
    
    # Crear el JSON final
    resultado = {
        "folio": folio,
        "fecha": fecha,
        "ejecutivo": ejecutivo,
        "productos": productos,
        "totales": {
            "subTotal": subtotal,
            "iva": iva,
            "total": total
        }
    }
    
    return resultado

def procesar_pdf_tvc(archivo_pdf):
    """
    Función principal para procesar un archivo PDF de cotización TVC
    """
    try:
        with open(archivo_pdf, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            texto_completo = ""
            
            for page in pdf_reader.pages:
                texto_completo += page.extract_text()
        
        resultado = extraer_informacion_cotizacion_tvc(texto_completo)
        return json.dumps(resultado, indent=2, ensure_ascii=False)
        
    except Exception as e:
        return json.dumps({"error": f"Error procesando PDF: {str(e)}"}, indent=2)

def procesar_texto_tvc(texto_pdf):
    """
    Función para procesar texto directo de PDF
    """
    resultado = extraer_informacion_cotizacion_tvc(texto_pdf)
    return json.dumps(resultado, indent=2, ensure_ascii=False)

# Ejemplo de uso
if __name__ == "__main__":

        # Usar archivo PDF como argumento
        archivo = sys.argv[1]
        print(procesar_pdf_tvc(archivo))
