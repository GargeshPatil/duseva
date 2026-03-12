import { Activity } from "lucide-react";

interface PerformanceChartProps {
    chartData: any[];
    dataKey?: 'score' | 'accuracy' | 'time' | 'tests' | null;
    color?: string;
}

export function PerformanceChart({ chartData, dataKey = 'score', color = '#8b5cf6' }: PerformanceChartProps) {
    if (chartData.length < 2) return (
        <div className="h-64 flex flex-col items-center justify-center text-white/30 space-y-3">
            <Activity className="h-8 w-8 opacity-50" />
            <p>Need at least 2 tests to plot trends</p>
        </div>
    );

    const actualKey = dataKey === 'tests' ? 'score' : dataKey;
    const width = 100;
    const height = 50;
    const maxVal = Math.max(...chartData.map(d => d[actualKey as string] as number), 10) * 1.1;

    const generateSmoothPath = () => {
        if (chartData.length === 0) return "";
        if (chartData.length === 1) return `M 0,${height - ((chartData[0][actualKey as string] as number) / maxVal) * height}`;

        const pts = chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * width;
            const y = height - ((d[actualKey as string] as number) / maxVal) * height;
            return { x, y };
        });

        let path = `M ${pts[0].x},${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i === 0 ? 0 : i - 1];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[i + 2 >= pts.length ? i + 1 : i + 2];

            const tension = 0.2;
            const cp1x = p1.x + (p2.x - p0.x) * tension;
            const cp1y = p1.y + (p2.y - p0.y) * tension;
            const cp2x = p2.x - (p3.x - p1.x) * tension;
            const cp2y = p2.y - (p3.y - p1.y) * tension;

            path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
        }
        return path;
    };

    const linePath = generateSmoothPath();
    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    return (
        <div className="w-full aspect-[2/1] bg-surface-elevated/20 rounded-2xl p-4 md:p-6 border border-white/5 relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/[0.02] rounded-2xl pointer-events-none" />

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible relative z-10">
                <defs>
                    <linearGradient id={`gradient-${actualKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                    </linearGradient>
                    <filter id={`glow-${actualKey}`}>
                        <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <line x1="0" y1="0" x2={width} y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="1 2" />
                <line x1="0" y1={height} x2={width} y2={height} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                <path
                    d={areaPath}
                    fill={`url(#gradient-${actualKey})`}
                    className="transition-all duration-700 ease-in-out"
                />

                <path
                    d={linePath}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.2"
                    vectorEffect="non-scaling-stroke"
                    filter={`url(#glow-${actualKey})`}
                    className="transition-all duration-700 ease-in-out drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                />

                {chartData.map((d, i) => {
                    const x = (i / (chartData.length - 1)) * width;
                    const y = height - ((d[actualKey as string] as number) / maxVal) * height;
                    return (
                        <circle
                            key={i}
                            cx={x} cy={y}
                            r="1.5"
                            fill="#0f172a"
                            stroke={color}
                            strokeWidth="1"
                            className="cursor-pointer transition-all duration-300 hover:r-[3px] hover:stroke-white focus:outline-none"
                            vectorEffect="non-scaling-stroke"
                        >
                            <title>{`Test ${i + 1}: ${d[actualKey as string]}`}</title>
                        </circle>
                    );
                })}
            </svg>
            <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest mt-4 font-semibold">
                <span>{chartData[0]?.date}</span>
                <span>{chartData[chartData.length - 1]?.date}</span>
            </div>
        </div>
    );
}
