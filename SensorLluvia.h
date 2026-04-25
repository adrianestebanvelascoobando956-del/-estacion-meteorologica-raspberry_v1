#ifndef SENSOR_LLUVIA_H
#define SENSOR_LLUVIA_H

#include "SensorBase.h"

class SensorLluvia : public SensorBase {
public:
    SensorLluvia(int _pin) : SensorBase(_pin, "Lluvia") {}

    void inicializar() override {
        pinMode(pin, INPUT);
    }

    float leerDatos() override {
        return leerCantidad();
    }

    float leerCantidad() {
        long suma = 0;
        for (int i = 0; i < 10; i++) {
            suma += analogRead(pin);
            delay(10);
        }
        float raw = suma / 10.0;
        int porc = map(raw, 4095, 800, 0, 100);
        return constrain(porc, 0, 100);
    }

    bool detectarLluvia() {
        return leerCantidad() > 10;
    }
};

#endif
