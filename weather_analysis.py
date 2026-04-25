import mysql.connector
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import requests
import os
import math
from datetime import datetime
from dotenv import load_dotenv

# Configurar estilo de gráficas
sns.set_theme(style="whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)

# Cargar variables de entorno
# Intentar cargar desde el directorio actual o desde 'dashboard'
if not load_dotenv() and os.path.exists('dashboard/.env.local'):
    load_dotenv('dashboard/.env.local')
elif os.path.exists('.env'):
    load_dotenv('.env')
    
print(f"DEBUG: Trabajando en {os.getcwd()}")

class WeatherAnalysis:
    def __init__(self):
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', 'root'),
            'database': os.getenv('DB_NAME', 'iot_bd')
        }
        self.owm_api_key = os.getenv('OPENWEATHER_API_KEY')
        self.city = os.getenv('CITY_NAME', 'Popayan')
        self.country = os.getenv('COUNTRY_CODE', 'CO')
        self.wa_phone = os.getenv('WHATSAPP_PHONE')
        self.wa_apikey = os.getenv('WHATSAPP_API_KEY')

        # Definir ruta de reportes de forma absoluta
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.reports_dir = os.path.join(self.base_dir, "dashboard", "public", "reports")
        if not os.path.exists(self.reports_dir):
            os.makedirs(self.reports_dir, exist_ok=True)

    def get_db_connection(self):
        return mysql.connector.connect(**self.db_config)

    def calculate_dew_point(self, t, h):
        """Calcula el punto de rocío."""
        try:
            a, b = 17.625, 243.04
            alpha = ((a * t) / (b + t)) + math.log(h / 100.0)
            return (b * alpha) / (a - alpha)
        except: return None

    def calculate_heat_index(self, t, h):
        """Calcula la sensación térmica."""
        try:
            tf = (t * 9/5) + 32
            rh = h
            hi_f = -42.379 + 2.04901523*tf + 10.14333127*rh - 0.22475541*tf*rh \
                   - 0.00683783*tf**2 - 0.05481717*rh**2 + 0.00122874*tf**2*rh \
                   + 0.00085282*tf*rh**2 - 0.00000199*tf**2*rh**2
            return (hi_f - 32) * 5/9
        except: return None

    def send_whatsapp_alert(self, message):
        """Alerta vía CallMeBot con cooldown de 1 hora."""
        if not self.wa_phone or not self.wa_apikey: return
        
        # Sistema de Cooldown
        import time
        import json
        cooldown_file = os.path.join(self.base_dir, "last_alert.json")
        ahora = time.time()
        
        try:
            if os.path.exists(cooldown_file):
                with open(cooldown_file, 'r') as f:
                    data = json.load(f)
                    # Si han pasado menos de 3600 segundos (1 hora), no enviar
                    if ahora - data.get('timestamp', 0) < 3600:
                        print("Alerta silenciada por cooldown (1 hora).")
                        return
        except: pass

        url = f"https://api.callmebot.com/whatsapp.php?phone={self.wa_phone}&text={requests.utils.quote('⚠️ ALERTA: ' + message)}&apikey={self.wa_apikey}"
        try:
            requests.get(url)
            print("WhatsApp enviado.")
            # Guardar hora de última alerta
            with open(cooldown_file, 'w') as f:
                json.dump({'timestamp': ahora}, f)
        except: print("Error WhatsApp")

    def process_data(self):
        print("--- Iniciando Procesamiento ---")
        conn = self.get_db_connection()
        query = "SELECT * FROM lecturas ORDER BY fecha DESC"
        df = pd.read_sql(query, conn)
        conn.close()

        if df.empty:
            print("Base de datos vacía.")
            return

        df['fecha'] = pd.to_datetime(df['fecha'])
        df['punto_rocio'] = df.apply(lambda x: self.calculate_dew_point(x['temperatura'], x['humedad']), axis=1)
        df['sensacion_termica'] = df.apply(lambda x: self.calculate_heat_index(x['temperatura'], x['humedad']), axis=1)

        # Alertas
        latest = df.iloc[0]
        if latest['temperatura'] > 32: self.send_whatsapp_alert(f"Calor extremo: {latest['temperatura']:.1f}°C")
        if latest['lluvia'] > 40: self.send_whatsapp_alert("¡Alerta de lluvia fuerte!")

        self.export_to_excel(df)
        self.generate_charts(df)
        self.predict_weather(df)
        self.cleanup_old_reports()

    def predict_weather(self, df):
        """Analiza tendencias para predecir el clima en las próximas horas."""
        print("--- Analizando tendencias (Predicción) ---")
        if len(df) < 10: return
        
        # Obtener datos actuales y de hace 3 horas (aprox)
        actual = df.iloc[0]
        hace_3h = df.iloc[min(len(df)-1, 30)] # Asumiendo lecturas cada 5-6 min
        
        dif_presion = actual['presion'] - hace_3h['presion']
        dif_humedad = actual['humedad'] - hace_3h['humedad']
        
        prediccion = "Estable"
        icono = "☁️"
        
        if dif_presion < -1.5:
            prediccion = "Tormenta o lluvia fuerte probable"
            icono = "⛈️"
        elif dif_presion < -0.5 and dif_humedad > 5:
            prediccion = "Lluvia ligera probable"
            icono = "🌦️"
        elif dif_presion > 0.5:
            prediccion = "Tiempo despejado y estable"
            icono = "☀️"
            
        print(f"PREDICCIÓN: {icono} {prediccion}")
        
        # Si hay cambio brusco, avisar por WhatsApp
        if "Tormenta" in prediccion or "Lluvia" in prediccion:
            # Solo avisar si la presión bajó realmente rápido
            if dif_presion < -2.0:
                self.send_whatsapp_alert(f"Cambio brusco de presión ({dif_presion:.1f} hPa). {prediccion}")

    def cleanup_old_reports(self, days=7):
        """Borra archivos de reportes más viejos de X días para ahorrar espacio."""
        print(f"--- Limpiando reportes antiguos (> {days} días) ---")
        import time
        ahora = time.time()
        for f in os.listdir(self.reports_dir):
            file_path = os.path.join(self.reports_dir, f)
            if os.stat(file_path).st_mtime < ahora - (days * 86400):
                try:
                    os.remove(file_path)
                    print(f"Eliminado por espacio: {f}")
                except: pass

    def export_to_excel(self, df):
        meses_nombres = {
            1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 
            5: "Mayo", 6: "Junio", 7: "Julio", 8: "Agosto", 
            9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
        }
        ahora = datetime.now()
        nombre_mes = meses_nombres[ahora.month]
        timestamp = ahora.strftime('%d_%H%M')
        filename = os.path.join(self.reports_dir, f"Informe_{nombre_mes}_{timestamp}_MeteoPro.xlsx")
        
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            df['mes_año'] = df['fecha'].dt.strftime('%Y-%m')
            for mes in sorted(df['mes_año'].unique(), reverse=True):
                df[df['mes_año'] == mes].drop(columns=['mes_año']).to_excel(writer, sheet_name=mes, index=False)
        print(f"Excel guardado: {filename}")

    def generate_charts(self, df):
        plot_df = df.head(100).sort_values('fecha')
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        
        sns.lineplot(data=plot_df, x='fecha', y='temperatura', ax=axes[0,0], label='Temp', color='blue')
        sns.lineplot(data=plot_df, x='fecha', y='sensacion_termica', ax=axes[0,0], label='Sensación', color='orange')
        axes[0,0].set_title('Temperatura vs Sensación')
        
        sns.lineplot(data=plot_df, x='fecha', y='humedad', ax=axes[0,1], label='Hum %', color='green')
        sns.lineplot(data=plot_df, x='fecha', y='punto_rocio', ax=axes[0,1], label='Pto Rocío', color='cyan')
        axes[0,1].set_title('Humedad y Rocío')
        
        sns.barplot(data=plot_df, x='fecha', y='lluvia', ax=axes[1,0], color='blue', alpha=0.5)
        axes[1,0].set_title('Intensidad de Lluvia (%)')
        axes[1,0].set_xticks([])
        
        sns.lineplot(data=plot_df, x='fecha', y='uv', ax=axes[1,1], color='red')
        axes[1,1].set_title('Índice UV')

        plt.tight_layout()
        image_name = f"analisis_{datetime.now().strftime('%Y%m%d_%H%M')}.png"
        chart_path = os.path.join(self.reports_dir, image_name)
        plt.savefig(chart_path)
        plt.close()
        print(f"Gráfica guardada: {chart_path}")

if __name__ == "__main__":
    app = WeatherAnalysis()
    try:
        app.process_data()
    except Exception as e:
        print(f"ERROR: {e}")
