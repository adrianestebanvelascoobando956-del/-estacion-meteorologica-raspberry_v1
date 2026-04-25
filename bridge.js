const mqtt = require('mqtt');
const mysql = require('mysql2');

// --- CONFIGURACIÓN ---
const MQTT_BROKER = 'mqtt://broker.emqx.io';
const MQTT_TOPIC = 'estacion/mayerly_clima'; // Asegúrate de que en Arduino sea IGUAL
const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: 'root', 
    database: 'estacion_clima'
};

const db = mysql.createConnection(DB_CONFIG);
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
    console.log('🌍 CONECTADO AL BROKER PÚBLICO (Nube)');
    client.subscribe(MQTT_TOPIC);
});

// --- CONFIGURACIÓN DE ALERTAS Y AUTOMATIZACIÓN ---
let lastDataTime = Date.now();
const HEARTBEAT_TIMEOUT = 15 * 60 * 1000; // 15 minutos
const AUTO_ANALYSIS_INTERVAL = 6 * 60 * 60 * 1000; // 6 horas
let offlineAlertSent = false;

// Función para enviar alertas vía WhatsApp (CallMeBot)
async function sendWhatsAppAlert(message) {
    const phone = process.env.WHATSAPP_PHONE || 'TU_NUMERO';
    const apikey = process.env.WHATSAPP_API_KEY || 'TU_APIKEY';
    if (phone === 'TU_NUMERO') return;

    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent('⚠️ SISTEMA: ' + message)}&apikey=${apikey}`;
    try {
        await fetch(url);
        console.log('📢 Alerta enviada a WhatsApp');
    } catch (err) {
        console.log('❌ Error enviando WhatsApp (CallMeBot)');
    }
}

// Vigilante de Conexión (Heartbeat)
setInterval(() => {
    const now = Date.now();
    if (now - lastDataTime > HEARTBEAT_TIMEOUT && !offlineAlertSent) {
        sendWhatsAppAlert("La estación se encuentra FUERA DE LÍNEA. No se han recibido datos en 15 minutos.");
        offlineAlertSent = true;
        console.warn('⚠️ Estación fuera de línea detectada');
    }
}, 60000); // Revisar cada minuto

// Ejecutor Automático de Análisis
setInterval(() => {
    console.log('🤖 Iniciando análisis automático programado...');
    const { exec } = require('child_process');
    const path = require('path');
    const scriptPath = path.join(__dirname, 'weather_analysis.py');
    exec(`python "${scriptPath}"`, (err, stdout, stderr) => {
        if (err) console.error('❌ Error en análisis automático:', err);
        else console.log('✅ Análisis automático completado');
    });
}, AUTO_ANALYSIS_INTERVAL);

client.on('message', (topic, mensaje) => {
    try {
        const d = JSON.parse(mensaje.toString());
        console.log('📥 Dato recibido de la nube:', d);

        // Actualizar último pulso de vida
        lastDataTime = Date.now();
        if (offlineAlertSent) {
            sendWhatsAppAlert("✅ La estación ha vuelto a conectarse con éxito.");
            offlineAlertSent = false;
        }

        const query = `INSERT INTO lecturas 
            (temperatura, humedad, presion, lluvia, lux, uv) 
            VALUES (?, ?, ?, ?, ?, ?)`;
        
        const values = [
            d.temp || d.t || 0, d.hum || d.h || 0, 
            d.pres || d.p || 0, d.lluvia || d.ll || 0, 
            d.lux || d.lx || 0, d.uv || 0
        ];

        db.query(query, values, (err) => {
            if (err) console.error('❌ Error DB:', err.message);
            else console.log('💾 Guardado en MySQL local');
        });
    } catch (e) {
        console.error('Error JSON:', e.message);
    }
});

db.connect(err => {
    if (err) console.error('❌ Error MySQL:', err.message);
    else console.log('✅ Conectado a MySQL local');
});
