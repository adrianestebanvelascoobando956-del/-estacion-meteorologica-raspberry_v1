#ifndef SENSOR_BASE_H
#define SENSOR_BASE_H

#include <Arduino.h>

class SensorBase {
protected:
    int pin;
    String tipo;
    float ultimoError = 0;

public:
    SensorBase(int _pin, String _tipo) : pin(_pin), tipo(_tipo) {}
    virtual ~SensorBase() {}

    virtual void inicializar() = 0;
    virtual float leerDatos() = 0; // Para sensores de un solo valor
    
    float obtenerError() { return ultimoError; }
    virtual void calibrar() {
        // Lógica de calibración base
    }

    String getTipo() { return tipo; }
};

#endif
