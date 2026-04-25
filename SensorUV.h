#ifndef SENSOR_UV_H
#define SENSOR_UV_H

#include "SensorBase.h"

class SensorUV : public SensorBase {
public:
    SensorUV(int _pin) : SensorBase(_pin, "ML8511") {}

    void inicializar() override {
        pinMode(pin, INPUT);
    }

    float leerDatos() override {
        return leerIndiceUV();
    }

    float leerIndiceUV() {
        long suma = 0;
        for (int i = 0; i < 10; i++) {
            suma += analogRead(pin);
            delay(10);
        }
        float raw = suma / 10.0;
        float vUV = raw * (3.3 / 4095.0);
        float uvIndex = (vUV - 0.99) * (15.0 / (2.8 - 0.99));
        if (uvIndex < 0) uvIndex = 0;
        return uvIndex;
    }
};

#endif
