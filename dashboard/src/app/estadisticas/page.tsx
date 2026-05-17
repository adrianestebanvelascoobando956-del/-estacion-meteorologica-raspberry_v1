'use client';

import React, { useState, useEffect } from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer 
} from 'recharts';
import { 
    Calculator,
    TrendingUp,
    BarChart2,
    Activity,
    Table as TableIcon,
    AlertCircle,
    ChevronRight,
    Home
} from 'lucide-react';

export default function StatisticsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSensor, setSelectedSensor] = useState<string>('temperatura');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/history?limit=1000'); 
            const json = await res.json();
            if (Array.isArray(json)) {
                setData(json.reverse());
            } else {
                setData([]);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const sensors = [
        { id: 'temperatura', label: 'Temperatura (°C)' },
        { id: 'humedad', label: 'Humedad (%)' },
        { id: 'presion', label: 'Presión (hPa)' },
        { id: 'lluvia', label: 'Lluvia (%)' },
        { id: 'lux', label: 'Luminosidad (Lux)' },
        { id: 'uv', label: 'Índice UV' },
    ];

    // Helper to get array of clean numbers for the selected sensor
    const getSensorValues = () => {
        if (!data || data.length === 0) return [];
        return data.map(item => {
            let val;
            if (selectedSensor === 'temperatura') val = item.temperatura ?? item.t ?? item.temp;
            else if (selectedSensor === 'humedad') val = item.humedad ?? item.h ?? item.hum;
            else if (selectedSensor === 'presion') val = item.presion ?? item.p ?? item.pres;
            else if (selectedSensor === 'lluvia') val = item.lluvia ?? item.ll;
            else if (selectedSensor === 'lux') val = item.lux ?? item.lx;
            else if (selectedSensor === 'uv') val = item.uv;
            else val = item[selectedSensor];
            return val !== undefined && val !== null ? parseFloat(val) : null;
        }).filter((v): v is number => v !== null && !isNaN(v));
    };

    const computeUngroupedStats = (values: number[]) => {
        if (values.length === 0) return null;
        
        const n = values.length;
        const sorted = [...values].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[n - 1];
        const range = max - min;
        
        const sum = sorted.reduce((a, b) => a + b, 0);
        const mean = sum / n;
        
        // Median
        const mid = Math.floor(n / 2);
        const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        
        // Mode
        const frequencies: Record<number, number> = {};
        let maxFreq = 0;
        sorted.forEach(v => {
            frequencies[v] = (frequencies[v] || 0) + 1;
            if (frequencies[v] > maxFreq) maxFreq = frequencies[v];
        });
        const modes = Object.keys(frequencies).filter(k => frequencies[parseFloat(k)] === maxFreq).map(parseFloat);
        const modeStr = modes.length > 3 ? "Multimodal" : modes.join(', ');

        // Variance & StdDev
        const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);

        return { n, min, max, range, mean, median, mode: modeStr, variance, stdDev };
    };

    const computeGroupedStats = (values: number[]) => {
        if (values.length === 0) return null;
        const n = values.length;
        const sorted = [...values].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[n - 1];
        const range = max - min;

        // Sturges' Rule for number of classes
        let k = Math.round(1 + 3.322 * Math.log10(n));
        if (k < 5) k = 5; // Minimum classes for better analytical view
        
        // Class width
        const w = range === 0 ? 1 : range / k;
        
        // Build Frequency Table
        const table = [];
        let currentMin = min;
        let cumulativeFreq = 0;
        
        for (let i = 0; i < k; i++) {
            const currentMax = i === k - 1 ? max + 0.001 : currentMin + w;
            const freq = sorted.filter(v => v >= currentMin && v < currentMax).length;
            cumulativeFreq += freq;
            const xi = (currentMin + currentMax) / 2; // Class mark (marca de clase)
            
            table.push({
                interval: `[${currentMin.toFixed(2)} - ${currentMax.toFixed(2)}${i === k - 1 ? ']' : ')'}`,
                lower: currentMin,
                upper: currentMax,
                xi,
                fi: freq,
                Fi: cumulativeFreq,
                xifi: xi * freq
            });
            currentMin = currentMax;
        }

        // Grouped Mean
        const sumXiFi = table.reduce((sum, row) => sum + row.xifi, 0);
        const groupedMean = sumXiFi / n;

        // Grouped Median
        const medianPos = n / 2;
        const medianClassIdx = table.findIndex(row => row.Fi >= medianPos);
        let groupedMedian = 0;
        if (medianClassIdx !== -1) {
            const medianRow = table[medianClassIdx];
            const F_prev = medianClassIdx > 0 ? table[medianClassIdx - 1].Fi : 0;
            groupedMedian = medianRow.lower + ((medianPos - F_prev) / medianRow.fi) * w;
        }

        // Grouped Mode
        let maxFi = -1;
        let modeClassIdx = -1;
        table.forEach((row, idx) => {
            if (row.fi > maxFi) {
                maxFi = row.fi;
                modeClassIdx = idx;
            }
        });

        let groupedMode = 0;
        if (modeClassIdx !== -1) {
            const modeRow = table[modeClassIdx];
            const f1 = modeRow.fi;
            const f0 = modeClassIdx > 0 ? table[modeClassIdx - 1].fi : 0;
            const f2 = modeClassIdx < k - 1 ? table[modeClassIdx + 1].fi : 0;
            
            const d1 = f1 - f0;
            const d2 = f1 - f2;
            
            // Prevent division by zero if all frequencies are the same
            if (d1 + d2 !== 0) {
                groupedMode = modeRow.lower + (d1 / (d1 + d2)) * w;
            } else {
                groupedMode = modeRow.xi;
            }
        }

        // Grouped Variance
        const sumXi2Fi = table.reduce((sum, row) => sum + (Math.pow(row.xi - groupedMean, 2) * row.fi), 0);
        const groupedVariance = sumXi2Fi / n;
        const groupedStdDev = Math.sqrt(groupedVariance);

        return { table, k, w, groupedMean, groupedMedian, groupedMode, groupedVariance, groupedStdDev };
    };

    if (!mounted) return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
            <div className="h-20 bg-gray-100 rounded-xl" />
            <div className="h-[600px] bg-gray-100 rounded-xl" />
        </div>
    );

    const values = getSensorValues();
    const ungrouped = computeUngroupedStats(values);
    const grouped = computeGroupedStats(values);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#e2e5e8] pb-6">
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight">Análisis Matemático Estadístico</h2>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                        <Home size={10} />
                        <span>Panel</span>
                        <ChevronRight size={10} />
                        <span className="text-cyan-500">Estadísticas</span>
                    </div>
                </div>
            </div>

            {loading && data.length === 0 ? (
                <div className="h-[450px] flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100">
                    <Activity size={48} className="animate-pulse text-cyan-500 mb-4" />
                    <p className="text-sm font-semibold uppercase tracking-wider">Cargando mediciones...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <AlertCircle size={48} className="text-orange-400 mb-4" />
                    <p className="text-sm font-semibold uppercase tracking-wider">Sin mediciones</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Control Panel */}
                    <div className="bg-white border border-[#e2e5e8] p-5 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Calculator size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-800 leading-none">Seleccionar Variable</h4>
                                <p className="text-[10px] text-gray-400 mt-1">Realiza cálculos de tendencia central y dispersión</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {sensors.map(s => (
                                <button 
                                    key={s.id} 
                                    onClick={() => setSelectedSensor(s.id)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedSensor === s.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {ungrouped && grouped && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Ungrouped Stats Card */}
                            <div className="card-professional p-6 border-t-4 border-cyan-500">
                                <div className="flex items-center gap-2 mb-6">
                                    <TrendingUp size={20} className="text-cyan-500" />
                                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Datos No Agrupados</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <StatBox label="Tamaño Muestra (n)" value={ungrouped.n} />
                                    <StatBox label="Rango (R)" value={ungrouped.range.toFixed(2)} />
                                    <StatBox label="Mínimo" value={ungrouped.min.toFixed(2)} />
                                    <StatBox label="Máximo" value={ungrouped.max.toFixed(2)} />
                                    <StatBox label="Media (Promedio)" value={ungrouped.mean.toFixed(2)} highlight />
                                    <StatBox label="Mediana" value={ungrouped.median.toFixed(2)} highlight />
                                    <StatBox label="Moda" value={ungrouped.mode} highlight />
                                    <StatBox label="Desviación Estándar" value={ungrouped.stdDev.toFixed(2)} />
                                </div>
                            </div>

                            {/* Histogram Chart */}
                            <div className="card-professional p-6 border-t-4 border-indigo-500">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart2 size={20} className="text-indigo-500" />
                                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Histograma de Frecuencias</h3>
                                </div>
                                <div className="w-full mt-2 min-w-0">
                                    <ResponsiveContainer width="100%" height={300} minWidth={0} initialDimension={{ width: 100, height: 300 }}>
                                        <BarChart data={grouped.table} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                            <XAxis dataKey="interval" tick={{ fontSize: 10, fill: '#888' }} />
                                            <YAxis tick={{ fontSize: 10, fill: '#888' }} allowDecimals={false} />
                                            <RechartsTooltip 
                                                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-white border border-[#e2e5e8] p-3 rounded-lg shadow-xl">
                                                                <p className="text-[10px] text-gray-400 font-bold mb-1 tracking-wider uppercase">Intervalo: {data.interval}</p>
                                                                <p className="text-xs font-black text-indigo-600">Frecuencia: {data.fi} mediciones</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar dataKey="fi" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const StatBox = ({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) => (
    <div className={`p-3 rounded-xl border ${highlight ? 'bg-indigo-50 border-indigo-100' : 'bg-[#f8f9fa] border-[#e2e5e8]'}`}>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-lg font-black ${highlight ? 'text-indigo-600' : 'text-gray-800'}`}>{value}</p>
    </div>
);
