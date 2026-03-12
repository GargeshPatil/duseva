"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CollegeTier } from "@/components/admin/cms/CUET2026Editors";
import { Award, ChevronDown, Building2 } from "lucide-react";

export function CollegePreferencesGuide({ data }: { data: CollegeTier[] }) {
    const [expandedTier, setExpandedTier] = useState<string | null>(data[0]?.id || null);

    const getTierColor = (index: number) => {
        const colors = [
            'from-amber-400 to-orange-500 text-amber-500 border-amber-500/30',
            'from-slate-300 to-slate-400 text-slate-300 border-slate-400/30',
            'from-emerald-400 to-teal-500 text-emerald-400 border-emerald-500/30',
            'from-blue-400 to-indigo-500 text-blue-400 border-blue-500/30'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="h-full bg-[#0A0A0B] relative overflow-y-auto p-6 md:p-12 hide-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">

                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-orange-500/10 rounded-full mb-6">
                        <Award className="h-8 w-8 text-orange-400" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">CSAS Preference Guide</h2>
                    <p className="text-white/50 text-lg">A strategic tier list to help you organize your preference sheet for Delhi University.</p>
                </div>

                {data.map((tier, idx) => {
                    const isExpanded = expandedTier === tier.id;
                    const colorClass = getTierColor(idx);

                    return (
                        <motion.div
                            layout
                            key={tier.id}
                            className={`bg-white/5 border transition-all duration-500 rounded-[2rem] overflow-hidden ${isExpanded ? `border-white/20 shadow-2xl` : 'border-white/5 hover:bg-white/10 cursor-pointer'
                                }`}
                        >
                            <div
                                onClick={() => setExpandedTier(isExpanded ? null : tier.id)}
                                className="p-6 md:p-8 flex items-center justify-between cursor-pointer"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} flex items-center justify-center shadow-lg`}>
                                        <span className="text-2xl font-black text-white/90">
                                            {idx + 1}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1">{tier.tier}</h3>
                                        {!isExpanded && (
                                            <p className="text-white/40 text-sm line-clamp-1">{tier.description}</p>
                                        )}
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    className="p-3 bg-white/5 rounded-full text-white/40 shrink-0"
                                >
                                    <ChevronDown className="h-6 w-6" />
                                </motion.div>
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <div className="px-6 md:px-8 pb-8 pt-0">
                                            <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-3xl">
                                                {tier.description}
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                {tier.colleges.map((college, cIdx) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: cIdx * 0.05 }}
                                                        key={cIdx}
                                                        className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-3 group hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                                                    >
                                                        <Building2 className={`h-5 w-5 mt-0.5 ${colorClass.split(' ')[2]}`} />
                                                        <span className="font-bold text-white/80 group-hover:text-white">{college}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
