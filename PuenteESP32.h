#ifndef PUENTE_ESP32_H
#define PUENTE_ESP32_H

#include <vector>
#include "SensorBase.h"
#include "SensorDHT.h"
#include "SensorBMP.h"
#include "SensorUV.h"
#include "SensorLuz.h"
#include "SensorLluvia.h"

class PuenteESP32 {
private:
    std::vector<SensorBase*> listaSensores;
    SensorDHT* dhtS;
    SensorBMP* bmpS;
    SensorUV* uvS;
    SensorLuz* luzS;
    SensorLluvia* lluviaS;

public:
    PuenteESP32() {
        dhtS = new SensorDHT(13);
        bmpS = new SensorBMP();
        uvS = new SensorUV(35);
        luzS = new SensorLuz(32);
        lluviaS = new SensorLluvia(33);

        listaSensores.push_back(dhtS);
        listaSensores.push_back(bmpS);
        listaSensores.push_back(uvS);
        listaSensores.push_back(luzS);
        listaSensores.push_back(lluviaS);
    }

    void inicializarTodo() {
        for (auto s : listaSensores) {
            s->inicializar();
        }
    }

    String recogerTodos() {
        float t = dhtS->leerTemperatura();
        float h = dhtS->leerHumedad();
        float p = bmpS->leerPresion();
        float uv = uvS->leerIndiceUV();
        float lx = luzS->leerIrradiancia();
        int ll = (int)lluviaS->leerCantidad();
        unsigned long up = millis() / 1000;

        char msg[300];
        snprintf(msg, sizeof(msg),
                 "{\"t\":%.1f,\"h\":%.1f,\"p\":%.1f,\"ll\":%d,\"lx\":%.1f,\"uv\":%.1f,\"up\":%lu}",
                 t, h, p, ll, lx, uv, up);
        return String(msg);
    }

    bool validarLecturas() {
        // Lógica simple de validación
        return true; 
    }
};

#endif
