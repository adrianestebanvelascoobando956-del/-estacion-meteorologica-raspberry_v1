'use client';

import React from 'react';
import { Settings, Shield, Beaker, Server, Database } from 'lucide-react';

export default function AjustesPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="border-b border-white/5 pb-8">
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Configuración del Sistema</h2>
                <p className="text-gray-400">Administra los parámetros de tu estación y la conexión con la base de datos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Database Settings */}
                <div className="glass p-8 space-y-6">
                    <div className="flex items-center gap-3 text-cyan-400">
                        <Database size={24} />
                        <h3 className="text-xl font-bold text-white">Base de Datos (MySQL)</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-mono block mb-2">Host del Servidor</label>
                            <input type="text" disabled value="localhost" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-mono block mb-2">Nombre de la Base de Datos</label>
                            <input type="text" disabled value="estacion_clima" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm" />
                        </div>
                        <p className="text-[10px] text-gray-600 italic">La configuración de la base de datos se maneja internamente para conectar con XAMPP.</p>
                    </div>
                </div>

                {/* Calibration Settings */}
                <div className="glass p-8 space-y-6">
                    <div className="flex items-center gap-3 text-orange-400">
                        <Beaker size={24} />
                        <h3 className="text-xl font-bold text-white">Calibración de Sensores</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg">
                            <div>
                                <h4 className="text-sm font-bold text-white">Offset Temperatura</h4>
                                <p className="text-xs text-gray-500">Ajustar lectura ambiental</p>
                            </div>
                            <span className="text-orange-400 font-mono">+0.5 °C</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg">
                            <div>
                                <h4 className="text-sm font-bold text-white">Factor de Lluvia</h4>
                                <p className="text-xs text-gray-500">Sensibilidad del sensor</p>
                            </div>
                            <span className="text-orange-400 font-mono">1.2x</span>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="glass p-8 space-y-6 md:col-span-2">
                    <div className="flex items-center gap-3 text-purple-400">
                        <Server size={24} />
                        <h3 className="text-xl font-bold text-white">Información del Sistema</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-black/20 rounded-lg border border-white/5 text-center">
                            <span className="text-[10px] text-gray-500 block">VERSION ESP32</span>
                            <span className="text-sm font-bold text-white uppercase">v2.0 (OO Mode)</span>
                        </div>
                        <div className="p-4 bg-black/20 rounded-lg border border-white/5 text-center">
                            <span className="text-[10px] text-gray-500 block">BROKER</span>
                            <span className="text-sm font-bold text-white uppercase underline decoration-purple-500">MOSQUITTO</span>
                        </div>
                        <div className="p-4 bg-black/20 rounded-lg border border-white/5 text-center">
                            <span className="text-[10px] text-gray-500 block">INTERFAZ</span>
                            <span className="text-sm font-bold text-white uppercase">NEXT.JS 15</span>
                        </div>
                        <div className="p-4 bg-black/20 rounded-lg border border-white/5 text-center">
                            <span className="text-[10px] text-gray-500 block">SQL ENGINE</span>
                            <span className="text-sm font-bold text-white uppercase">MARIADB (XAMPP)</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Shield className="text-blue-400" size={20} />
                <p className="text-blue-200/60 text-xs">
                    Los cambios en la calibración deben ser reflejados directamente en el código del ESP32 para mayor precisión en origen.
                </p>
            </div>
        </div>
    );
}
