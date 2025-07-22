import re
import json
import PyPDF2
import sys

def extraer_informacion_cotizacion_dice(texto_pdf):
    """
    Extrae información de una cotización Grupo Dice y la convierte a JSON
    """
    
    # Extraer folio (QUOTE) - puede estar vacío
    folio_match = re.search(r'QUOTE:\s*([^\n\r]*?)\s*FECHA', texto_pdf, re.DOTALL)
    folio = ""
    if folio_match:
        folio_texto = folio_match.group(1).strip()
        # Solo asignar si no está vacío y no es solo espacios/saltos de línea
        if folio_texto and not re.match(r'^\s*$', folio_texto):
            folio = folio_texto
    
    # Extraer fecha
    fecha_match = re.search(r'FECHA\s+(\d{2}/\d{2}/\d{4})', texto_pdf)
    fecha = ""
    if fecha_match:
        # Convertir formato DD/MM/YYYY a YYYY-MM-DD
        fecha_original = fecha_match.group(1)
        dia, mes, año = fecha_original.split('/')
        fecha = f"{año}-{mes}-{dia}"
    
    # Extraer ejecutivo (Vendedor)
    ejecutivo_match = re.search(r'Vendedor\s+([^\n\r]+)', texto_pdf)
    ejecutivo = ejecutivo_match.group(1).strip() if ejecutivo_match else ""
    
    # Extraer productos - Patrón mejorado para el formato específico del PDF
    productos = []
    
    # Buscar cada línea de producto usando el patrón del PDF real
    # Formato: PARTIDA CANT CODIGO FABRICANTE DESCRIPCION $PRECIO_LISTA $PRECIO_UNIT DESCUENTO% $PRECIO_EXTENDIDO STOCK
    patron_producto = r'(\d+)\s+(\d+)\s+([A-Z0-9\-]+)\s+([^$]+?)\s+\$\s*([0-9,]+\.\d{2})\s+\$\s*([0-9,]+\.\d{2})\s+(\d+\.\d{2})%\s+\$\s*([0-9,]+\.\d{2})\s+([^\n]+)'
    
    matches = re.findall(patron_producto, texto_pdf, re.MULTILINE)
    
    for match in matches:
        partida = int(match[0])
        cantidad = int(match[1])
        codigo = match[2].strip()
        descripcion = re.sub(r'\s+', ' ', match[3].strip())
        precio_lista = float(match[4].replace(',', ''))
        precio_unitario = float(match[5].replace(',', ''))
        descuento = match[6]
        precio_extendido = float(match[7].replace(',', ''))
        stock = match[8].strip()
        
        producto = {
            "partida": partida,
            "cantidad": cantidad,
            "codigo": codigo,
            "descripcion": descripcion,
            "precioLista": precio_lista,
            "precioUnitario": precio_unitario,
            "descuento": f"{descuento}%",
            "precioExtendido": precio_extendido,
            "stock": stock
        }
        productos.append(producto)
    
    # Si no se encontraron productos con el patrón anterior, usar método alternativo más robusto
    if not productos:
        # Dividir el texto en líneas y buscar productos línea por línea
        lineas = texto_pdf.split('\n')
        
        for i, linea in enumerate(lineas):
            linea = linea.strip()
            
            # Buscar líneas que empiecen con número (partida) seguido de cantidad y código
            match_inicio = re.match(r'^(\d+)\s+(\d+)\s+([A-Z0-9\-]+)\s+(.+)', linea)
            
            if match_inicio:
                partida = int(match_inicio.group(1))
                cantidad = int(match_inicio.group(2))
                codigo = match_inicio.group(3)
                resto_linea = match_inicio.group(4)
                
                # Buscar precios en la misma línea o líneas siguientes
                precio_match = re.search(r'\$\s*([0-9,]+\.\d{2})\s+\$\s*([0-9,]+\.\d{2})\s+(\d+\.\d{2})%\s+\$\s*([0-9,]+\.\d{2})\s+(.+)', resto_linea)
                
                if precio_match:
                    # Todo está en la misma línea
                    descripcion_partes = resto_linea.split('$')[0].strip()
                    precio_lista = float(precio_match.group(1).replace(',', ''))
                    precio_unitario = float(precio_match.group(2).replace(',', ''))
                    descuento = precio_match.group(3)
                    precio_extendido = float(precio_match.group(4).replace(',', ''))
                    stock = precio_match.group(5).strip()
                    
                    producto = {
                        "partida": partida,
                        "cantidad": cantidad,
                        "codigo": codigo,
                        "descripcion": descripcion_partes,
                        "precioLista": precio_lista,
                        "precioUnitario": precio_unitario,
                        "descuento": f"{descuento}%",
                        "precioExtendido": precio_extendido,
                        "stock": stock
                    }
                    productos.append(producto)
    
    # Extraer totales - Patrones específicos para el formato del PDF
    subtotal_match = re.search(r'SUBTOTAL\s+\$([0-9,]+\.\d{2})', texto_pdf)
    iva_match = re.search(r'I\.V\.A\.\s+\d+%\s+\$([0-9,]+\.\d{2})', texto_pdf)
    
    # Buscar el total después del IVA - patrón más específico
    total_match = re.search(r'I\.V\.A\.\s+\d+%\s+\$[0-9,]+\.\d{2}\s+TOTAL\s+\$([0-9,]+\.\d{2})', texto_pdf)
    
    # Si no encuentra, buscar línea que tenga TOTAL seguido de precio
    if not total_match:
        total_match = re.search(r'TOTAL\s+\$([0-9,]+\.\d{2})', texto_pdf)
    
    # Si aún no encuentra, buscar en múltiples líneas
    if not total_match:
        # Buscar patrón que incluya salto de línea entre IVA y TOTAL
        total_match = re.search(r'I\.V\.A\.\s+\d+%\s+\$[0-9,]+\.\d{2}.*?TOTAL\s+\$([0-9,]+\.\d{2})', texto_pdf, re.DOTALL)
    
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

def procesar_pdf_dice(archivo_pdf):
    """
    Función principal para procesar un archivo PDF de cotización Grupo Dice
    """
    try:
        with open(archivo_pdf, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            texto_completo = ""
            
            for page in pdf_reader.pages:
                texto_completo += page.extract_text()
            
            resultado = extraer_informacion_cotizacion_dice(texto_completo)
            return json.dumps(resultado, indent=2, ensure_ascii=False)
    
    except Exception as e:
        return json.dumps({"error": f"Error procesando PDF: {str(e)}"}, indent=2)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python extraer_datos_grupo_dice.py <archivo_pdf>")
        sys.exit(1)
    
    archivo = sys.argv[1]
    print(procesar_pdf_dice(archivo))