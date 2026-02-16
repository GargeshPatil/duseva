"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save, AlertTriangle, Shield, Globe, Mail, Clock, Loader2 } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { SiteSettings, AuditLog } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
    const { userData } = useAuth();
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const isDeveloper = userData?.role === 'developer';

    useEffect(() => {
        loadSettings();
        if (isDeveloper) {
            loadAuditLogs();
        }
    }, [isDeveloper]);

    async function loadSettings() {
        setLoading(true);
        const data = await firestoreService.getSettings();
        setSettings(data);
        setLoading(false);
    }

    async function loadAuditLogs() {
        setLogsLoading(true);
        const logs = await firestoreService.getAuditLogs();
        setAuditLogs(logs);
        setLogsLoading(false);
    }

    async function handleSave() {
        if (!settings) return;
        setSaving(true);

        const success = await firestoreService.updateSettings(settings);

        setSaving(false);
        if (success) {
            alert("Settings updated successfully!");
        } else {
            alert("Failed to update settings.");
        }
    }

    if (loading || !settings) return (
        <div className="p-8 flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" /> Loading settings...
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in max-w-4xl">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500 mt-1">Manage global site configurations.</p>
                </div>
                {/* Only Developers can save global settings? Or Admins too? Assuming both for now unless specific requirement. */}
                <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="grid gap-6">
                {/* General Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-500" />
                        General Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Site Name</label>
                            <Input
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
                            <Input
                                value={settings.supportEmail}
                                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                            <select
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                                value={settings.currency}
                                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Security & Access */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-500" />
                        Security & Access
                    </h3>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                            <h4 className="font-medium text-slate-900">Maintenance Mode</h4>
                            <p className="text-sm text-slate-500">Enable to temporarily disable public access.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.maintenanceMode}
                                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {settings.maintenanceMode && (
                        <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg flex gap-2 items-center">
                            <AlertTriangle className="h-4 w-4" />
                            Warning: Site is currently accessible only to admins.
                        </div>
                    )}
                </div>

                {/* Developer Only: Audit Logs */}
                {isDeveloper && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-slate-500" />
                            Audit Logs (Developer Only)
                        </h3>

                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            {logsLoading ? (
                                <div className="text-center py-8 text-slate-500">Loading logs...</div>
                            ) : auditLogs.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No logs found.</div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2">Action</th>
                                            <th className="px-4 py-2">User</th>
                                            <th className="px-4 py-2">Details</th>
                                            <th className="px-4 py-2 text-right">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {auditLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-2 font-medium text-slate-900">{log.action}</td>
                                                <td className="px-4 py-2 text-slate-600">
                                                    <div className="flex flex-col">
                                                        <span>{log.userName}</span>
                                                        <span className="text-xs text-slate-400">{log.userId}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-slate-600 max-w-xs truncate" title={log.details}>
                                                    {log.details}
                                                </td>
                                                <td className="px-4 py-2 text-right text-slate-400 text-xs">
                                                    {log.timestamp}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
