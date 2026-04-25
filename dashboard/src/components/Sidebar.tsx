'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, Settings, Zap } from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/', section: 'NAVEGACIÓN' },
        { name: 'Historial', icon: History, path: '/historial', section: 'DATOS' },
        { name: 'Reportes', icon: Zap, path: '/reportes', section: 'DATOS' },
        { name: 'Ajustes', icon: Settings, path: '/ajustes', section: 'SISTEMA' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-[260px] bg-[#3f4d67] text-[#a9b7d0] flex flex-col z-50 shadow-xl">
            <div className="h-[70px] flex items-center px-6 gap-3 mb-4 bg-[#333f54]">
                <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
                    <Zap className="text-white w-5 h-5" />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-white uppercase italic">
                    METEO <span className="text-cyan-400">PRO</span>
                </h1>
            </div>

            <div className="flex-1 px-3 space-y-6 overflow-y-auto pt-4">
                {['NAVEGACIÓN', 'DATOS', 'SISTEMA'].map((section) => (
                    <div key={section}>
                        <h4 className="px-4 text-[10px] font-bold text-[#748892] mb-4 tracking-widest uppercase">{section}</h4>
                        <div className="space-y-1">
                            {menuItems.filter(item => item.section === section).map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-200 group ${
                                            isActive 
                                            ? 'text-white' 
                                            : 'hover:text-white'
                                        }`}
                                    >
                                        <item.icon size={18} className={`${isActive ? 'text-cyan-400 font-bold' : ''}`} />
                                        <span className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
                                        {isActive && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-[#333f54] text-[10px] text-[#748892] uppercase tracking-widest text-center">
                ESTACIÓN CONECTADA
            </div>
        </aside>
    );
};

export default Sidebar;
