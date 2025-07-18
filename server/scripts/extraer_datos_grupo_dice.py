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
    
    # Extraer productos
    productos = []
    
    # Buscar la tabla de productos usando un patrón más específico
    # Patrón para cada línea de producto: partida cantidad codigo descripcion precio descuento importe stock
    patron_producto = r'(\d+)\s+(\d+)\s+([A-Z0-9]+)\s+([^$]+?)\s+\$\s*([0-9,]+\.\d{2})\s+(\d+\.\d{2})%\s+\$\s*([0-9,]+\.\d{2})\s+([^\n]+)'
    
    matches = re.findall(patron_producto, texto_pdf, re.MULTILINE)
    
    for match in matches:
        partida = match[0]
        cantidad = float(match[1])
        codigo = match[2]
        descripcion_base = re.sub(r'\s+', ' ', match[3].strip())
        precio_lista = float(match[4].replace(',', ''))
        descuento = match[5]
        importe = float(match[6].replace(',', ''))
        stock_rotativo = match[7].strip()
        
        # Agregar stock rotativo a la descripción
        descripcion_completa = descripcion_base
        if stock_rotativo:
            descripcion_completa += f" - {stock_rotativo}"
        
        producto = {
            "cantidad": cantidad,
            "codigo": codigo,
            "descripcion": descripcion_completa,
            "precioUnitario": precio_lista,
            "descuento": descuento,
            "importe": importe
        }
        productos.append(producto)
    
    # Si no se encontraron productos con el patrón anterior, usar método alternativo
    if not productos:
        # Buscar tabla línea por línea
        tabla_match = re.search(r'STOCK ROTATIVO(.*?)SUBTOTAL', texto_pdf, re.DOTALL)
        
        if tabla_match:
            tabla_texto = tabla_match.group(1)
            lineas = [linea.strip() for linea in tabla_texto.split('\n') if linea.strip()]
            
            i = 0
            while i < len(lineas):
                linea = lineas[i]
                
                # Buscar línea que empiece con número (partida)
                if re.match(r'^\d+\s+\d+\s+[A-Z0-9]+', linea):
                    # Extraer datos básicos
                    partes = linea.split()
                    if len(partes) >= 3:
                        partida = partes[0]
                        cantidad = float(partes[1])
                        codigo = partes[2]
                        
                        # El resto es descripción inicial
                        descripcion_inicial = ' '.join(partes[3:])
                        
                        # Buscar precios en las siguientes líneas
                        j = i + 1
                        descripcion_completa = descripcion_inicial
                        precio_lista = 0.0
                        descuento = "0.0"
                        importe = 0.0
                        stock_rotativo = ""
                        
                        while j < len(lineas):
                            siguiente = lineas[j]
                            
                            # Si encontramos otra partida, salir
                            if re.match(r'^\d+\s+\d+\s+[A-Z0-9]+', siguiente):
                                break
                            
                            # Buscar precios
                            precio_match = re.search(r'\$\s*([0-9,]+\.\d{2})\s+(\d+\.\d{2})%\s+\$\s*([0-9,]+\.\d{2})\s+(.+)', siguiente)
                            
                            if precio_match:
                                precio_lista = float(precio_match.group(1).replace(',', ''))
                                descuento = precio_match.group(2)
                                importe = float(precio_match.group(3).replace(',', ''))
                                stock_rotativo = precio_match.group(4).strip()
                                break
                            else:
                                # Continuación de descripción
                                if not siguiente.startswith('$'):
                                    descripcion_completa += " " + siguiente
                            
                            j += 1
                        
                        # Agregar stock rotativo a descripción
                        if stock_rotativo:
                            descripcion_completa += f" - {stock_rotativo}"
                        
                        producto = {
                            "cantidad": cantidad,
                            "codigo": codigo,
                            "descripcion": descripcion_completa.strip(),
                            "precioUnitario": precio_lista,
                            "descuento": descuento,
                            "importe": importe
                        }
                        productos.append(producto)
                        
                        i = j
                    else:
                        i += 1
                else:
                    i += 1
    
    # Extraer totales
    subtotal_match = re.search(r'SUBTOTAL\s+\$([0-9,]+\.\d{2})', texto_pdf)
    iva_match = re.search(r'I\.V\.A\.\s+\d+%\s+\$([0-9,]+\.\d{2})', texto_pdf)
    total_match = re.search(r'TOTAL\s+\$([0-9,]+\.\d{2})\s+USD', texto_pdf)
    
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

        archivo = sys.argv[1]
        print(procesar_pdf_dice(archivo))
