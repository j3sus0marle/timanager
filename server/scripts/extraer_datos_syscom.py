#!/usr/bin/env python3
"""
Script para extraer datos de PDFs de cotizaciones de SYScom
Versión específica para el proveedor SYScom
"""

import pdfplumber
import re
import json
import sys
import os

def extraer_datos(path_pdf):
    """Extrae datos de un PDF de cotización de SYScom"""
    with pdfplumber.open(path_pdf) as pdf:
        texto = "\n".join([p.extract_text() for p in pdf.pages if p.extract_text()])
        
        # ==== DATOS GENERALES ====
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

        # Buscar datos fiscales solo hasta la palabra EMBARCAR
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

        # ==== EXTRACCIÓN DE PRODUCTOS MEJORADA ====
        productos_extraidos = extraer_productos_avanzado(texto)
        resultado["productos"] = productos_extraidos
        
        # Validar productos extraídos
        errores = validar_productos(productos_extraidos)
        if errores:
            print("⚠️  ERRORES DE VALIDACIÓN ENCONTRADOS:", file=sys.stderr)
            for error in errores:
                print(f"   - {error}", file=sys.stderr)

        return resultado

def extraer_productos_avanzado(texto):
    """Extracción avanzada de productos con múltiples estrategias"""
    productos = []
    lineas = texto.split('\n')
    
    i = 0
    while i < len(lineas):
        linea = lineas[i].strip()
        
        # Patrón mejorado para detectar productos
        match_producto = re.match(
            r'^(\d+)\s+(PIEZA|SERVICIO|KIT|BOBINA)\s+([A-Z0-9/\-\.]+)\s+(.+)', 
            linea
        )
        
        if match_producto:
            cantidad = match_producto.group(1)
            unidad = match_producto.group(2)
            codigo = match_producto.group(3)
            resto_linea = match_producto.group(4)
            
            # Extraer información de la línea
            producto_info = procesar_linea_producto(resto_linea, lineas, i)
            
            # Buscar descripción completa en líneas siguientes
            descripcion_completa = extraer_descripcion_completa(lineas, i, codigo)
            
            producto = {
                "cantidad": cantidad,
                "unidad": unidad,
                "codigo": codigo,
                "descripcion": descripcion_completa,
                "alm": producto_info.get("alm", ""),
                "precioLista": producto_info.get("precio_lista"),
                "precioUnitario": producto_info.get("precio_unitario"),
                "importe": producto_info.get("importe"),
            }
            
            productos.append(producto)
        
        i += 1
    
    return productos

def procesar_linea_producto(resto_linea, lineas, indice_actual):
    """Procesa una línea de producto para extraer precios y almacén"""
    info = {
        "alm": "",
        "precio_lista": None,
        "precio_unitario": None,
        "importe": None
    }
    
    # Patrón 1: Productos CON precios
    # Formato: DESCRIPCION ALM PRECIO_LISTA DESCUENTOS% PRECIO_UNITARIO IMPORTE
    match_con_precios = re.search(
        r'([A-Z]{2,4})\s+([\d,]+\.\d{2})\s+[\d\.%\s]+\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})$', 
        resto_linea
    )
    
    if match_con_precios:
        info["alm"] = match_con_precios.group(1)
        info["precio_lista"] = try_float(match_con_precios.group(2))
        info["precio_unitario"] = try_float(match_con_precios.group(3))
        info["importe"] = try_float(match_con_precios.group(4))
        return info
    
    # Patrón 2: Productos SIN precios (con guiones)
    # Formato: DESCRIPCION ALM -- -- -- --
    match_sin_precios = re.search(r'([A-Z]{2,4})\s+--\s+--\s+--\s+--', resto_linea)
    if match_sin_precios:
        info["alm"] = match_sin_precios.group(1)
        return info
    
    # Patrón 3: Productos con almacén "--" pero CON precios
    # Formato: DESCRIPCION -- PRECIO_LISTA DESCUENTOS% PRECIO_UNITARIO IMPORTE
    match_alm_vacio = re.search(
        r'--\s+([\d,]+\.\d{2})\s+[\d\.%\s]+\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})$', 
        resto_linea
    )
    
    if match_alm_vacio:
        info["alm"] = "--"
        info["precio_lista"] = try_float(match_alm_vacio.group(1))
        info["precio_unitario"] = try_float(match_alm_vacio.group(2))
        info["importe"] = try_float(match_alm_vacio.group(3))
        return info
    
    return info

def extraer_descripcion_completa(lineas, indice_inicio, codigo):
    """Extrae la descripción completa del producto, incluyendo líneas adicionales"""
    linea_inicial = lineas[indice_inicio].strip()
    
    # Extraer descripción inicial (después del código)
    match_desc = re.search(rf'^\d+\s+(?:PIEZA|SERVICIO|KIT|BOBINA)\s+{re.escape(codigo)}\s+(.+)', linea_inicial)
    if not match_desc:
        return ""
    
    descripcion = match_desc.group(1)
    
    # Limpiar precios y códigos de la descripción inicial
    descripcion = limpiar_descripcion(descripcion)
    
    # Buscar líneas adicionales de descripción
    j = indice_inicio + 1
    max_lineas_busqueda = 4
    
    while j < len(lineas) and j < indice_inicio + max_lineas_busqueda:
        siguiente_linea = lineas[j].strip()
        
        # Parar si encontramos otro producto o totales
        if (re.match(r'^\d+\s+(?:PIEZA|SERVICIO|KIT|BOBINA)', siguiente_linea) or 
            re.match(r'^SUB-TOTAL', siguiente_linea) or
            not siguiente_linea):
            break
        
        # Verificar si es continuación de descripción
        if es_continuacion_descripcion(siguiente_linea):
            descripcion_adicional = limpiar_descripcion(siguiente_linea)
            if descripcion_adicional:
                descripcion += " " + descripcion_adicional
        
        j += 1
    
    return descripcion.strip()

