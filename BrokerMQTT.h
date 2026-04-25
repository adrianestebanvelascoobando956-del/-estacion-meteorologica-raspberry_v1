#ifndef BROKER_MQTT_H
#define BROKER_MQTT_H

#include <WiFi.h>
#include <PubSubClient.h>

class BrokerMQTT {
private:
    WiFiClient espClient;
    PubSubClient client;
    const char* server;
    int port;
    const char* clientId;

public:
    BrokerMQTT(const char* _server, int _port, const char* _clientId) 
        : client(espClient), server(_server), port(_port), clientId(_clientId) {}

    void inicializar() {
        client.setServer(server, port);
        client.setBufferSize(512);
    }

    void conectar() {
        while (!client.connected()) {
            Serial.print("Intentando conexión MQTT...");
            if (client.connect(clientId)) {
                Serial.println("conectado");
            } else {
                Serial.print("falló, rc=");
                Serial.print(client.state());
                delay(5000);
            }
        }
    }

    void loop() {
        if (!client.connected()) {
            conectar();
        }
        client.loop();
    }

    void publicar(const char* tema, String datos) {
        client.publish(tema, datos.c_str());
    }
};

#endif
