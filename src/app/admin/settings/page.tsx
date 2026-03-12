"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Save,
  AlertTriangle,
  Shield,
  Globe,
  Loader2,
  Settings,
  TerminalSquare
} from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { SiteSettings, AuditLog } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { motion, Variants } from "framer-motion";

export default function SettingsPage() {
    const { userData } = useAuth();
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const isDeveloper = userData?.role === 'developer';

    async function loadSettings() {
        setLoading(true);
        try {
            const data = await firestoreService.getSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setLoading(false);
        }
    }

    async function loadAuditLogs() {
        setLogsLoading(true);
        try {
            const logs = await firestoreService.getAuditLogs();
            setAuditLogs(logs);
        } catch (error) {
            console.error("Failed to load audit logs:", error);
        } finally {
            setLogsLoading(false);
        }
    }

    useEffect(() => {
        loadSettings();
        if (isDeveloper) {
            loadAuditLogs();
        }
    }, [isDeveloper]);

    async function handleSave() {
        if (!settings) return;
        setSaving(true);

        try {
            const success = await firestoreService.updateSettings(settings);
            if (success) {
                alert("Settings updated successfully!");
            } else {
                alert("Failed to update settings.");
            }
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("An error occurred while saving.");
        } finally {
            setSaving(false);
        }
    }

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

    if (loading || !settings) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-cta-primary" />
            <span className="text-white/50 font-medium tracking-wide">Loading System Configuration...</span>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-5xl pb-20"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
                    <p className="text-white/60 mt-1.5 text-lg">Manage global configurations and security parameters.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-cta-primary hover:bg-cta-hover text-white rounded-xl h-12 px-6 shadow-[0_0_20px_rgba(255,107,0,0.3)] gap-2 min-w-[140px] transition-all font-semibold"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? "Saving..." : "Save Configuration"}
                </Button>
            </motion.div>

            <div className="grid gap-8">
                {/* General Settings */}
                <motion.div variants={itemVariants} className="bg-surface-card/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/5 space-y-6">
                    <h3 className="font-bold text-white text-xl flex items-center gap-2 pb-4 border-b border-white/10">
                        <Globe className="h-5 w-5 text-blue-400" /> General Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-white/80 tracking-wide">Site Name</label>
                            <Input
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="bg-black/40 border-white/10 text-white h-12 rounded-xl focus-visible:ring-cta-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-white/80 tracking-wide">Support Email</label>
                            <Input
                                value={settings.supportEmail}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                className="bg-black/40 border-white/10 text-white h-12 rounded-xl focus-visible:ring-cta-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-white/80 tracking-wide">Default Currency</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                                <select
                                    className="w-full pl-10 pr-4 h-12 bg-black/40 border border-white/10 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-cta-primary/50 appearance-none transition-all cursor-pointer"
                                    value={settings.currency}
                                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                >
                                    <option value="INR" className="bg-surface-elevated text-white">INR (₹)</option>
                                    <option value="USD" className="bg-surface-elevated text-white">USD ($)</option>
                                    <option value="EUR" className="bg-surface-elevated text-white">EUR (€)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Security & Access */}
                <motion.div variants={itemVariants} className="bg-surface-card/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/5 space-y-6">
                    <h3 className="font-bold text-white text-xl flex items-center gap-2 pb-4 border-b border-white/10">
                        <Shield className="h-5 w-5 text-brand-purple" /> Security & Access Control
                    </h3>

                    <div className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                        ${settings.maintenanceMode ? 'bg-amber-500/5 border-amber-500/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                        <div className="flex gap-4">
                            <div className={`p-3 rounded-xl flex-shrink-0 ${settings.maintenanceMode ? 'bg-amber-500/10' : 'bg-black/20'}`}>
                                <Settings className={`h-6 w-6 ${settings.maintenanceMode ? 'text-amber-400' : 'text-white/40'}`} />
                            </div>
                            <div>
                                <h4 className={`font-bold text-lg ${settings.maintenanceMode ? 'text-amber-400' : 'text-white'}`}>
                                    Maintenance Mode
                                </h4>
                                <p className="text-sm text-white/50 mt-1">
                                    {settings.maintenanceMode
                                        ? "Site is currently inaccessible to the public. Only admins and developers can log in."
                                        : "Temporarily disable public access. Useful during major updates or database migrations."}
                                </p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer ml-auto sm:ml-0 flex-shrink-0">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.maintenanceMode}
                                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                            />
                            <div className="w-14 h-7 bg-black/40 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-purple/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-white/10 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-white border border-white/10"></div>
                        </label>
                    </div>

                    {settings.maintenanceMode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm rounded-xl flex gap-3 items-center backdrop-blur-md"
                        >
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <span className="font-medium tracking-wide">Warning: The platform is offline for standard users. Proceed with caution.</span>
                        </motion.div>
                    )}
                </motion.div>

                {/* Developer Only: Audit Logs */}
                {isDeveloper && (
                    <motion.div variants={itemVariants} className="bg-surface-card/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/5 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
                            <h3 className="font-bold text-white text-xl flex items-center gap-2">
                                <TerminalSquare className="h-5 w-5 text-emerald-400" /> System Audit Logs
                            </h3>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 uppercase tracking-wider">
                                Developer Access
                            </span>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
                            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                                {logsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                                        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                                        <span className="text-white/50 text-sm font-medium">Fetching secure logs...</span>
                                    </div>
                                ) : auditLogs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                                        <TerminalSquare className="h-8 w-8 text-white/10" />
                                        <span className="text-white/40 text-sm font-medium">No recent audit logs found in the system.</span>
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-white/5 text-white/40 font-semibold sticky top-0 backdrop-blur-xl z-10 border-b border-white/10">
                                            <tr>
                                                <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Action</th>
                                                <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Authorized User</th>
                                                <th className="px-6 py-4 uppercase tracking-wider text-[11px]">Event Details</th>
                                                <th className="px-6 py-4 uppercase tracking-wider text-[11px] text-right">Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {auditLogs.map(log => (
                                                <tr key={log.id} className="hover:bg-white/5 transition-colors group font-mono text-[13px]">
                                                    <td className="px-6 py-3 font-medium text-emerald-400">{log.action}</td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-sans">{log.userName}</span>
                                                            <span className="text-[10px] text-white/30">{log.userId}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-white/60 max-w-xs truncate group-hover:text-white/90 transition-colors" title={log.details}>
                                                        {log.details}
                                                    </td>
                                                    <td className="px-6 py-3 text-right text-white/30 text-[11px]">
                                                        {log.timestamp}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
