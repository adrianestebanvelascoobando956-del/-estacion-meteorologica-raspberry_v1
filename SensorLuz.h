#ifndef SENSOR_LUZ_H
#define SENSOR_LUZ_H

#include "SensorBase.h"

class SensorLuz : public SensorBase {
public:
    SensorLuz(int _pin) : SensorBase(_pin, "TEMT6000") {}

    void inicializar() override {
        pinMode(pin, INPUT);
    }

    float leerDatos() override {
        return leerIrradiancia();
    }

    float leerIrradiancia() {
        long suma = 0;
        for (int i = 0; i < 10; i++) {
            suma += analogRead(pin);
            delay(10);
        }
        float raw = suma / 10.0;
        float vLuz = raw * (3.3 / 4095.0);
        return vLuz * 200.0; // Lux
    }
};

#endif
