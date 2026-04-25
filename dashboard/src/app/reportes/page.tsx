'use client';

import React, { useState, useEffect } from 'react';
import { 
    LineChart, 
    Line, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { 
    TrendingUp, 
    Zap, 
    CloudRain, 
    FileText, 
    RefreshCcw,
    ChevronRight,
    Home,
    Maximize2,
    X,
    Download
} from 'lucide-react';

export default function ReportsPage() {
    const [data, setData] = useState<any[]>([]);
    const [reportFiles, setReportFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningExport, setRunningExport] = useState(false);
    const [selectedImg, setSelectedImg] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        fetchReportFiles();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Aumentamos el límite para asegurar que se vea algo si hay pocos datos
            const res = await fetch('/api/history?limit=100'); 
            const json = await res.json();
            if (Array.isArray(json)) {
                setData(json.reverse());
            } else {
                setData([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchReportFiles = async () => {
        try {
            const res = await fetch('/api/reports/list');
            const json = await res.json();
            setReportFiles(json);
        } catch (err) {
            console.error(err);
        }
    };

    const downloadImage = (url: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `Analisis_MeteoPro_${new Date().toLocaleDateString()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const runPythonAnalysis = async () => {
        setRunningExport(true);
        try {
            const res = await fetch('/api/export', { method: 'POST' });
            if (res.ok) {
                // Pequeña pausa para asegurar escritura en disco
                await new Promise(r => setTimeout(r, 1500));
                alert('¡Análisis profundo completado con éxito!');
                // Refrescamos la lista para ver los nuevos archivos
                fetchReportFiles();
            } else {
                const data = await res.json();
                throw new Error(data.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setRunningExport(false);
        }
    };

    return (
        <div className="space-y-8 fade-in relative">
            {/* Modal para Zoom de Imagen */}
            {selectedImg && (
                <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
                    <div className="absolute top-6 right-6 flex gap-4">
                        <button 
                            onClick={() => downloadImage(selectedImg)}
                            className="bg-cyan-600 text-white flex items-center gap-2 px-4 py-2 rounded-full hover:bg-cyan-500 transition-all font-bold text-xs shadow-lg"
                        >
                            <Download size={18} /> DESCARGAR IMAGEN
                        </button>
                        <button 
                            onClick={() => setSelectedImg(null)}
                            className="text-white hover:text-red-400 transition-colors bg-white/10 p-2 rounded-full"
                        >
                            <X size={32} />
                        </button>
                    </div>
                    <div className="max-w-7xl w-full h-full flex flex-col items-center justify-center">
                        <img 
                            src={selectedImg} 
                            alt="Análisis Expandido" 
                            className="max-w-full max-h-[80vh] object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-lg border border-white/10" 
                        />
                        <div className="mt-8 text-center">
                            <p className="text-white font-bold tracking-[0.2em] uppercase text-sm mb-2">Estación Meteorológica Mayerly</p>
                            <div className="w-20 h-1 bg-cyan-500 mx-auto rounded-full"></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#e2e5e8] pb-6 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[#202124] mb-1">Reportes y Análisis</h2>
                    <div className="flex items-center gap-2 text-xs text-[#888]">
                        <Home size={12} /> <ChevronRight size={10} /> Panel <ChevronRight size={10} /> <span className="text-cyan-600 font-bold">Analítica Avanzada</span>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => { fetchData(); fetchReportFiles(); }}
                        className="btn-secondary flex items-center gap-2 text-xs py-2.5 px-4 border border-[#e2e5e8] rounded shadow-sm hover:bg-gray-50 transition-all"
                    >
                        <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar Datos
                    </button>
                    <button 
                        onClick={runPythonAnalysis}
                        disabled={runningExport}
                        className="btn-primary flex items-center gap-2 text-xs py-2.5 px-4 bg-gradient-to-r from-[#3f4d67] to-[#333f54] text-white rounded shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        <FileText size={14} /> {runningExport ? 'Analizando en Python...' : 'Ejecutar Análisis Profundo'}
                    </button>
                </div>
            </div>

            {/* Live Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-professional p-6 border-t-4 border-orange-400">
                    <h3 className="text-sm font-bold text-[#202124] mb-6 flex items-center gap-2">
                        <TrendingUp size={16} className="text-orange-500" /> Tendencia Temp / Humedad
                    </h3>
                    <div className="h-[280px]">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f5a623" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#f5a623" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                    <XAxis dataKey="fecha" tick={{fontSize: 10}} tickFormatter={(str) => new Date(str).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} />
                                    <YAxis tick={{fontSize: 10}} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="temperatura" stroke="#f5a623" fillOpacity={1} fill="url(#colorTemp)" />
                                    <Area type="monotone" dataKey="humedad" stroke="#04a9f5" fillOpacity={0.1} fill="#04a9f5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-xs text-[#888] italic">Sin datos recientes (Sincroniza tu sensor)</div>
                        )}
                    </div>
                </div>

                <div className="card-professional p-6 border-t-4 border-blue-400">
                    <h3 className="text-sm font-bold text-[#202124] mb-6 flex items-center gap-2">
                        <CloudRain size={16} className="text-blue-500" /> Histórico de Lluvia (%)
                    </h3>
                    <div className="h-[280px]">
                        {data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                    <XAxis dataKey="fecha" tick={{fontSize: 10}} tickFormatter={(str) => new Date(str).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} />
                                    <YAxis tick={{fontSize: 10}} />
                                    <Tooltip />
                                    <Bar dataKey="lluvia" fill="#04a9f5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-xs text-[#888] italic">Sin datos recientes</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Static Reports Gallery */}
            <div className="space-y-6 pt-4">
                <h3 className="text-lg font-bold text-[#202124] flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-cyan-500 rounded-full"></div>
                    Informes Generados por Motor Python
                </h3>
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* List of Files */}
                    <div className="card-professional p-6 xl:col-span-1 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-bold text-[#888] uppercase tracking-widest">Documentos Excel</h4>
                            <span className="bg-cyan-100 text-cyan-600 px-2 py-0.5 rounded-full text-[9px] font-bold">XLSX</span>
                        </div>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {reportFiles.filter(f => f.type === 'excel').length > 0 ? (
                                reportFiles.filter(f => f.type === 'excel').map((file, i) => (
                                    <a key={i} href={file.url} download className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-lg border border-[#e2e5e8] hover:border-green-400 hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500 text-white rounded flex items-center justify-center shadow-sm">
                                                <Download size={18} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[11px] font-bold text-[#202124] truncate w-40">{file.name}</p>
                                                <p className="text-[9px] text-[#888] uppercase">{new Date(file.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">DESCARGAR</span>
                                    </a>
                                ))
                            ) : (
                                <div className="text-center py-10 text-xs text-[#888] italic">No hay archivos generados aún.</div>
                            )}
                        </div>
                    </div>

                    {/* Latest Chart Image */}
                    <div className="card-professional p-6 xl:col-span-2 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-bold text-[#888] uppercase tracking-widest">Vista de Último Análisis Visual</h4>
                            <span className="text-[10px] font-bold text-cyan-600 italic">Haz clic para expandir</span>
                        </div>
                        {reportFiles.filter(f => f.type === 'image').length > 0 ? (
                            <div className="relative group cursor-zoom-in rounded-xl overflow-hidden border border-[#e2e5e8] bg-white shadow-inner flex-1 flex items-center justify-center">
                                <img 
                                    src={`${reportFiles.filter(f => f.type === 'image')[0].url}?t=${new Date().getTime()}`} 
                                    alt="Análisis Meteorológico" 
                                    className="max-h-[350px] w-auto object-contain transition-all duration-700 group-hover:scale-110"
                                    onClick={() => setSelectedImg(`${reportFiles.filter(f => f.type === 'image')[0].url}?t=${new Date().getTime()}`)}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center" onClick={() => setSelectedImg(reportFiles.filter(f => f.type === 'image')[0].url)}>
                                    <div className="opacity-0 group-hover:opacity-100 bg-white/90 p-4 rounded-full shadow-2xl transition-all scale-50 group-hover:scale-100">
                                        <Maximize2 className="text-cyan-600" size={24} />
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full border border-gray-100 text-[10px] font-bold text-gray-500 shadow-sm">
                                    {new Date(reportFiles.filter(f => f.type === 'image')[0].date).toLocaleString()}
                               - ID: #{Math.floor(new Date(reportFiles.filter(f => f.type === 'image')[0].date).getTime() / 1000000)}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-[#888] p-10">
                                <Zap size={40} className="mb-4 opacity-20" />
                                <p className="text-sm font-medium">Sin gráficas de análisis profundo</p>
                                <p className="text-[10px] mt-2">Haz clic en "Ejecutar Análisis Profundo" para generar la vista visual.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
