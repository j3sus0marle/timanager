#!/usr/bin/env python3
import pdfplumber
import re
import json
import sys
import os

def extraer_datos(path_pdf):
    with pdfplumber.open(path_pdf) as pdf:
        texto = "\n".join([p.extract_text() for p in pdf.pages if p.extract_text()])
    
    def buscar(pat):
        match = re.search(pat, texto, re.IGNORECASE | re.MULTILINE | re.DOTALL)
        return match.group(1).strip() if match else ""

    def buscar_numero(pat):
        match = re.search(pat, texto, re.IGNORECASE | re.MULTILINE)
        if match:
            valor = match.group(1).replace(",", "").replace("$", "").strip()
            try:
                return float(valor)
            except:
                return 0.0
        return 0.0

    datos_fiscales = ""
    match_datos = re.search(
        r"DATOS FISCALES\s*DATOS DE ENVÍO\s*([^\n]+?)\s*EMBARCAR", texto, re.MULTILINE
    )
    if match_datos:
        datos_fiscales = match_datos.group(1).strip()

    resultado = {
        "folio": buscar(r"FOLIO:\s*([^\n]+)"),
        "fecha": buscar(r"FECHA:\s*([^\n]+)"),
        "datosFiscales": datos_fiscales,
        "rfc": buscar(r"RFC:\s*([A-Z0-9]{10,13})"),
        "ejecutivo": buscar(r"EJECUTIVO VENTAS:\s*([^\n]+?)(?:\s+EMAIL|\s+OBSERVACIONES|$)"),
        "email": buscar(r"EMAIL:\s*([^\s]+)"),
        "fechaVencimiento": buscar(r"FECHA DE VENCIMIENTO:\s*([^\n]+?)(?:\s*\*|$)"),
        "formaPago": buscar(r"FORMA DE PAGO:\s*([^\n]+)"),
        "usoMercancia": buscar(r"USO DE\s+MC[ÍI]A\.?:?\s*([^\n]+)"),
        "metodoPago": buscar(r"M[ÉE]TODO DE PAGO:\s*([^\n]+)"),
        "productos": [],
        "totales": {
            "subTotal": buscar_numero(r"SUB-TOTAL\s*\$?\s*([\d,]+\.?\d*)"),
            "iva": buscar_numero(r"I\.V\.A\.\s*\$?\s*([\d,]+\.?\d*)"),
            "total": buscar_numero(r"(?<!SUB-)TOTAL\s*\$?\s*([\d,]+\.?\d*)")
        }
    }

    productos_extraidos = extraer_productos_avanzado(texto)
    resultado["productos"] = productos_extraidos

    return resultado

def extraer_productos_avanzado(texto):
    productos = []
    lineas = texto.split('\n')
    inicio_productos = -1
    fin_productos = -1
    for i, linea in enumerate(lineas):
        if re.search(r'CANT\s+UNIDAD\s+CÓDIGO\s+DESCRIPCIÓN', linea):
            inicio_productos = i + 1
        elif re.search(r'SUB-TOTAL', linea) and inicio_productos != -1:
            fin_productos = i
            break
    if inicio_productos == -1:
        return productos
    if fin_productos == -1:
        fin_productos = len(lineas)
    i = inicio_productos
    while i < fin_productos:
        linea = lineas[i].strip()
        match_producto = re.match(
            r'^(\d+)\s+(PIEZA|SERVICIO|KIT|BOBINA)\s+([A-Z0-9/\-\.\(\)]+)\s+(.+)', 
            linea
        )
        if match_producto:
            cantidad = match_producto.group(1)
            unidad = match_producto.group(2)
            codigo = match_producto.group(3)
            resto_linea = match_producto.group(4)
            descripcion, alm, precio_lista, precio_unitario, importe = procesar_producto_completo(
                resto_linea, lineas, i, fin_productos
            )
            producto = {
                "cantidad": cantidad,
                "unidad": unidad,
                "codigo": codigo,
                "descripcion": descripcion,
                "alm": alm,
                "precioLista": precio_lista,
                "precioUnitario": precio_unitario,
                "importe": importe,
            }
            productos.append(producto)
        i += 1
    return productos

def procesar_producto_completo(resto_linea, lineas, indice_actual, fin_productos):
    match_precios = re.search(
        r'([A-Z]{2,4})\s+([\d,]+\.\d{2})\s+[\d\.%\s]+\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})$', 
        resto_linea
    )
    if match_precios:
        alm = match_precios.group(1)
        precio_lista = try_float(match_precios.group(2))
        precio_unitario = try_float(match_precios.group(3))
        importe = try_float(match_precios.group(4))
        descripcion = resto_linea[:match_precios.start()].strip()
        return descripcion, alm, precio_lista, precio_unitario, importe
    descripcion = resto_linea
    alm = ""
    precio_lista = None
    precio_unitario = None
    importe = None
    j = indice_actual + 1
    while j < fin_productos and j < indice_actual + 5:
        siguiente_linea = lineas[j].strip()
        if re.match(r'^\d+\s+(?:PIEZA|SERVICIO|KIT|BOBINA)', siguiente_linea):
            break
        match_precios_siguiente = re.search(
            r'([A-Z]{2,4})\s+([\d,]+\.\d{2})\s+[\d\.%\s]+\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})$', 
            siguiente_linea
        )
        if match_precios_siguiente:
            alm = match_precios_siguiente.group(1)
            precio_lista = try_float(match_precios_siguiente.group(2))
            precio_unitario = try_float(match_precios_siguiente.group(3))
            importe = try_float(match_precios_siguiente.group(4))
            desc_adicional = siguiente_linea[:match_precios_siguiente.start()].strip()
            if desc_adicional and not re.search(r'Clave Producto:', desc_adicional):
                descripcion += " " + desc_adicional
            break
        else:
            if (siguiente_linea and 
                not re.search(r'Clave Producto:', siguiente_linea) and
                not re.search(r'^[A-Z]{2,4}\s+--', siguiente_linea) and
                not siguiente_linea.startswith('/')):
                descripcion += " " + siguiente_linea
        j += 1
    descripcion = limpiar_descripcion(descripcion)
    return descripcion, alm, precio_lista, precio_unitario, importe

def limpiar_descripcion(descripcion):
    descripcion = re.sub(r'Clave Producto:.*$', '', descripcion)
    descripcion = re.sub(r'/.*$', '', descripcion)
    descripcion = re.sub(r'\s+[A-Z]{2,4}\s+[\d,]+\.\d{2}\s+.*$', '', descripcion)
    descripcion = re.sub(r'\s+', ' ', descripcion)
    return descripcion.strip()

def try_float(valor):
    if not valor:
        return None
    try:
        return float(str(valor).replace(",", "").replace("$", "").strip())
    except:
        return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(1)
    archivo_pdf = sys.argv[1]
    if not os.path.exists(archivo_pdf):
        sys.exit(1)
    try:
        datos = extraer_datos(archivo_pdf)
        print(json.dumps(datos, indent=2, ensure_ascii=False))
    except Exception as e:
        sys.exit(1)