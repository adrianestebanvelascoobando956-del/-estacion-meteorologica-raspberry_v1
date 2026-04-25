-- Script de Configuración para Estación Meteorológica
-- Abre este archivo en MySQL Workbench y ejecútalo (Rayo arriba a la izquierda)

CREATE DATABASE IF NOT EXISTS iot_bd;
USE iot_bd;

CREATE TABLE IF NOT EXISTS lecturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    temperatura FLOAT,
    humedad FLOAT,
    presion FLOAT,
    lluvia INT,
    lux FLOAT,
    uv FLOAT,
    uptime INT
);

-- Crear un usuario específico opcional (o usar root como indicaste)
-- CREATE USER 'clima_user'@'localhost' IDENTIFIED BY 'clima_pass';
-- GRANT ALL PRIVILEGES ON estacion_clima.* TO 'clima_user'@'localhost';

SELECT 'Base de datos configurada correctamente' AS Resultado;
