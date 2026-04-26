const mqtt = require('mqtt');
const mysql = require('mysql2');

// --- CONFIGURACIÓN ---
const MQTT_BROKER = 'mqtt://192.168.18.1';
const MQTT_TOPIC = 'estacion/mayerly_clima';

// Usar pool en lugar de createConnection para reconexión automática
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'iot_bd',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

// Verificar conexión al arrancar
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
        console.error('   Verifica: host, usuario, contraseña y que el servicio MySQL esté activo.');
    } else {
        console.log('✅ Conectado a MySQL local (pool activo)');
        connection.release();
    }
});

const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
    console.log('🌍 CONECTADO AL BROKER LOCAL (Raspberry Pi)');
    console.log('   Broker URL:', MQTT_BROKER);
    client.subscribe(MQTT_TOPIC, (err) => {
        if (err) console.error('❌ Error suscribiéndose al topic:', err.message);
        else console.log(`📡 Suscrito al topic: ${MQTT_TOPIC}`);
    });
});

client.on('error', (err) => {
    console.error('❌ Error MQTT:', err.message);
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
}, 60000);

// Ejecutor Automático de Análisis
setInterval(() => {
    console.log('🤖 Iniciando análisis automático programado...');
    const { exec } = require('child_process');
    const path = require('path');
    const scriptPath = path.join(__dirname, 'weather_analysis.py');
    exec(`python3 "${scriptPath}"`, (err, stdout, stderr) => {
        if (err) console.error('❌ Error en análisis automático:', err.message);
        else console.log('✅ Análisis automático completado');
    });
}, AUTO_ANALYSIS_INTERVAL);

client.on('message', (topic, mensaje) => {
    try {
        const raw = mensaje.toString();
        const d = JSON.parse(raw);
        console.log('📥 Dato recibido de la nube:', JSON.stringify(d));

        // Actualizar último pulso de vida
        lastDataTime = Date.now();
        if (offlineAlertSent) {
            sendWhatsAppAlert("✅ La estación ha vuelto a conectarse con éxito.");
            offlineAlertSent = false;
        }

        const temperatura = d.temp  ?? d.t  ?? null;
        const humedad     = d.hum   ?? d.h  ?? null;
        const presion     = d.pres  ?? d.p  ?? null;
        const lluvia      = d.lluvia ?? d.ll ?? null;
        const lux         = d.lux   ?? d.lx ?? null;
        const uv          = d.uv    ?? null;

        console.log(`   → temp=${temperatura} hum=${humedad} pres=${presion} lluvia=${lluvia} lux=${lux} uv=${uv}`);

        const query = `INSERT INTO lecturas (temperatura, humedad, presion, lluvia, lux, uv) VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [temperatura, humedad, presion, lluvia, lux, uv];

        console.log('🚀 Intentando guardar en DB...');
        db.query(query, values, (err, result) => {
            if (err) {
                console.error('❌ Error al guardar en MySQL:', err.message);
                console.error('   Valores:', JSON.stringify(values));
                console.error('   Código:', err.code, '| SQL State:', err.sqlState);
            } else {
                console.log(`💾 Guardado en MySQL OK (insertId: ${result.insertId})`);
            }
        });

    } catch (e) {
        console.error('❌ Error parseando JSON:', e.message);
        console.error('   Mensaje raw:', mensaje.toString());
    }
});
