# Diagramas de Bloques del Sistema Meteorológico

Este documento contiene la representación visual de la arquitectura, funciones y procesos de la estación meteorológica basada en ESP32.

## 1. Diagrama de Bloques de Sistema (Arquitectura)
Este diagrama muestra los componentes individuales de hardware y software y cómo interactúan entre sí. Enfocado en la **estructura detallada**.

```mermaid
graph TD
    subgraph Capa_Hardware ["Capa de Hardware (Sensing)"]
        DHT22[DHT22: Temp/Hum]
        BMP280[BMP280: Presión]
        RAIN[Sensor Lluvia]
        UV[Sensor UV ML8511]
        LUZ[Sensor Luz]
    end

    subgraph Capa_Control ["Capa de Control & Red"]
        ESP32[Microcontrolador ESP32]
        WIFI((Red Wi-Fi))
    end

    subgraph Capa_Servidor ["Capa de Servidor & Backend"]
        Broker[Broker MQTT]
        Bridge[Puente Node.js]
        DB[(MySQL Database)]
    end

    subgraph Capa_Usuario ["Capa de Visualización"]
        Web[Dashboard Next.js]
    end

    %% Conexiones Hardware
    DHT22 -->|Digital Pin 13| ESP32
    BMP280 -->|I2C SDA/SCL| ESP32
    RAIN -->|Analógico Pin 33| ESP32
    UV -->|Analógico Pin 35| ESP32
    LUZ -->|Analógico Pin 32| ESP32

    %% Conexiones Red
    ESP32 <-->|TCP/IP| WIFI
    WIFI <-->|Puerto 1883| Broker
    
    %% Conexiones Backend
    Broker <-->|Suscripción| Bridge
    Bridge -->|Consulta SQL| DB
    Web <-->|Fetch API| DB
```

---

## 2. Diagrama de Bloques Funcional
Este diagrama describe las **funciones o actividades principales** del sistema y el flujo de información entre ellas.

```mermaid
graph LR
    A[Adquisición de Datos] --> B[Procesamiento & Escalamiento]
    B --> C[Empaquetado JSON]
    C --> D[Transmisión MQTT]
    D --> E[Gestión de Persistencia]
    E --> F[Visualización en Tiempo Real]

    subgraph Actividades
        A1[Lectura Sensores] -.-> A
        B1[Cálculo de Índices] -.-> B
        D1[Publicación Topic] -.-> D
        E1[Inserción en DB] -.-> E
    end
```

---

## 3. Diagrama de Bloques de Procesos (Lógica)
Este diagrama visualiza los flujos de trabajo y pasos clave, actuando como un mapa del proceso de inicio a fin.

```mermaid
flowchart TD
    Start([Inicio]) --> Init[Inicializar Sensores & Serial]
    Init --> ConnectWiFi[Conectar a Wi-Fi]
    ConnectWiFi --> ConnectMQTT[Conectar a Broker MQTT]
    
    ConnectMQTT --> Loop{Inicio Loop}
    
    Loop --> MQTTCheck{¿Conectado MQTT?}
    MQTTCheck -- No --> Reconect[Intentar Reconexión] --> MQTTCheck
    MQTTCheck -- Si --> Timer{¿Pasaron 5 seg?}
    
    Timer -- No --> Loop
    Timer -- Si --> Read[Leer Sensores: T, H, P, UV...]
    
    Read --> Process[Escalar Valores & Filtrar]
    Process --> Build[Construir Cadena JSON]
    Build --> Publish[Publicar en 'estacion/datos']
    Publish --> Serial[Imprimir en Consola Serial]
    Serial --> Loop
```

---

## Sugerencias de Uso
- **Usa el Diagrama de Sistema** para documentar el cableado y la infraestructura.
- **Usa el Diagrama Funcional** para presentaciones de alto nivel sobre "qué hace" el sistema.
- **Usa el Diagrama de Procesos** para depurar o explicar la lógica de programación.
