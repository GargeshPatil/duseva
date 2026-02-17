import { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    onClick?: () => void;
    className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, onClick, className }: StatCardProps) {
    return (
        <Card
            onClick={onClick}
            className={`
                transition-all duration-200
                ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-200' : ''}
                ${className || ''}
            `}
        >
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-500">{title}</h3>
                    <div className={`p-2 rounded-lg ${trendUp === false ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
                <div className="flex items-end justify-between">
                    <div className="text-2xl font-bold text-slate-900">{value}</div>
                    {trend && (
                        <div className={`
                        flex items-center text-xs font-medium px-2 py-1 rounded-full border
                        ${trendUp ? "bg-green-50 text-green-700 border-green-100" : trendUp === false ? "bg-red-50 text-red-700 border-red-100" : "bg-slate-50 text-slate-600 border-slate-100"}
                    `}>
                            {trend}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
