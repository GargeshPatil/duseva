import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { firestoreService } from "@/services/firestoreService";
import ReactMarkdown from 'react-markdown';

interface InteractiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    cmsKey: string;
    icon: React.ReactNode;
}

export function InteractiveModal({ isOpen, onClose, title, cmsKey, icon }: InteractiveModalProps) {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && !content) {
            const fetchContent = async () => {
                setLoading(true);
                try {
                    const allContent = await firestoreService.getCMSContent();
                    const item = allContent.find(c => c.key === cmsKey && c.section === 'cuet2026');

                    if (item) {
                        setContent(item.value);
                    } else {
                        setContent("Content coming soon! Please check back later.");
                    }
                } catch (error) {
                    console.error("Failed to load CMS content:", error);
                    setContent("Failed to load content. Please try again later.");
                } finally {
                    setLoading(false);
                }
            };
            fetchContent();
        }
    }, [isOpen, cmsKey, content]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-0"
                    />
                    {/* Modal dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-slate-900 border border-white/10 w-full max-w-3xl max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative z-10"
                    >
                        {/* Ambient Glow in Modal */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[200px] bg-blue-500/20 blur-[100px] pointer-events-none rounded-full" />

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/10 shrink-0 relative z-10 bg-slate-900/50 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                    {icon}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content Boundary */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar relative z-10">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-40 text-blue-400 gap-4">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                    <span className="font-medium animate-pulse">Fetching latest updates...</span>
                                </div>
                            ) : (
                                <div className="prose prose-invert prose-blue max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-p:leading-relaxed prose-li:leading-relaxed">
                                    <ReactMarkdown>{content || ""}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
