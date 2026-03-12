"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { firestoreService } from "@/services/firestoreService";
import { ImageItem } from "@/components/admin/cms/CUET2026Editors";
import { Loader2, X, MessageCircleHeart } from "lucide-react";

// Helper for scattered positioning
const getTransform = (id: number) => {
    const rotations = [-4, 3, -5, 6, -3, 5, -6, 4, -2, 5];
    const xOffsets = [-10, 15, -20, 10, -15, 20, -10, 15, -25, 25];
    const yOffsets = [10, -15, 20, -10, 25, -5, 15, -20, 25, -10];
    return {
        rotate: rotations[id % rotations.length],
        x: xOffsets[id % xOffsets.length],
        y: yOffsets[id % yOffsets.length]
    };
};

export function StudentStories() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

    useEffect(() => {
        async function fetchStories() {
            try {
                const cmsData = await firestoreService.getCMSContent();
                const storiesData = cmsData.find(c => c.section === 'landing' && c.key === 'student_stories');
                if (storiesData) {
                    setImages(JSON.parse(storiesData.value) as ImageItem[]);
                }
            } catch (error) {
                console.error("Failed to load stories:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStories();
    }, []);

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
    };

    return (
        <section className="py-32 relative px-6 overflow-hidden">
            <div className="container mx-auto max-w-7xl relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUpVariants}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center justify-center p-4 bg-pink-500/10 rounded-full mb-6">
                        <MessageCircleHeart className="h-8 w-8 text-pink-400" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-pink-200">Wall of Love</span> ❤️
                    </h2>
                    <p className="text-xl text-white/50 max-w-2xl mx-auto font-medium">
                        Don't just take our word for it. Here is what our community is saying.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-white/30" />
                    </div>
                ) : images.length > 0 ? (
                    <div className="relative min-h-[600px] flex flex-wrap justify-center items-center gap-8 py-12 px-4 max-w-5xl mx-auto">
                        {images.map((img, idx) => {
                            const { rotate, x, y } = getTransform(idx);
                            const isSelected = selectedImage?.id === img.id;

                            return (
                                <motion.div
                                    layoutId={`story-container-${img.id}`}
                                    key={img.id}
                                    onClick={() => setSelectedImage(img)}
                                    // Base scattered positioning
                                    style={{
                                        rotate: isSelected ? 0 : rotate,
                                        x: isSelected ? 0 : x,
                                        y: isSelected ? 0 : y,
                                    }}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, margin: "100px" }}
                                    transition={{
                                        type: "spring", stiffness: 200, damping: 20, delay: idx * 0.05
                                    }}
                                    whileHover={{
                                        scale: 1.05,
                                        rotate: 0, // Straighten on hover for a clean UI feel
                                        zIndex: 10,
                                        transition: { duration: 0.2 }
                                    }}
                                    className={`relative w-48 sm:w-60 aspect-[4/5] cursor-pointer group rounded-3xl shadow-2xl border border-white/10 bg-white/5 backdrop-blur-md p-2 overflow-hidden ${isSelected ? 'opacity-0 pointer-events-none' : ''}`}
                                >
                                    {/* Subtle Glow inside the card */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                    <div className="w-full h-full relative overflow-hidden rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                                        <motion.img
                                            layoutId={`story-image-${img.id}`}
                                            src={img.url}
                                            alt={img.altText || "Student Story"}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://placehold.co/400x500?text=Invalid+Image';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-white font-bold text-lg leading-tight mb-1 truncate drop-shadow-md">
                                                {img.name || img.altText || "Student Shoutout"}
                                            </h3>
                                            {(img.college || img.altText) && (
                                                <p className="text-xs text-white/70 truncate font-medium">
                                                    {img.college || "Verified Achiever 🚀"}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-white/30 border border-white/5 bg-white/5 rounded-3xl">
                        No student stories are currently featured.
                    </div>
                )}
            </div>

            {/* Expanded Overlay */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/60"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                        >
                            <X className="h-6 w-6" />
                        </motion.button>

                        <motion.div
                            layoutId={`story-container-${selectedImage.id}`}
                            className="relative w-full max-w-lg aspect-[4/5] bg-white/5 backdrop-blur-xl border border-white/10 p-2 sm:p-3 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] cursor-default overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-full flex-1 relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-black/20 border border-white/5">
                                <motion.img
                                    layoutId={`story-image-${selectedImage.id}`}
                                    src={selectedImage.url}
                                    alt={selectedImage.altText || "Student Story"}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://placehold.co/800x1000?text=Invalid+Image';
                                    }}
                                />
                            </div>

                            <div className="pt-6 pb-4 px-6 sm:px-8 flex flex-col items-center justify-center bg-transparent">
                                <h3 className="text-white font-bold text-2xl sm:text-3xl text-center mb-2 drop-shadow-md">
                                    {selectedImage.name || selectedImage.altText || "Student Shoutout"}
                                </h3>
                                {(selectedImage.college || selectedImage.altText) && (
                                    <p className="text-sm sm:text-base text-white/50 text-center font-medium bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                                        {selectedImage.college || "Verified Achiever 🚀"}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
