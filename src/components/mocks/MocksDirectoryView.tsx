import { motion } from "framer-motion";
import { Loader2, Package } from "lucide-react";
import { TestCard } from "@/components/dashboard/TestCard";
import { Test } from "@/types/admin";

interface MocksDirectoryViewProps {
    selectedStream: string | null;
    loading: boolean;
    filteredTests: Test[];
    onClearPreference: () => void;
}

export function MocksDirectoryView({
    selectedStream,
    loading,
    filteredTests,
    onClearPreference
}: MocksDirectoryViewProps) {
    return (
        <motion.div
            key="directory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16 pt-10"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center gap-4 flex-wrap">
                        Mocks for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{selectedStream}</span>
                    </h1>
                    <p className="text-white/50 mt-4 text-lg font-medium flex items-center gap-4">
                        {loading ? "Waking up the servers..." : `Found ${filteredTests.length} beautifully crafted tests.`}
                        <button onClick={onClearPreference} className="text-sm px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors">
                            Change Stream
                        </button>
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-cta-primary" />
                    <p className="text-white/50 font-medium">Preparing your study material...</p>
                </div>
            ) : (
                <div className="space-y-20">
                    {/* Test Cards (Reusing existing components but in a dark context) */}
                    <div className="space-y-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTests.map((test) => (
                                <TestCard
                                    key={test.id}
                                    test={{ ...test, attempts: 0 }}
                                    onStart={() => window.location.href = `/test/${test.id}`}
                                />
                            ))}

                            {filteredTests.length === 0 && (
                                <div className="col-span-full py-32 text-center text-white/50 bg-white/5 rounded-[2rem] border border-dashed border-white/20">
                                    We are curating the best {selectedStream} mocks right now. Check back very soon!
                                </div>
                            )}
                        </div>
                    </div>

                    </div>
            )}
        </motion.div>
    );
}
