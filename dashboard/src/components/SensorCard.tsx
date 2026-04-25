import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SensorCardProps {
    title: string;
    value: string | number;
    unit: string;
    icon: LucideIcon;
    color: string;
    description?: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ title, value, unit, icon: Icon, color, description }) => {
    const displayValue = typeof value === 'number' ? value.toFixed(1) : value;

    // Colores para la barra inferior según el tipo de sensor
    const accentColors: Record<string, string> = {
        orange: 'bg-orange-500',
        blue: 'bg-blue-500',
        cyan: 'bg-cyan-500',
    };

    return (
        <div className="card-professional relative overflow-hidden p-6 flex flex-col justify-between h-full bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-[#888] text-xs font-bold uppercase tracking-wider">{title}</h3>
                    <div className={`text-${color}-500 opacity-80`}>
                        <Icon size={24} />
                    </div>
                </div>
                
                <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-light text-[#2c3e50] tracking-tight">
                        {displayValue}
                    </span>
                    <span className="text-[#888] text-xs font-medium uppercase">{unit}</span>
                </div>
            </div>

            {description && (
                <div className="mt-6 flex flex-col gap-2">
                    <div className="h-1.5 w-full bg-[#f1f1f1] rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${accentColors[color] || 'bg-cyan-500'} transition-all duration-1000`} 
                            style={{ width: typeof value === 'number' ? `${Math.min(value, 100)}%` : '60%' }}
                        />
                    </div>
                    <span className="text-[10px] text-[#888] font-bold uppercase tracking-tighter">{description}</span>
                </div>
            )}

            {/* Accent Bar at the bottom like Datta Able */}
            <div className={`absolute bottom-0 left-0 h-1 w-full ${accentColors[color] || 'bg-cyan-500'} opacity-70`} />
        </div>
    );
};

export default SensorCard;
