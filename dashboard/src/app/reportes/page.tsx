'use client';

import React, { useState, useEffect } from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer
} from 'recharts';
import { 
    RefreshCcw,
    ChevronRight,
    Home,
    Thermometer,
    Droplets,
    Gauge,
    CloudRain,
    Sun,
    Zap,
    TrendingUp,
    FileSpreadsheet,
    Activity,
    AlertCircle,
    Calendar
} from 'lucide-react';

export default function ReportsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningExport, setRunningExport] = useState(false);
    const [viewMode, setViewMode] = useState<'horas' | 'dias' | 'meses'>('horas');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch 1000 entries so we have a wider timeframe for days/months aggregation offline
            const res = await fetch('/api/history?limit=1000'); 
            const json = await res.json();
            if (Array.isArray(json)) {
                // The API returns ordered descending, we reverse to display chronologically from left to right
                setData(json.reverse());
            } else {
                setData([]);
            }
        } catch (err) {
            console.error('Error fetching meteorological data:', err);
        } finally {
            setLoading(false);
        }
    };

    const runPythonAnalysis = async () => {
        setRunningExport(true);
        try {
            const res = await fetch('/api/export', { method: 'POST' });
            if (res.ok) {
                alert('¡Análisis profundo completado con éxito! Se han exportado los reportes XLSX e imágenes.');
            } else {
                const errData = await res.json();
                throw new Error(errData.error || 'Error al exportar');
            }
        } catch (err: any) {
            console.error(err);
            alert(`Error ejecutando análisis: ${err.message}`);
        } finally {
            setRunningExport(false);
        }
    };

    // Formatter for dates on XAxis (when viewing hourly)
    const formatTime = (timeStr: string) => {
        try {
            const d = new Date(timeStr);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return timeStr;
        }
    };

    // Full date formatter for Tooltips
    const formatFullDate = (timeStr: string) => {
        try {
            const d = new Date(timeStr);
            return d.toLocaleDateString([], { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return timeStr;
        }
    };

    // Dynamic stats helper for each sensor (computed over the full detailed local dataset)
    const getStats = (key: string) => {
        if (!data || data.length === 0) return { min: '--', max: '--', avg: '--', current: '--' };
        
        const values = data
            .map(item => {
                let val;
                // Support multiple possible key name variations (API vs raw sensor code)
                if (key === 'temperatura') val = item.temperatura ?? item.t ?? item.temp;
                else if (key === 'humedad') val = item.humedad ?? item.h ?? item.hum;
                else if (key === 'presion') val = item.presion ?? item.p ?? item.pres;
                else if (key === 'lluvia') val = item.lluvia ?? item.ll;
                else if (key === 'lux') val = item.lux ?? item.lx;
                else if (key === 'uv') val = item.uv;
                else val = item[key];

                return val !== undefined && val !== null ? parseFloat(val) : null;
            })
            .filter((v): v is number => v !== null && !isNaN(v));

        if (values.length === 0) return { min: '--', max: '--', avg: '--', current: '--' };
        
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
        const current = values[values.length - 1];
        
        return {
            min: min.toFixed(1),
            max: max.toFixed(1),
            avg: avg.toFixed(1),
            current: current.toFixed(1)
        };
    };

    // Process and aggregate data chronologically according to the selected tab
    const getChartData = () => {
        if (!data || data.length === 0) return [];

        if (viewMode === 'horas') {
            return data;
        }

        const groups: { [key: string]: any[] } = {};

        data.forEach(item => {
            const d = new Date(item.fecha);
            let key = '';
            if (viewMode === 'dias') {
                // Group by day: e.g. "16 May 2026"
                key = d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
            } else if (viewMode === 'meses') {
                // Group by month: e.g. "mayo 2026"
                key = d.toLocaleDateString([], { month: 'long', year: 'numeric' });
            }

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });

        const aggregated = Object.keys(groups).map(key => {
            const items = groups[key];
            
            const getAvg = (sensorKey: string) => {
                const values = items
                    .map(item => {
                        let val;
                        if (sensorKey === 'temperatura') val = item.temperatura ?? item.t ?? item.temp;
                        else if (sensorKey === 'humedad') val = item.humedad ?? item.h ?? item.hum;
                        else if (sensorKey === 'presion') val = item.presion ?? item.p ?? item.pres;
                        else if (sensorKey === 'lluvia') val = item.lluvia ?? item.ll;
                        else if (sensorKey === 'lux') val = item.lux ?? item.lx;
                        else if (sensorKey === 'uv') val = item.uv;
                        else val = item[sensorKey];
                        
                        return val !== undefined && val !== null ? parseFloat(val) : null;
                    })
                    .filter((v): v is number => v !== null && !isNaN(v));

                if (values.length === 0) return 0;
                return parseFloat((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1));
            };

            // Use the timestamp of the first item in the group as sorting key anchor
            const anchorFecha = items[0].fecha;

            return {
                fecha: anchorFecha,
                displayLabel: key,
                temperatura: getAvg('temperatura'),
                humedad: getAvg('humedad'),
                presion: getAvg('presion'),
                lluvia: getAvg('lluvia'),
                lux: getAvg('lux'),
                uv: getAvg('uv'),
            };
        });

        // Ensure chronological order left-to-right
        return aggregated.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    };

    const chartData = getChartData();

    // Custom Tooltip component for recharts
    const CustomTooltip = ({ active, payload, label, unit, color }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-[#e2e5e8] p-3 rounded-lg shadow-xl">
                    <p className="text-[10px] text-gray-400 font-bold mb-1 tracking-wider uppercase">
                        {viewMode === 'horas' ? formatFullDate(label) : label}
                    </p>
                    <p className="text-xs font-black text-gray-800">
                        Lectura: <span style={{ color: color }}>{payload[0].value}</span> {unit}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Helper component to render statistics sub-bar
    const StatBadges = ({ sensorKey, unit, colorClass }: { sensorKey: string, unit: string, colorClass: string }) => {
        const stats = getStats(sensorKey);
        return (
            <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-[#f8f9fa] border border-[#e2e5e8] p-2 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Mínimo</span>
                    <span className="text-[11px] font-black text-gray-700">{stats.min}<span className="text-[8px] font-medium ml-0.5">{unit}</span></span>
                </div>
                <div className="bg-[#f8f9fa] border border-[#e2e5e8] p-2 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Máximo</span>
                    <span className={`text-[11px] font-black ${colorClass}`}>{stats.max}<span className="text-[8px] font-medium ml-0.5">{unit}</span></span>
                </div>
                <div className="bg-[#f8f9fa] border border-[#e2e5e8] p-2 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Promedio</span>
                    <span className="text-[11px] font-black text-gray-700">{stats.avg}<span className="text-[8px] font-medium ml-0.5">{unit}</span></span>
                </div>
                <div className="bg-[#f8f9fa] border border-[#e2e5e8] p-2 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Actual</span>
                    <span className="text-[11px] font-black text-gray-800">{stats.current}<span className="text-[8px] font-medium ml-0.5">{unit}</span></span>
                </div>
            </div>
        );
    };

    // Key properties for dynamic X-Axis ticks depending on selected viewMode
    const xAxisKey = viewMode === 'horas' ? 'fecha' : 'displayLabel';
    const xAxisFormatter = viewMode === 'horas' ? formatTime : (val: any) => val;

    if (!mounted) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                    <div className="space-y-2 w-full md:w-auto">
                        <div className="h-6 w-64 bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="h-10 w-32 bg-gray-100 rounded animate-pulse" />
                        <div className="h-10 w-44 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>
                {/* Control Skeleton */}
                <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                {/* Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-[400px] bg-gray-50 border border-gray-100 p-6 rounded-xl flex flex-col justify-between animate-pulse">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="h-4 w-48 bg-gray-100 rounded" />
                                    <div className="h-4 w-20 bg-gray-100 rounded" />
                                </div>
                                <div className="h-3 w-64 bg-gray-100 rounded" />
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map(j => (
                                        <div key={j} className="h-12 bg-gray-100 rounded-lg" />
                                    ))}
                                </div>
                            </div>
                            <div className="h-[230px] bg-gray-100 rounded-lg mt-4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            
            {/* Header section with buttons */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#e2e5e8] pb-6">
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight">Reportes Históricos por Sensor</h2>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                        <Home size={10} />
                        <span>Panel</span>
                        <ChevronRight size={10} />
                        <span className="text-cyan-500">Historial de Sensores</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchData} 
                        disabled={loading}
                        className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white border border-[#e2e5e8] hover:border-gray-400 py-2.5 px-4 rounded shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar Datos
                    </button>
                    
                    <button 
                        onClick={runPythonAnalysis} 
                        disabled={runningExport}
                        className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-[#3f4d67] to-[#2b3547] border border-none py-2.5 px-4 rounded shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <FileSpreadsheet size={14} /> {runningExport ? 'Exportando...' : 'Exportar Reportes (Python)'}
                    </button>
                </div>
            </div>

            {/* Offline-Compatible Time Aggregation Control */}
            <div className="bg-white border border-[#e2e5e8] p-4 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                        <TrendingUp size={16} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-800 leading-none">Agrupación Temporal</h4>
                        <p className="text-[10px] text-gray-400 mt-1">Funciona sin conexión (visualiza tu base de datos local por horas, días o meses)</p>
                    </div>
                </div>

                <div className="bg-gray-100/80 p-1 rounded-xl flex items-center gap-1 border border-gray-200/50 shadow-inner">
                    {[
                        { id: 'horas', label: 'Por Horas', icon: TrendingUp },
                        { id: 'dias', label: 'Por Días', icon: Calendar },
                        { id: 'meses', label: 'Por Meses', icon: Calendar }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = viewMode === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setViewMode(tab.id as any)}
                                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer ${
                                    isActive 
                                    ? 'bg-white text-cyan-600 shadow-sm border border-cyan-100' 
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                <Icon size={14} className={isActive ? 'text-cyan-500' : 'text-gray-400'} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {loading && data.length === 0 ? (
                /* Loading State Spinner */
                <div className="h-[450px] flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100">
                    <Activity size={48} className="animate-pulse text-cyan-500 mb-4" />
                    <p className="text-sm font-semibold uppercase tracking-wider">Cargando mediciones históricas...</p>
                    <p className="text-xs text-gray-400 mt-1">Conectando con la base de datos local</p>
                </div>
            ) : data.length === 0 ? (
                /* Empty Database State */
                <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <AlertCircle size={48} className="text-orange-400 mb-4" />
                    <p className="text-sm font-semibold uppercase tracking-wider">Sin mediciones en el historial</p>
                    <p className="text-xs text-gray-400 mt-2 max-w-sm">No se encontraron registros en la tabla `lecturas` de MySQL. Enciende tu módulo ESP32 o ejecuta el puente de red MQTT para registrar datos.</p>
                </div>
            ) : (
                /* Gorgeous Grid containing the 6 independent sensor charts */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* CHART 1: TEMPERATURA */}
                    <div className="card-professional p-6 border-t-4 border-orange-500 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                    <Thermometer size={16} className="text-orange-500" /> Temperatura (°C) vs Tiempo
                                </h3>
                                <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Sensor Cabina</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mb-4 font-medium">Seguimiento de la temperatura ambiental media del sistema</p>
                            <StatBadges sensorKey="temperatura" unit="°C" colorClass="text-orange-500" />
                        </div>
                        
                        <div className="w-full mt-2 min-w-0">
                            <ResponsiveContainer width="100%" height={230} minWidth={0} initialDimension={{ width: 100, height: 230 }}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.01}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                                    <XAxis dataKey={xAxisKey} tick={{ fontSize: 9, fill: '#888' }} tickFormatter={xAxisFormatter} />
                                    <YAxis tick={{ fontSize: 9, fill: '#888' }} domain={['auto', 'auto']} />
                                    <Tooltip content={<CustomTooltip unit="°C" color="#f97316" />} />
                                    <Area type="monotone" dataKey="temperatura" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CHART 2: HUMEDAD */}
                    <div className="card-professional p-6 border-t-4 border-blue-500 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                    <Droplets size={16} className="text-blue-500" /> Humedad (%) vs Tiempo
                                </h3>
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Sensor Cabina</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mb-4 font-medium">Histórico del porcentaje de humedad relativa del aire</p>
                            <StatBadges sensorKey="humedad" unit="%" colorClass="text-blue-500" />
                        </div>
                        
                        <div className="w-full mt-2 min-w-0">
                            <ResponsiveContainer width="100%" height={230} minWidth={0} initialDimension={{ width: 100, height: 230 }}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                                    <XAxis dataKey={xAxisKey} tick={{ fontSize: 9, fill: '#888' }} tickFormatter={xAxisFormatter} />
                                    <YAxis tick={{ fontSize: 9, fill: '#888' }} domain={[0, 100]} />
                                    <Tooltip content={<CustomTooltip unit="%" color="#3b82f6" />} />
                                    <Area type="monotone" dataKey="humedad" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHum)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CHART 3: PRESIÓN */}
                    <div className="card-professional p-6 border-t-4 border-cyan-500 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                    <Gauge size={16} className="text-cyan-500" /> Presión Atmosférica (hPa) vs Tiempo
                                </h3>
                                <span className="bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Sensor Cabina</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mb-4 font-medium">Variación de la presión barométrica local corregida</p>
                            <StatBadges sensorKey="presion" unit="hPa" colorClass="text-cyan-500" />
                        </div>
                        
                        <div className="w-full mt-2 min-w-0">
                            <ResponsiveContainer width="100%" height={230} minWidth={0} initialDimension={{ width: 100, height: 230 }}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPres" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                                    <XAxis dataKey={xAxisKey} tick={{ fontSize: 9, fill: '#888' }} tickFormatter={xAxisFormatter} />
                                    <YAxis tick={{ fontSize: 9, fill: '#888' }} domain={['auto', 'auto']} />
                                    <Tooltip content={<CustomTooltip unit="hPa" color="#06b6d4" />} />
                                    <Area type="monotone" dataKey="presion" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPres)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CHART 4: LLUVIA */}
                    <div className="card-professional p-6 border-t-4 border-indigo-500 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                    <CloudRain size={16} className="text-indigo-500" /> Nivel de Lluvia (%) vs Tiempo
                                </h3>
                                <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Sensor Exterior</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mb-4 font-medium">Porcentaje detectado por la placa de lluvia (menor % = seco, mayor % = lluvia)</p>
                            <StatBadges sensorKey="lluvia" unit="%" colorClass="text-indigo-500" />
                        </div>
                        
                        <div className="w-full mt-2 min-w-0">
                            <ResponsiveContainer width="100%" height={230} minWidth={0} initialDimension={{ width: 100, height: 230 }}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorLluv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                                    <XAxis dataKey={xAxisKey} tick={{ fontSize: 9, fill: '#888' }} tickFormatter={xAxisFormatter} />
                                    <YAxis tick={{ fontSize: 9, fill: '#888' }} domain={[0, 100]} />
                                    <Tooltip content={<CustomTooltip unit="%" color="#6366f1" />} />
                                    <Area type="monotone" dataKey="lluvia" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLluv)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CHART 5: ILUMINACIÓN SOLAR */}
                    <div className="card-professional p-6 border-t-4 border-yellow-500 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                    <Sun size={16} className="text-yellow-500" /> Luminosidad (Lux) vs Tiempo
                                </h3>
                                <span className="bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Sensor Exterior</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mb-4 font-medium">Lectura del sensor LDR de intensidad luminosa en lux</p>
                            <StatBadges sensorKey="lux" unit="Lux" colorClass="text-yellow-600" />
                        </div>
                        
                        <div className="w-full mt-2 min-w-0">
                            <ResponsiveContainer width="100%" height={230} minWidth={0} initialDimension={{ width: 100, height: 230 }}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorLux" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#eab308" stopOpacity={0.01}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                                    <XAxis dataKey={xAxisKey} tick={{ fontSize: 9, fill: '#888' }} tickFormatter={xAxisFormatter} />
                                    <YAxis tick={{ fontSize: 9, fill: '#888' }} domain={['auto', 'auto']} />
                                    <Tooltip content={<CustomTooltip unit="Lux" color="#eab308" />} />
                                    <Area type="monotone" dataKey="lux" stroke="#eab308" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLux)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CHART 6: ÍNDICE UV */}
                    <div className="card-professional p-6 border-t-4 border-purple-500 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                    <Zap size={16} className="text-purple-500" /> Índice UV vs Tiempo
                                </h3>
                                <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">Sensor Exterior</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mb-4 font-medium">Nivel de radiación ultravioleta incidente en el exterior</p>
                            <StatBadges sensorKey="uv" unit="UVI" colorClass="text-purple-500" />
                        </div>
                        
                        <div className="w-full mt-2 min-w-0">
                            <ResponsiveContainer width="100%" height={230} minWidth={0} initialDimension={{ width: 100, height: 230 }}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0.01}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                                    <XAxis dataKey={xAxisKey} tick={{ fontSize: 9, fill: '#888' }} tickFormatter={xAxisFormatter} />
                                    <YAxis tick={{ fontSize: 9, fill: '#888' }} domain={[0, 11]} />
                                    <Tooltip content={<CustomTooltip unit="UVI" color="#a855f7" />} />
                                    <Area type="monotone" dataKey="uv" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUv)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
