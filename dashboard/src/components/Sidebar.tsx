'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, Settings, Zap, Calculator } from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', section: 'NAVEGACIÓN' },
        { name: 'Historial', icon: History, path: '/historial', section: 'DATOS' },
        { name: 'Reportes', icon: Zap, path: '/reportes', section: 'DATOS' },
        { name: 'Estadísticas', icon: Calculator, path: '/estadisticas', section: 'DATOS' },
        { name: 'Ajustes', icon: Settings, path: '/ajustes', section: 'SISTEMA' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-[260px] bg-white text-black flex flex-col z-50 shadow-xl border-r border-gray-100">
            <div className="h-[70px] flex items-center px-6 gap-3 mb-4 bg-white border-b border-gray-100">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Zap className="text-white w-5 h-5" />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-black uppercase italic">
                    METEO <span className="text-cyan-600">PRO</span>
                </h1>
            </div>

            <div className="flex-1 px-3 space-y-6 overflow-y-auto pt-4">
                {['NAVEGACIÓN', 'DATOS', 'SISTEMA'].map((section) => (
                    <div key={section}>
                        <h4 className="px-4 text-[10px] font-bold text-black mb-4 tracking-widest uppercase">{section}</h4>
                        <div className="space-y-2">
                            {menuItems.filter(item => item.section === section).map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`custom-btn ${isActive ? 'btn-2' : 'btn-inactive'}`}
                                    >
                                        <item.icon size={16} className={isActive ? 'text-white font-bold' : 'text-black transition-colors'} />
                                        <span className="font-semibold tracking-wide text-xs">{item.name}</span>
                                        {isActive && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-[#333f54] text-[10px] text-[#fff] uppercase tracking-widest text-center">
                ESTACIÓN CONECTADA
            </div>
        </aside>
    );
};

export default Sidebar;
