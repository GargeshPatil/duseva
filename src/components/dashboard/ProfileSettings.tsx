import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { User, Mail, Save } from "lucide-react";
import { motion, Variants } from "framer-motion";

interface ProfileSettingsProps {
    itemVariants: Variants;
}

export function ProfileSettings({ itemVariants }: ProfileSettingsProps) {
    const { userData } = useAuth();
    const [name, setName] = useState(userData?.name || "");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSave = async () => {
        if (!userData || !name.trim()) return;
        setIsSaving(true);
        setMessage(null);
        try {
            await updateDoc(doc(db, "users", userData.uid), {
                name: name.trim()
            });
            setMessage({ type: 'success', text: "Profile updated successfully!" });
        } catch (error) {
            setMessage({ type: 'error', text: "Failed to update profile." });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div variants={itemVariants} className="bg-surface-card/60 rounded-[2rem] border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500/5 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-white/10 pb-8 mb-8 relative z-10">
                <div className="h-20 w-20 bg-gradient-to-br from-cta-primary to-cta-hover rounded-full flex items-center justify-center text-white text-3xl font-black shadow-[0_0_20px_rgba(139,92,246,0.4)] shrink-0">
                    {name ? name[0].toUpperCase() : "U"}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">{userData?.name || "Student"}</h2>
                    <p className="text-cta-primary font-medium text-sm tracking-wide uppercase mt-1">{userData?.role || "Free Tier"}</p>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Display Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-white/80 transition-colors" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cta-primary/50 focus:border-cta-primary/50 transition-all shadow-inner"
                            placeholder="Enter your full name"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Registered Email</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 opacity-60">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                            <input
                                type="email"
                                value={userData?.email || ""}
                                disabled
                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white cursor-not-allowed"
                            />
                        </div>
                        <Button variant="outline" className="shrink-0 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white">
                            Change Email
                        </Button>
                    </div>
                    <p className="text-white/40 text-xs mt-2">Email changes require re-authentication.</p>
                </div>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cta-primary to-cta-hover shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all font-bold"
                >
                    <Save className="h-5 w-5" />
                    {isSaving ? "Saving..." : "Save Profile"}
                </Button>
                {message && (
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {message.text}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
