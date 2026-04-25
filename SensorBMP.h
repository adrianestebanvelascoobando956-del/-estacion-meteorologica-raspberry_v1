#ifndef SENSOR_BMP_H
#define SENSOR_BMP_H

#include "SensorBase.h"
#include <Adafruit_BMP280.h>

class SensorBMP : public SensorBase {
private:
    Adafruit_BMP280 bmp;
    float presion;

public:
    SensorBMP() : SensorBase(0, "BMP280") {} // I2C doesn't need a single pin in the same way

    void inicializar() override {
        if (!bmp.begin(0x76)) {
            bmp.begin(0x77);
        }
    }

    float leerDatos() override {
        return leerPresion();
    }

    float leerPresion() {
        presion = bmp.readPressure() / 100.0F;
        return presion;
    }

    float leerAltitud() {
        return bmp.readAltitude(1013.25);
    }
};

#endif
