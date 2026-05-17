'use client';

import React from 'react';
import { 
    Settings, 
    Shield, 
    Beaker, 
    Server, 
    Database, 
    Cpu,
    Wifi,
    ChevronRight,
    Home,
    AlertCircle
} from 'lucide-react';

export default function AjustesPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#e2e5e8] pb-6">
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight">Configuración del Sistema</h2>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                        <Home size={10} />
                        <span>Panel</span>
                        <ChevronRight size={10} />
                        <span className="text-cyan-500">Ajustes</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-[#f8f9fa] border border-[#e2e5e8] px-4 py-2 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-600 uppercase">Sistema en línea</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Database Settings */}
                <div className="card-professional p-6 border-t-4 border-cyan-500 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Database size={20} className="text-cyan-500" />
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Base de Datos (MySQL)</h3>
                        </div>
                        <p className="text-[11px] text-gray-400 mb-6 font-medium">Configuración del motor de almacenamiento relacional</p>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Host del Servidor</label>
                                <input 
                                    type="text" 
                                    disabled 
                                    value="127.0.0.1 (Localhost)" 
                                    className="w-full bg-[#f8f9fa] border border-[#e2e5e8] rounded-lg px-4 py-2.5 text-gray-600 font-mono text-sm shadow-sm" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Nombre de la Base de Datos</label>
                                <input 
                                    type="text" 
                                    disabled 
                                    value="iot_bd" 
                                    className="w-full bg-[#f8f9fa] border border-[#e2e5e8] rounded-lg px-4 py-2.5 text-gray-600 font-mono text-sm shadow-sm" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calibration Settings */}
                <div className="card-professional p-6 border-t-4 border-orange-500 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Beaker size={20} className="text-orange-500" />
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Calibración de Sensores</h3>
                        </div>
                        <p className="text-[11px] text-gray-400 mb-6 font-medium">Parámetros de ajuste y tolerancia de lectura del ESP32</p>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-[#f8f9fa] border border-[#e2e5e8] p-4 rounded-xl">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-800">Offset de Temperatura</h4>
                                    <p className="text-[10px] text-gray-400">Ajuste de resistencia térmica</p>
                                </div>
                                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-xs font-black">+0.5 °C</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#f8f9fa] border border-[#e2e5e8] p-4 rounded-xl">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-800">Sensibilidad de Lluvia</h4>
                                    <p className="text-[10px] text-gray-400">Umbral de placa LDR</p>
                                </div>
                                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-xs font-black">1.2x</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="card-professional p-6 border-t-4 border-purple-500 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        <Server size={20} className="text-purple-500" />
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Hardware e Infraestructura</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-[#f8f9fa] border border-[#e2e5e8] rounded-xl flex flex-col items-center justify-center text-center">
                            <Cpu size={24} className="text-gray-400 mb-2" />
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Microcontrolador</span>
                            <span className="text-xs font-black text-gray-800 uppercase">ESP32 (WROOM)</span>
                        </div>
                        <div className="p-4 bg-[#f8f9fa] border border-[#e2e5e8] rounded-xl flex flex-col items-center justify-center text-center">
                            <Wifi size={24} className="text-blue-400 mb-2" />
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Protocolo</span>
                            <span className="text-xs font-black text-blue-600 uppercase">MQTT / Mosquitto</span>
                        </div>
                        <div className="p-4 bg-[#f8f9fa] border border-[#e2e5e8] rounded-xl flex flex-col items-center justify-center text-center">
                            <Settings size={24} className="text-purple-400 mb-2" />
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Frontend</span>
                            <span className="text-xs font-black text-purple-600 uppercase">Next.js 15 (React)</span>
                        </div>
                        <div className="p-4 bg-[#f8f9fa] border border-[#e2e5e8] rounded-xl flex flex-col items-center justify-center text-center">
                            <Database size={24} className="text-cyan-400 mb-2" />
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Motor SQL</span>
                            <span className="text-xs font-black text-cyan-600 uppercase">MariaDB (XAMPP)</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Warning Banner */}
            <div className="flex items-start md:items-center gap-3 p-5 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
                <Shield className="text-blue-500 shrink-0" size={24} />
                <div>
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest">Nota de Seguridad de Calibración</h4>
                    <p className="text-[11px] text-blue-600/80 mt-0.5">
                        Los cambios de calibración se muestran en modo de sólo lectura en este panel. Para modificar la sensibilidad, debes flashear nuevamente el firmware C++ en el ESP32 desde el IDE de Arduino.
                    </p>
                </div>
            </div>
        </div>
    );
}
