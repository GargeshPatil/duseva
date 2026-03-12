import { motion, Variants } from "framer-motion";
import { Target, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

interface AnalyticsKpiCardsProps {
    totalTests: number;
    avgScore: number;
    avgAccuracy: number;
    totalTimeHours: string;
    selectedMetric: string | null;
    setSelectedMetric: (metric: any) => void;
}

export function AnalyticsKpiCards({
    totalTests,
    avgScore,
    avgAccuracy,
    totalTimeHours,
    selectedMetric,
    setSelectedMetric
}: AnalyticsKpiCardsProps) {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
            <motion.div variants={itemVariants}>
                <StatCard
                    title="Tests Conquered"
                    value={totalTests.toString()}
                    icon={Target}
                    trend="Total"
                    trendUp={true}
                    onClick={() => setSelectedMetric('tests')}
                    className={`cursor-pointer transition-all duration-300 ${selectedMetric === 'tests' ? 'ring-2 ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'hover:-translate-y-1'}`}
                />
            </motion.div>
            <motion.div variants={itemVariants}>
                <StatCard
                    title="Average Score"
                    value={avgScore.toString()}
                    icon={TrendingUp}
                    trend="Marks"
                    trendUp={true}
                    onClick={() => setSelectedMetric('score')}
                    className={`cursor-pointer transition-all duration-300 ${selectedMetric === 'score' ? 'ring-2 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'hover:-translate-y-1'}`}
                />
            </motion.div>
            <motion.div variants={itemVariants}>
                <StatCard
                    title="Precision Rate"
                    value={avgAccuracy + "%"}
                    icon={AlertTriangle}
                    trend={avgAccuracy < 60 ? "Improvement Needed" : "Optimal Range"}
                    trendUp={avgAccuracy >= 60}
                    onClick={() => setSelectedMetric('accuracy')}
                    className={`cursor-pointer transition-all duration-300 ${selectedMetric === 'accuracy' ? 'ring-2 ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'hover:-translate-y-1'}`}
                />
            </motion.div>
            <motion.div variants={itemVariants}>
                <StatCard
                    title="Combat Time" // playful metric name
                    value={totalTimeHours + "h"}
                    icon={Clock}
                    trend="Invested"
                    trendUp={true}
                    onClick={() => setSelectedMetric('time')}
                    className={`cursor-pointer transition-all duration-300 ${selectedMetric === 'time' ? 'ring-2 ring-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'hover:-translate-y-1'}`}
                />
            </motion.div>
        </motion.div>
    );
}
