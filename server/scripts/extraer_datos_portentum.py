import pdfplumber
import re
import json
import sys
import os

def try_float(valor):
    if not valor:
        return None
    try:
        return float(str(valor).replace(",", "").replace("$", "").strip())
    except:
        return None

def extraer_datos_portentum(path_pdf):
    with pdfplumber.open(path_pdf) as pdf:
        texto = "\n".join([p.extract_text() for p in pdf.pages if p.extract_text()])
        lineas = texto.split('\n')

        # ==== DATOS GENERALES ====
        folio = ""
        match_folio = re.search(r'22040.*?(\d+)', texto, re.DOTALL)
        if match_folio:
            folio = match_folio.group(1).strip()

        fecha = ""
        datos_fiscales = ""
        rfc = ""
        ejecutivo = ""
        email = ""
        telefono = ""
        sub_total = 0.0
        iva = 0.0
        total = 0.0

        for i, linea in enumerate(lineas):
            if re.match(r"^Fecha:", linea.strip()):
                if i+1 < len(lineas):
                    fecha = lineas[i+1].strip()
            if "Cotización para:" in linea:
                if i+1 < len(lineas):
                    datos_fiscales = lineas[i+1].strip()
            if "Email:" in linea:
                email = linea.split("Email:")[-1].strip()
            if "Telefono:" in linea:
                telefono = linea.split("Telefono:")[-1].strip()
            if "Atentamente:" in linea:
                if i+1 < len(lineas):
                    ejecutivo = lineas[i+1].strip()
            if "SubTotal:" in linea:
                sub_total = try_float(linea.split("SubTotal:")[-1])
            if "I.V.A.:" in linea:
                iva = try_float(linea.split("I.V.A.:")[-1])
            if "Total:" in linea:
                total = try_float(linea.split("Total:")[-1])

        # ==== EXTRACCIÓN DE PRODUCTOS ====
        productos = []
        in_productos = False
        i = 0
        while i < len(lineas):
            linea = lineas[i].strip()
            # Detectar inicio de productos
            if re.match(r"^Linea Parte", linea):
                in_productos = True
                i += 1
                continue
            if in_productos:
                # Detectar línea de producto (empieza con número y código)
                match = re.match(
                    r"^(\d+)\s+([A-Z0-9\-]+)\s+(.+?)\s+(\d+\.\d{4})\s+([A-Z]+)\s+([\d,]+\.\d+)\s+([\d\.]+)\s+([\d,]+\.\d+)\s+([\d,]+\.\d+)$",
                    linea
                )
                if match:
                    parte = match.group(2)
                    descripcion = match.group(3)
                    cantidad = match.group(4)
                    unidad = match.group(5)
                    precio_lista = try_float(match.group(6))
                    dto = match.group(7)
                    precio_costo = try_float(match.group(8))
                    precio_ext = try_float(match.group(9))
                    
                    # Unir líneas de descripción con límites más estrictos
                    desc_lines = [descripcion]
                    j = i + 1
                    while j < len(lineas):
                        sig = lineas[j].strip()
                        # Parar si encuentra:
                        if (not sig or  # Línea vacía
                            re.match(r"^\d+ [A-Z0-9\-]+ ", sig) or  # Siguiente producto
                            re.match(r"^SubTotal:", sig) or  # Totales
                            re.match(r"^I\.V\.A\.:", sig) or
                            re.match(r"^Total:", sig) or
                            "Cotización Página" in sig or  # Pie de página
                            "Av. Revolución" in sig or  # Direcciones
                            "A partir del" in sig or  # Políticas
                            "Los precios pueden cambiar" in sig or  # Políticas
                            "PORTENNTUM DE MEXICO" in sig or  # Información de empresa
                            "Politica de cargo" in sig or  # Políticas
                            "Información para pago" in sig or  # Info de pago
                            "Atentamente:" in sig or  # Cierre
                            "Banorte No." in sig or  # Info bancaria
                            "Bancomer Convenio" in sig):  # Info bancaria
                            break
                        desc_lines.append(sig)
                        j += 1
                    
                    descripcion = " ".join(desc_lines)
                    
                    # Mapear los campos al formato esperado por la aplicación (compatible con Syscom)
                    productos.append({
                        "cantidad": float(cantidad),
                        "unidad": unidad,
                        "codigo": parte,
                        "clave": parte,
                        "descripcion": descripcion,
                        "concepto": descripcion,
                        "marca": "",
                        "modelo": "",
                        "precioUnitario": precio_costo,
                        "precio": precio_costo,
                        "importe": precio_ext,
                        "total": precio_ext,
                        "precioLista": precio_lista,
                        "descuento": dto,
                        "alm": ""  # Portentum no maneja almacén como Syscom
                    })
                    i = j - 1  # Saltar las líneas de descripción ya procesadas
                # Fin de productos
                if "SubTotal:" in linea or "I.V.A.:" in linea or "Total:" in linea:
                    break
            i += 1

        resultado = {
            "folio": folio,
            "fecha": fecha,
            "datosFiscales": datos_fiscales,
            "rfc": rfc,
            "ejecutivo": ejecutivo,
            "email": email,
            "telefono": telefono,
            "fechaVencimiento": "",
            "formaPago": "POR DEFINIR",
            "usoMercancia": "G03 - GASTOS EN GENERAL",
            "metodoPago": "",
            "productos": productos,
            "totales": {
                "subTotal": sub_total if sub_total else 0,
                "iva": iva if iva else 0,
                "total": total if total else 0
            }
        }
        return resultado

def imprimir_resumen_productos(productos):
    """Imprime un resumen de los productos extraídos"""
    print(f"\n📊 RESUMEN DE EXTRACCIÓN:", file=sys.stderr)
    print(f"   Total productos extraídos: {len(productos)}", file=sys.stderr)
    
    productos_con_precio = sum(1 for p in productos if p.get('precioUnitario') is not None and p.get('precioUnitario') > 0)
    productos_sin_precio = len(productos) - productos_con_precio
    
    print(f"   Productos con precio: {productos_con_precio}", file=sys.stderr)
    print(f"   Productos sin precio: {productos_sin_precio}", file=sys.stderr)
    
    if productos_sin_precio > 0:
        print(f"\n   Productos sin precio:", file=sys.stderr)
        for p in productos:
            if not p.get('precioUnitario') or p.get('precioUnitario') <= 0:
                print(f"   - {p.get('codigo', 'N/A')}: {p.get('descripcion', 'N/A')[:50]}...", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("❌ ERROR: Se requiere la ruta del archivo PDF como argumento", file=sys.stderr)
        print("Uso: python extraer_datos_portentum.py <archivo_pdf>", file=sys.stderr)
        sys.exit(1)
    
    path_pdf = sys.argv[1]
    
    if not os.path.exists(path_pdf):
        print(f"❌ Error: El archivo {path_pdf} no existe", file=sys.stderr)
        sys.exit(1)
    
    try:
        datos = extraer_datos_portentum(path_pdf)
        
        # Imprimir resumen en stderr para debug
        imprimir_resumen_productos(datos["productos"])
        
        # Imprimir JSON en stdout para captura
        print(json.dumps(datos, indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(f"❌ ERROR al procesar el PDF: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)