def limpiar_descripcion(descripcion):
    """Limpia la descripción removiendo precios, códigos y metadatos"""
    # Remover patrones de precios al final
    descripcion = re.sub(r'\s+[A-Z]{2,4}\s+[\d,]+\.\d{2}\s+[\d\.%\s]+\s+[\d,]+\.\d{2}\s+[\d,]+\.\d{2}$', '', descripcion)
    descripcion = re.sub(r'\s+[A-Z]{2,4}\s+--\s+--\s+--\s+--$', '', descripcion)
    descripcion = re.sub(r'\s+--\s+[\d,]+\.\d{2}\s+[\d\.%\s]+\s+[\d,]+\.\d{2}\s+[\d,]+\.\d{2}$', '', descripcion)
    descripcion = re.sub(r'\s+Clave Producto:.*$', '', descripcion)
    descripcion = re.sub(r'\*\*.*?\*\*', '', descripcion)
    
    return descripcion.strip()

def es_continuacion_descripcion(linea):
    """Determina si una línea es continuación de la descripción del producto"""
    # No es continuación si contiene precios
    if re.search(r'[\d,]+\.\d{2}', linea):
        return False
    
    # No es continuación si contiene códigos de producto
    if re.search(r'Clave Producto:', linea):
        return False
    
    # No es continuación si contiene solo guiones
    if re.match(r'^--\s+--\s+--\s+--', linea):
        return False
    
    # No es continuación si empieza con almacén seguido de precios o guiones
    if re.match(r'^[A-Z]{2,4}\s+(?:[\d,]+\.\d{2}|--)', linea):
        return False
    
    # Es continuación si contiene texto descriptivo
    if re.search(r'[a-zA-Z]', linea) and not re.search(r'^\s*[A-Z]{2,4}\s+', linea):
        return True
    
    return False

def validar_productos(productos):
    """Valida que los productos estén correctamente extraídos"""
    errores = []
    
    for i, prod in enumerate(productos, 1):
        # Validar campos obligatorios
        if not prod.get('cantidad'):
            errores.append(f"Producto {i} ({prod.get('codigo', 'sin código')}): Cantidad faltante")
        
        if not prod.get('codigo'):
            errores.append(f"Producto {i}: Código faltante")
        
        if not prod.get('descripcion') or len(prod['descripcion']) < 5:
            errores.append(f"Producto {i} ({prod.get('codigo', 'sin código')}): Descripción faltante o muy corta")
        
        # Validar cantidad numérica
        try:
            cantidad = float(prod.get('cantidad', 0))
            if cantidad <= 0:
                errores.append(f"Producto {i} ({prod.get('codigo', 'sin código')}): Cantidad no válida")
        except ValueError:
            errores.append(f"Producto {i} ({prod.get('codigo', 'sin código')}): Cantidad no es numérica")
        
        # Validar precios si existen
        for campo_precio in ['precioLista', 'precioUnitario', 'importe']:
            valor = prod.get(campo_precio)
            if valor is not None:
                try:
                    if float(valor) < 0:
                        errores.append(f"Producto {i} ({prod.get('codigo', 'sin código')}): {campo_precio} negativo")
                except (ValueError, TypeError):
                    errores.append(f"Producto {i} ({prod.get('codigo', 'sin código')}): {campo_precio} no numérico")
    
    return errores

def try_float(valor):
    """Convierte un valor a float, manejando errores"""
    if not valor:
        return None
    try:
        return float(str(valor).replace(",", "").replace("$", "").strip())
    except:
        return None

def imprimir_resumen_productos(productos):
    """Imprime un resumen de los productos extraídos"""
    print(f"\n📊 RESUMEN DE EXTRACCIÓN:", file=sys.stderr)
    print(f"   Total productos extraídos: {len(productos)}", file=sys.stderr)
    
    productos_con_precio = sum(1 for p in productos if p.get('precioUnitario') is not None)
    productos_sin_precio = len(productos) - productos_con_precio
    
    print(f"   Productos con precio: {productos_con_precio}", file=sys.stderr)
    print(f"   Productos sin precio: {productos_sin_precio}", file=sys.stderr)
    
    if productos_sin_precio > 0:
        print(f"\n   Productos sin precio:", file=sys.stderr)
        for p in productos:
            if p.get('precioUnitario') is None:
                print(f"   - {p.get('codigo', 'N/A')}: {p.get('descripcion', 'N/A')[:50]}...", file=sys.stderr)

# === EJECUCIÓN ===
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python extraer_datos_syscom.py <archivo_pdf>", file=sys.stderr)
        sys.exit(1)
    
    archivo_pdf = sys.argv[1]
    
    if not os.path.exists(archivo_pdf):
        print(f"❌ Error: El archivo {archivo_pdf} no existe", file=sys.stderr)
        sys.exit(1)
    
    try:
        datos = extraer_datos(archivo_pdf)
        
        # Imprimir resumen en stderr para debug
        imprimir_resumen_productos(datos["productos"])
        
        # Imprimir JSON en stdout para captura
        print(json.dumps(datos, indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(f"❌ Error al procesar el PDF: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)
