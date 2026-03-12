import { motion } from "framer-motion";
import { Landmark, Microscope, BookOpen, Sparkles } from "lucide-react";

interface StreamSelectionViewProps {
    onSelectStream: (stream: string) => void;
}

const streamOptions = [
    { id: 'Commerce', label: 'Commerce', desc: 'Accountancy, BST, Economics', icon: <Landmark className="h-8 w-8 text-blue-400" />, color: "from-blue-500/20" },
    { id: 'Science', label: 'Science', desc: 'Physics, Chemistry, Maths, Bio', icon: <Microscope className="h-8 w-8 text-purple-400" />, color: "from-purple-500/20" },
    { id: 'Humanities', label: 'Humanities', desc: 'History, Pol Sci, Geography', icon: <BookOpen className="h-8 w-8 text-emerald-400" />, color: "from-emerald-500/20" },
    { id: 'General', label: 'General & English', desc: 'Language & General Awareness', icon: <Sparkles className="h-8 w-8 text-orange-400" />, color: "from-orange-500/20" }
];

const fadeUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

export function StreamSelectionView({ onSelectStream }: StreamSelectionViewProps) {
    return (
        <motion.div
            key="selection"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="max-w-4xl mx-auto text-center pt-20"
        >
            <motion.h1
                variants={fadeUpVariants}
                className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
            >
                Let's find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">perfect match</span>.
            </motion.h1>
            <motion.p
                variants={fadeUpVariants}
                className="text-white/60 mb-16 text-xl max-w-2xl mx-auto font-medium"
            >
                Select your stream to see mocks tailored exactly to your subjects.
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {streamOptions.map((stream) => (
                    <motion.button
                        key={stream.id}
                        variants={{
                            hidden: { opacity: 0, scale: 0.9 },
                            visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
                        }}
                        onClick={() => onSelectStream(stream.id)}
                        className="group relative bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all text-left overflow-hidden flex flex-col items-start gap-6"
                    >
                        <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${stream.color} to-transparent blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 relative z-10">
                            {stream.icon}
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-2">{stream.label}</h3>
                            <p className="text-white/50 text-sm font-medium">{stream.desc}</p>
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}
