import pdfplumber
import re
import sys
import subprocess
import json
import os

# Configurar la codificación de salida para evitar problemas en Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def detectar_formato_portentum(archivo_pdf):
    """
    Detecta automáticamente el formato de cotización de Portentum
    Retorna: 'clasico', 'aruba' o 'desconocido'
    """
    try:
        with pdfplumber.open(archivo_pdf) as pdf:
            texto_completo = ""
            # Solo necesitamos las primeras páginas para detectar
            for page in pdf.pages[:2]:  
                texto_completo += page.extract_text() + "\n"
        
        # Indicadores del formato Aruba (más específicos)
        indicadores_aruba = [
            r'Folio:\s*\w+',                    # Campo "Folio:"
            r'Elaborado por:',                  # Campo "Elaborado por:"
            r'P\.Venta Canal',                  # Total "P.Venta Canal"
            r'\*\w+\s+\d+\s+[A-Z0-9\-]+',     # Productos con asterisco
            r'Concepto\s+Cantidad\s+No\.\s+De\s+Parte'  # Headers específicos
        ]
        
        # Indicadores del formato Clásico
        indicadores_clasico = [
            r'Cot\.\s*\d+',                    # Campo "Cot."
            r'Linea\s+Parte\s+Descripción',    # Headers específicos
            r'% Dto\.',                        # Columna "% Dto."
            r'Precio costo',                   # Columna "Precio costo"
            r'U/M'                             # Columna "U/M"
        ]
        
        puntos_aruba = sum(1 for patron in indicadores_aruba if re.search(patron, texto_completo, re.IGNORECASE))
        puntos_clasico = sum(1 for patron in indicadores_clasico if re.search(patron, texto_completo, re.IGNORECASE))
        
        if puntos_aruba >= 3:
            return 'aruba'
        elif puntos_clasico >= 3:
            return 'clasico'
        else:
            return 'desconocido'
            
    except Exception as e:
        return f'error: {str(e)}'

def ejecutar_script_formato(archivo_pdf, formato):
    """
    Ejecuta el script correspondiente según el formato detectado
    """
    try:
        # Obtener el directorio del script actual
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        if formato == 'aruba':
            script_path = os.path.join(script_dir, 'extraer_datos_portenntum_aruba.py')
        elif formato == 'clasico':
            script_path = os.path.join(script_dir, 'extraer_datos_portenntum.py')
        else:
            return {"error": f"Formato no soportado: {formato}"}
        
        # Verificar que el script existe
        if not os.path.exists(script_path):
            return {"error": f"Script no encontrado: {script_path}"}
        
        # Ejecutar el script correspondiente con manejo mejorado de codificación
        result = subprocess.run(
            ['python', script_path, archivo_pdf], 
            capture_output=True, 
            text=True, 
            encoding='utf-8',
            errors='replace'  # Reemplaza caracteres problemáticos
        )
        
        if result.returncode == 0:
            # Intentar parsear como JSON
            try:
                return json.loads(result.stdout)
            except json.JSONDecodeError:
                return {"output": result.stdout.strip()}
        else:
            return {"error": f"Error ejecutando script: {result.stderr}"}
            
    except Exception as e:
        return {"error": f"Error: {str(e)}"}

def main():
    if len(sys.argv) != 2:
        print("Uso: python script_auto_portenntum.py archivo.pdf")
        sys.exit(1)
    
    archivo_pdf = sys.argv[1]
    
    # Detectar formato
    formato = detectar_formato_portentum(archivo_pdf)
    
    if formato.startswith('error'):
        print(json.dumps({"error": formato}, indent=2, ensure_ascii=True))
        sys.exit(1)
    
    if formato == 'desconocido':
        print(json.dumps({"error": "Formato de PDF no reconocido"}, indent=2, ensure_ascii=True))
        sys.exit(1)
    
    # Ejecutar script correspondiente
    resultado = ejecutar_script_formato(archivo_pdf, formato)
    
    # Agregar metadata del formato detectado
    if isinstance(resultado, dict) and 'error' not in resultado:
        resultado['_metadata'] = {
            'formato_detectado': formato,
            'procesado_con': f'script_{formato}.py'
        }
    
    # Usar ensure_ascii=True para evitar problemas de codificación
    print(json.dumps(resultado, indent=2, ensure_ascii=True))

if __name__ == "__main__":
    main()