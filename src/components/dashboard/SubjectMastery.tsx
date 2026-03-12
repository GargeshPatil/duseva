import { motion } from "framer-motion";

export function SubjectMastery() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6 flex flex-col h-full"
        >
            <div className="bg-surface-card/60 flex-1 rounded-[2rem] border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

                <h3 className="font-bold text-white text-xl mb-1 relative z-10">Domain Mastery</h3>
                <p className="text-white/40 text-sm mb-8 relative z-10">Subject-wise precision breakdown.</p>

                <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-center">
                    <div className="group">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/70 font-medium group-hover:text-white transition-colors">General Test</span>
                            <span className="font-bold text-white">75%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 w-3/4 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                        </div>
                    </div>
                    <div className="group">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/70 font-medium group-hover:text-white transition-colors">English</span>
                            <span className="font-bold text-white">82%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[82%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                    </div>
                    <div className="group">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/70 font-medium group-hover:text-white transition-colors">Physics (Projected)</span>
                            <span className="font-bold text-white">60%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 w-[60%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
