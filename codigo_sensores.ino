#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <Adafruit_BMP280.h>

// --- CONFIGURACIÓN WI-FI Y MQTT ---
const char* WIFI_SSID = "Estacion-Pi";
const char* WIFI_PASSWORD = "ChangeMe";
const char* MQTT_SERVER = "192.168.18.1"; 
const int MQTT_PORT = 1883;
const char* MQTT_TOPIC = "estacion/mayerly_clima"; 
const char* MQTT_CLIENT_ID = "Estacion_Meteorologica_ESP32";


// --- PINES ---
#define PIN_LLUVIA    33   
#define PIN_UV_8511   35
#define PIN_LUZ_6000  32   
#define DHTPIN        13   
#define DHTTYPE       DHT22

WiFiClient espClient;
PubSubClient mqttClient(espClient);
DHT dht(DHTPIN, DHTTYPE);
Adafruit_BMP280 bmp; 

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- INICIANDO ESTACION CALIBRADA ---");

  mqttClient.setBufferSize(512);
  Wire.begin(); 
  dht.begin();

  if (!bmp.begin(0x76)) { 
    bmp.begin(0x77); 
  }
  
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,     
                  Adafruit_BMP280::SAMPLING_X2,     
                  Adafruit_BMP280::SAMPLING_X16,    
                  Adafruit_BMP280::FILTER_X16,      
                  Adafruit_BMP280::STANDBY_MS_500); 

  Serial.print("Conectando a WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Conectado!");
  Serial.print("Mi IP es: ");
  Serial.println(WiFi.localIP());

  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
}

void loop() {
  if (!mqttClient.connected()) {
    Serial.print("Intentando MQTT...");
    if (mqttClient.connect(MQTT_CLIENT_ID)) {
      Serial.println("¡CONECTADO!");
    } else {
      Serial.print("Fallo rc=");
      Serial.print(mqttClient.state());
      Serial.println(" reintentando en 5s...");
      delay(5000);
      return; 
    }
  }
  mqttClient.loop();

  static unsigned long lastTime = 0;
  if (millis() - lastTime > 5000) {
    lastTime = millis();
    
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    float p = bmp.readPressure() / 100.0F; 

    if (isnan(h)) h = 0; 
    if (isnan(t)) t = 0; 
    if (p < 300 || p > 1200) p = 0; 

    // --- LECTURA CALIBRADA DE LLUVIA ---
    int rawLluvia = analogRead(PIN_LLUVIA);
    delay(50);
    
    // Cambiamos el rango: de 3500 (seco) a 800 (muy mojado)
    // Esto ignora el ruido entre 3500 y 4095
    int porcLluvia = map(rawLluvia, 3500, 800, 0, 100);
    porcLluvia = constrain(porcLluvia, 0, 100);
    
    // Umbral de seguridad: si es menos del 15%, forzamos a 0
    if (porcLluvia < 15) porcLluvia = 0;

    int rawUV = analogRead(PIN_UV_8511);
    delay(50);
    int rawLuz = analogRead(PIN_LUZ_6000);

    float vUV = rawUV * (3.3 / 4095.0);
    float indiceUV = (vUV - 1.0) * (10.0 / 1.8);
    if (indiceUV < 0) indiceUV = 0;

    char msg[250];
    snprintf(msg, sizeof(msg),
             "{\"temp\":%.1f,\"hum\":%.1f,\"pres\":%.1f,\"lluvia\":%d,\"lux\":%d,\"uv\":%.1f}",
             t, h, p, porcLluvia, rawLuz, indiceUV);

    if (mqttClient.publish(MQTT_TOPIC, msg)) {
      Serial.print("Enviado: ");
      Serial.println(msg);
    } else {
      Serial.println("Error al publicar en MQTT");
    }
  }
}
