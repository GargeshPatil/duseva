import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-500">{title}</h3>
                <div className="p-2 bg-blue-50 rounded-lg text-secondary">
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                {trend && (
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        }`}>
                        {trend}
                    </div>
                )}
            </div>
        </div>
    );
}
