"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
    durationInSeconds: number; // e.g., 2700 for 45 mins
    onTimeUp?: () => void;
}

export function Timer({ durationInSeconds, onTimeUp }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(durationInSeconds);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isLowTime = timeLeft < 300; // less than 5 mins

    return (
        <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg border ${isLowTime ? "bg-red-50 text-red-600 border-red-200" : "bg-blue-50 text-primary border-blue-200"
            }`}>
            <Clock className="h-5 w-5" />
            {formatTime(timeLeft)}
        </div>
    );
}
