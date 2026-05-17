'use client';

import React, { useState, useEffect } from 'react';
import { useMQTT } from '@/hooks/useMQTT';
import SensorCard from '@/components/SensorCard';
import { 
    Thermometer, 
    Droplets, 
    Wind, 
    CloudRain, 
    Sun, 
    Zap,
    AlertTriangle,
    ChevronRight,
    Home,
    CloudSun
} from 'lucide-react';
import GaugeChart from 'react-gauge-chart';

export default function DashboardPage() {
    const { data: mqttData, status } = useMQTT();
    const [dbData, setDbData] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const [external, setExternal] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        fetchExternalData();
        const interval = setInterval(fetchExternalData, 600000); // Cada 10 min
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Siempre consultamos la base de datos local como fuente de verdad constante
        const interval = setInterval(() => {
            fetch('/api/latest')
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) setDbData(data);
                })
                .catch(err => console.error('Error cargando datos de la BD:', err));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchExternalData = async () => {
        try {
            const res = await fetch('/api/weather/external');
            const json = await res.json();
            if (!json.error) setExternal(json);
        } catch (e) {
            console.error(e);
        }
    };

    const rawData = (status === 'connected' && mqttData) ? mqttData : dbData;
    
    const calculateDewPoint = (t: number, h: number) => {
        const a = 17.27;
        const b = 237.7;
        const alpha = ((a * t) / (b + t)) + Math.log(h / 100.0);
        return ((b * alpha) / (a - alpha)).toFixed(1);
    };

    const calculateHeatIndex = (t: number, h: number) => {
        const tf = (t * 9/5) + 32;
        const rh = h;
        const hi_f = -42.379 + 2.04901523*tf + 10.14333127*rh - 0.22475541*tf*rh - 0.00683783*tf**2 - 0.05481717*rh**2 + 0.00122874*tf**2*rh + 0.00085282*tf*rh**2 - 0.00000199*tf**2*rh**2;
        return ((hi_f - 32) * 5/9).toFixed(1);
    };

    const data = rawData ? {
        t: rawData.t ?? rawData.temperatura ?? rawData.temp ?? 0,
        h: rawData.h ?? rawData.humedad ?? rawData.hum ?? 0,
        p: rawData.p ?? rawData.presion ?? rawData.pres ?? 0,
        ll: rawData.ll ?? rawData.lluvia ?? 0,
        lx: rawData.lx ?? rawData.lux ?? 0,
        uv: rawData.uv ?? 0,
        up: rawData.up ?? rawData.uptime ?? 0,
    } : null;

    const stats = [
        { 
            title: 'Temperatura', 
            value: data?.t ?? '--', 
            unit: '°C', 
            icon: Thermometer, 
            color: 'orange', 
            desc: `SENSACIÓN: ${data ? calculateHeatIndex(data.t, data.h) : '--'}°C`,
            ref: external ? `${external.temp}°C Oficial` : null
        },
        { 
            title: 'Humedad', 
            value: data?.h ?? '--', 
            unit: '%', 
            icon: Droplets, 
            color: 'blue', 
            desc: `PTO. ROCÍO: ${data ? calculateDewPoint(data.t, data.h) : '--'}°C`,
            ref: external ? `${external.hum}% Oficial` : null
        },
        { 
            title: 'Presión Local', 
            value: data?.p ?? '--', 
            unit: 'hPa', 
            icon: Wind, 
            color: 'cyan', 
            desc: 'PRESIÓN ESTABLE',
            ref: external ? `${external.desc}` : null
        },
    ];

    if (!mounted) return null;

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#e2e5e8] pb-6 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[#202124] mb-1">Panel de Control</h2>
                    <div className="flex items-center gap-2 text-xs text-[#888]">
                        <Home size={12} /> <ChevronRight size={10} /> Panel <ChevronRight size={10} /> <span className="text-cyan-600 font-bold">Resumen Clima</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {external ? (
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-cyan-100 shadow-sm animate-pulse-slow">
                            <img src={`https://openweathermap.org/img/wn/${external.icon}.png`} className="w-8 h-8" alt="clima" />
                            <div>
                                <p className="text-[9px] font-bold text-cyan-600 uppercase tracking-tighter">Referencia Oficial (Popayán)</p>
                                <p className="text-[11px] font-bold text-gray-700 leading-none">{external.desc}: {external.temp}°C</p>
                            </div>
                        </div>
                    ) : null}
                    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded shadow-sm border border-[#e2e5e8]">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-[#202124] uppercase font-bold">Estado Conexión</span>
                            <span className={`text-[9px] font-bold uppercase ${status === 'connected' && mqttData ? 'text-green-500' : 'text-blue-500'}`}>
                                {status === 'connected' && mqttData ? 'Tiempo Real (MQTT)' : 'Modo Consulta DB'}
                            </span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
                    </div>
                </div>
            </div>

            {/* GRID ÚNICO DE SENSORES (SIN DUPLICADOS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* TEMPERATURA (CABINA) */}
                <div className="relative group">
                    <SensorCard 
                        title="Temperatura" 
                        value={data?.t ?? '--'} 
                        unit="°C" 
                        icon={Thermometer} 
                        color="orange" 
                        description={`SENSACIÓN: ${data ? calculateHeatIndex(data.t, data.h) : '--'}°C`}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-[#888] text-[8px] font-black rounded border border-gray-200 uppercase">CABINA</span>
                        {external && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[8px] font-black rounded border border-orange-100 uppercase">{external.temp}°C REF</span>}
                    </div>
                </div>

                {/* HUMEDAD (CABINA) */}
                <div className="relative group">
                    <SensorCard 
                        title="Humedad" 
                        value={data?.h ?? '--'} 
                        unit="%" 
                        icon={Droplets} 
                        color="blue" 
                        description={`PTO. ROCÍO: ${data ? calculateDewPoint(data.t, data.h) : '--'}°C`}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-[#888] text-[8px] font-black rounded border border-gray-200 uppercase">CABINA</span>
                        {external && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded border border-blue-100 uppercase">{external.hum}% REF</span>}
                    </div>
                </div>

                {/* PRESIÓN (CABINA) */}
                <div className="relative group">
                    <SensorCard 
                        title="Presión Local" 
                        value={data?.p ?? '--'} 
                        unit="hPa" 
                        icon={Wind} 
                        color="cyan" 
                        description="PRESIÓN ESTABLE"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-[#888] text-[8px] font-black rounded border border-gray-200 uppercase">CABINA</span>
                        {external && <span className="px-2 py-0.5 bg-cyan-50 text-cyan-600 text-[8px] font-black rounded border border-cyan-100 uppercase">{external.desc}</span>}
                    </div>
                </div>

                {/* UV (EXTERIOR) */}
                <div className="card-professional p-6 relative lg:col-span-1">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xs font-black text-[#202124] uppercase tracking-widest flex items-center gap-2">
                            <Zap className="text-orange-500" size={14} /> Índice UV
                        </h3>
                        <div className="flex gap-1">
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-black rounded uppercase">EXTERIOR</span>
                            {external && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[8px] font-black rounded border border-orange-100 uppercase">{external.uv} UVI REF</span>}
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <GaugeChart id="uv-gauge" nrOfLevels={11} percent={(data?.uv ?? 0) / 11} colors={['#7ed321', '#f5a623', '#d0021b']} arcWidth={0.2} textColor="#202124" needleColor="#333" animDelay={0} />
                        <p className="text-[9px] font-bold text-[#888] mt-1 uppercase tracking-tighter">RIESGO: <span className="text-orange-600">{(data?.uv ?? 0) > 5 ? 'ALTO' : 'BAJO'}</span></p>
                    </div>
                </div>

                {/* LLUVIA (EXTERIOR) */}
                <div className="card-professional p-6 relative">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xs font-black text-[#202124] uppercase tracking-widest flex items-center gap-2">
                            <CloudRain className="text-blue-500" size={14} /> Lluvia
                        </h3>
                        <div className="flex gap-1">
                            <span className="px-2 py-0.5 bg-blue-500 text-white text-[8px] font-black rounded uppercase">EXTERIOR</span>
                            {external && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded border border-blue-100 uppercase">{external.rain}mm REF</span>}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${(data?.ll ?? 0) > 25 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            <CloudRain size={28} />
                        </div>
                        <div>
                            <p className="text-lg font-black text-[#202124] tracking-tight">{(data?.ll ?? 0) > 25 ? 'Lluvia' : 'Despejado'}</p>
                            <p className="text-[10px] text-[#888] font-bold uppercase">Placa: {data?.ll ?? 0}%</p>
                        </div>
                    </div>
                </div>

                {/* ILUMINACIÓN (EXTERIOR) */}
                <div className="card-professional p-6 relative">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xs font-black text-[#202124] uppercase tracking-widest flex items-center gap-2">
                            <Sun className="text-yellow-500" size={14} /> Iluminación
                        </h3>
                        <div className="flex gap-1">
                            <span className="px-2 py-0.5 bg-yellow-500 text-white text-[8px] font-black rounded uppercase">EXTERIOR</span>
                            {external && <span className="px-2 py-0.5 bg-gray-50 text-[#888] text-[8px] font-black rounded border border-gray-100 uppercase">NUBES: {external.clouds}%</span>}
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-black text-[#202124] tracking-tighter">{data?.lx ?? 0}</span>
                        <span className="text-xs font-bold text-yellow-600 mb-2 uppercase tracking-widest">Lux</span>
                    </div>
                </div>

                {/* FOOTER INFO (VIENTO / UPTIME) */}
                <div className="lg:col-span-3 bg-white/40 border border-dashed border-[#e2e5e8] p-4 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Wind size={16} className="text-cyan-600" />
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-[#888] uppercase tracking-widest leading-none mb-1">Viento (Oficial Popayán)</span>
                            <span className="text-sm font-black text-cyan-700">{external?.wind ?? '--'} m/s</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col">
                        <span className="text-[8px] font-black text-[#888] uppercase tracking-widest leading-none mb-1">Uptime Estación</span>
                        <span className="text-xs font-bold text-[#202124]">{data?.up ?? 0} Segundos</span>
                    </div>
                </div>
            </div>


        </div>
    );
}
