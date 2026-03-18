import React from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
    timeRemaining: number; // in seconds
}

export function Timer({ timeRemaining }: TimerProps) {
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        
        if (h > 0) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isLowTime = timeRemaining < 300; // less than 5 mins

    return (
        <div className={`flex items-center gap-2 font-mono text-[15px] font-bold px-3 py-1.5 rounded bg-white
            ${isLowTime ? "text-red-600 border border-red-500 animate-pulse" : "text-[#1D4E89]"}
        `}>
            <Clock className="h-4 w-4" />
            <span>Time Left: {formatTime(timeRemaining)}</span>
        </div>
    );
}
