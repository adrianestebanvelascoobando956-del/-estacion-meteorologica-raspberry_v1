# Plan de Implementación: Herramienta de Análisis Profesional en Python

Este plan describe la creación de un script de Python independiente para potenciar la estación meteorológica con análisis avanzado, exportación organizada y alertas inteligentes.

## User Review Required

> [!IMPORTANT]
> Necesitarás obtener las siguientes credenciales para que el sistema funcione completamente:
> 1. **OpenWeatherMap API Key**: Para la comparativa externa (gratuita).
> 2. **Telegram Bot Token**: Para el sistema de alertas.
> 3. **Instalar Python y librerías**: Ejecutar `pip install mysql-connector-python pandas matplotlib seaborn openpyxl requests python-dotenv`.

## Proposed Changes

### [NEW] weather_analysis.py (file:///c:/Users/Mayerly%20Rivera/Downloads/codigo_sensores/weather_analysis.py)
Un script centralizado que realizará:
1.  **Carga de Datos**: Conexión a MySQL y carga de la tabla `lecturas`.
2.  **Cálculos Meteorológicos**:
    *   **Punto de Rocío**: Usando la fórmula de Magnus.
    *   **Sensación Térmica (Heat Index)**: Usando el algoritmo de la NWS.
3.  **Exportación a Excel**: 
    *   Separación de datos por mes.
    *   Cada mes en una hoja (Tab) diferente.
4.  **Sistema de Alertas**: 
    *   Función para enviar mensajes a Telegram si los valores exceden límites.
5.  **Comparativa API**: 
    *   Consulta a OpenWeatherMap y comparación con sensores locales.
6.  **Visualización**: 
    *   Gráficas profesionales con Seaborn guardadas en una carpeta `reports/`.

### [MODIFY] .env (file:///c:/Users/Mayerly%20Rivera/Downloads/codigo_sensores/.env)
Añadir variables de entorno para las API Keys y credenciales de BD para no exponerlas en el código.

## Verification Plan

### Manual Verification
1.  Ejecutar `python weather_analysis.py`.
2.  Verificar que se cree el archivo `reporte_clima.xlsx` con las hojas por mes.
3.  Verificar que se generen las gráficas en la carpeta `reports/`.
4.  Confirmar recepción de alerta en Telegram al forzar un valor límite.
5.  Verificar en consola la comparación entre el sensor local y la API externa.
