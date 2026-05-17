'use client';

import React, { useState, useEffect } from 'react';


export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState('');

    useEffect(() => {
        fetchHistory();
    }, [month]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const url = month ? `/api/history?month=${month}` : '/api/history?limit=100';
            const res = await fetch(url);
            const data = await res.json();
            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const headers = ['Fecha', 'Temperatura', 'Humedad', 'Presión', 'Lluvia', 'Lux', 'UV'];
        const csvRows = [
            headers.join(';'),
            ...history.map(row => [
                new Date(row.fecha).toLocaleString(),
                row.temperatura,
                row.humedad,
                row.presion,
                row.lluvia,
                row.lux,
                row.uv
            ].join(';'))
        ];
        
        const blob = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_meteorologico_${month || 'reciente'}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#e2e5e8] pb-6 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[#202124] mb-1">Historial de Datos</h2>
                    <div className="flex items-center gap-2 text-xs text-[#888]">
                        Panel <span className="text-cyan-600 font-bold ml-1">Historial</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <input 
                        type="month" 
                        className="input-professional text-xs py-2 px-3"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                    />
                    <button 
                        onClick={exportToCSV}
                        className="btn-primary flex items-center gap-2 text-xs py-2 px-4 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
                    >
                        Exportar CSV
                    </button>
                </div>
            </div>

            <div className="card-professional overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f8f9fa] border-b border-[#e2e5e8]">
                                <th className="px-6 py-4 text-[10px] font-bold text-[#888] uppercase tracking-wider">Fecha / Hora</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#888] uppercase tracking-wider">Temp (°C)</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#888] uppercase tracking-wider">Hum (%)</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#888] uppercase tracking-wider">Pres (hPa)</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#888] uppercase tracking-wider">Lluvia</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#888] uppercase tracking-wider">UV</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#888] uppercase tracking-wider">Lux</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f1f1f1]">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-[#888] italic">Cargando registros...</td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-[#888] italic">No se encontraron datos para este periodo.</td>
                                </tr>
                            ) : (
                                history.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-medium text-[#202124]">
                                            {new Date(row.fecha).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-orange-600">{row.temperatura}°C</td>
                                        <td className="px-6 py-4 text-xs font-bold text-blue-600">{row.humedad}%</td>
                                        <td className="px-6 py-4 text-xs text-[#444]">{row.presion}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold ${row.lluvia > 10 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {row.lluvia > 10 ? 'LLUVIA' : 'SECO'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-red-500">{row.uv}</td>
                                        <td className="px-6 py-4 text-xs text-[#888]">{row.lux}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
