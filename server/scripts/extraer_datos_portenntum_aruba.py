import pdfplumber
import re
import json
import sys

def limpiar_numero(texto):
    return float(re.sub(r'[^\d.]', '', texto.replace(' ', '').replace(',', '')))

def reparar_linea_fragmentada(linea):
    """Repara números fragmentados y espacios problemáticos"""
    # Reparar precios fragmentados como "$ 2 2,120.00" -> "$22,120.00"
    linea = re.sub(r'\$\s*(\d)\s+(\d{1,3},\d{3}\.\d{2})', r'$\1\2', linea)
    linea = re.sub(r'\$\s*(\d{1,2})\s+(\d{3}\.\d{2})', r'$\1\2', linea)
    linea = re.sub(r'\$\s*(\d)\s+(\d{2,3}\.\d{2})', r'$\1\2', linea)
    
    # Reparar números de inventario pegados al porcentaje
    linea = re.sub(r'(\d{2,3})(\d{2}\.\d{2}%)', r'\1 \2', linea)
    
    # Reparar espacios en números grandes
    linea = re.sub(r'(\d)\s+(\d{3}\.\d{2})', r'\1\2', linea)
    linea = re.sub(r'(\d),\s+(\d{3}\.\d{2})', r'\1,\2', linea)
    
    return linea

def extraer_productos_fragmentados(lines):
    """Extrae productos manejando la fragmentación real del PDF"""
    productos = []
    buffer = ""
    productos_raw = []
    
    # Unir líneas fragmentadas
    for line in lines:
        if line.startswith('*') and buffer:
            productos_raw.append(buffer.strip())
            buffer = line
        else:
            buffer += " " + line if buffer else line
    
    if buffer:
        productos_raw.append(buffer.strip())
    
    # Regex súper flexible para manejar fragmentación
    regex = re.compile(
        r'^\*(.+?)\s+(\d+)\s+([A-Z0-9\-]+)\s+(.+?)\s+\$\s*([\d\s,]+\.\d{2})\s+\$\s*[\d\s,]+\.\d{2}\s+([\d\s]+)\s+([\d.]+)%\s+\$\s*([\d\s,]+\.\d{2})\s+\$\s*([\d\s,]+\.\d{2})\s+(.+)$'
    )
    
    for prod in productos_raw:
        # Reparar fragmentación antes de aplicar regex
        prod_reparado = reparar_linea_fragmentada(prod)
        
        match = regex.match(prod_reparado)
        if match:
            cantidad = float(match.group(2))
            no_parte = match.group(3)
            nombre = match.group(4).strip()
            precio_lista = limpiar_numero(match.group(5))
            porcentaje = match.group(7)
            p_unitario = limpiar_numero(match.group(8))
            p_extendido = limpiar_numero(match.group(9))
            disponibilidad = match.group(10).strip()
            
            productos.append({
                "cantidad": cantidad,
                "codigo": no_parte,
                "descripcion": f"{nombre} - {disponibilidad}",
                "precioLista": precio_lista,
                "porcentaje": porcentaje,
                "precioUnitario": p_unitario,
                "pExtendido": p_extendido
            })
    
    return productos

def procesar_pdf_portentum(archivo_pdf):
    try:
        with pdfplumber.open(archivo_pdf) as pdf:
            lines = []
            folio = fecha = ejecutivo = ""
            total = 0.0
            in_tabla = False
            
            for page in pdf.pages:
                text = page.extract_text()
                for line in text.split('\n'):
                    # Detectar inicio y fin de tabla de productos
                    if 'Concepto Cantidad No. De Parte Nombre de Producto' in line:
                        in_tabla = True
                        continue
                    if 'Total P. Lista' in line:
                        in_tabla = False
                    
                    # Capturar líneas de productos
                    if in_tabla and line.strip().startswith('*'):
                        lines.append(line.strip())
                    
                    # Buscar folio
                    if not folio:
                        m = re.search(r'Folio:\s*([^\s]+)', line)
                        if m:
                            folio = m.group(1)
                    
                    # Buscar fecha
                    if not fecha:
                        m = re.search(r'Fecha:\s*(\d{2})-(\w{3})-(\d{2})', line)
                        if m:
                            dia, mes_texto, anio = m.groups()
                            meses = {'ene':'01','feb':'02','mar':'03','abr':'04','may':'05','jun':'06','jul':'07','ago':'08','sep':'09','oct':'10','nov':'11','dic':'12'}
                            mes = meses.get(mes_texto.lower(), '01')
                            fecha = f"20{anio}-{mes}-{dia}"
                    
                    # Buscar ejecutivo
                    if not ejecutivo:
                        m = re.search(r'Elaborado por:\s*([^\n\r]+)', line)
                        if m:
                            ejecutivo = m.group(1).strip()
                    
                    # Buscar total
                    if 'P.Venta Canal' in line:
                        m = re.search(r'P\.Venta Canal\s*\$\s*([\d\s,]+\.\d{2})', line)
                        if m:
                            total = limpiar_numero(m.group(1))
            
            # Extraer productos
            productos = extraer_productos_fragmentados(lines)
            
            resultado = {
                "folio": folio,
                "fecha": fecha,
                "ejecutivo": ejecutivo,
                "productos": productos,
                "totales": {
                    "total": total
                },

            }
            
            print(json.dumps(resultado, indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(json.dumps({"error": f"Error procesando PDF: {str(e)}"}, indent=2))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python script.py archivo.pdf")
        sys.exit(1)
    
    archivo = sys.argv[1]
    procesar_pdf_portentum(archivo)