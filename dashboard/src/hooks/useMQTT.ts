import { useState, useEffect } from 'react';
import mqtt from 'mqtt';

const MQTT_URL = 'wss://broker.emqx.io:8084/mqtt'; // EMQX Public WebSocket
const TOPIC = 'estacion/mayerly_clima';

export const useMQTT = () => {
    const [data, setData] = useState<any>(null);
    const [status, setStatus] = useState('connecting');

    useEffect(() => {
        const client = mqtt.connect(MQTT_URL);

        client.on('connect', () => {
            setStatus('connected');
            client.subscribe(TOPIC);
        });

        client.on('message', (topic, message) => {
            try {
                const parsed = JSON.parse(message.toString());
                setData(parsed);
            } catch (e) {
                console.error('Error parsing MQTT message:', e);
            }
        });

        client.on('error', (err) => {
            console.error('MQTT connection error:', err);
            setStatus('error');
        });

        client.on('close', () => {
            setStatus('disconnected');
        });

        return () => {
            if (client) {
                client.end(true);
            }
        };
    }, []);

    return { data, status };
};
