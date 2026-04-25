#ifndef SENSOR_DHT_H
#define SENSOR_DHT_H

#include "SensorBase.h"
#include <DHT.h>

class SensorDHT : public SensorBase {
private:
    DHT dht;
    float temperatura;
    float humedad;

public:
    SensorDHT(int _pin) : SensorBase(_pin, "DHT22"), dht(_pin, DHT22) {}

    void inicializar() override {
        dht.begin();
    }

    float leerDatos() override {
        float t = leerTemperatura();
        if (isnan(t)) return 0;
        return t;
    }

    float leerTemperatura() {
        temperatura = dht.readTemperature();
        return temperatura;
    }

    float leerHumedad() {
        humedad = dht.readHumidity();
        return humedad;
    }
};

#endif
