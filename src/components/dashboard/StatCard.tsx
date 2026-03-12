import { LucideIcon } from "lucide-react";

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
        <div
            onClick={onClick}
            className={`
                transition-all duration-500 relative group overflow-hidden 
                rounded-[2rem] bg-surface-card/60 backdrop-blur-2xl border border-white/10
                shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                ${onClick ? 'cursor-pointer hover:border-cta-primary/40 hover:bg-surface-card/80 hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] hover:-translate-y-1 active:scale-[0.98]' : 'hover:border-white/20 hover:bg-surface-card/80'}
                ${className || ''}
            `}
        >
            {/* Glossy top edge highlight using radial gradient to avoid corner clipping */}
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60 pointer-events-none" />

            {/* Subtle inner gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

            <div className="p-6 relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[13px] font-bold text-white/50 tracking-wider uppercase group-hover:text-white/70 transition-colors">{title}</h3>
                    <div className={`p-2.5 rounded-2xl transition-all duration-500 group-hover:scale-110 
                        ${trendUp === false
                            ? 'bg-semantic-error/10 text-semantic-error border border-semantic-error/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                            : 'bg-cta-primary/10 text-cta-primary border border-cta-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
                <div className="flex items-end justify-between">
                    <div className="text-4xl font-black text-white tracking-tight drop-shadow-md">{value}</div>
                    {trend && (
                        <div className={`
                            flex items-center text-[11px] font-bold px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md
                            ${trendUp ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : trendUp === false ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-white/5 text-white/60 border-white/10"}
                        `}>
                            {trend}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
