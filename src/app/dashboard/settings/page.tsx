"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { User, Lock, Mail, Save, LogOut } from "lucide-react";

export default function SettingsPage() {
    const { userData, logout } = useAuth();
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
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
                        {name ? name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{userData?.name}</h2>
                        <p className="text-slate-500 text-sm capitalize">{userData?.role}</p>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={userData?.email}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                                />
                            </div>
                            <Button variant="outline" size="sm">Change Email</Button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Button variant="primary" onClick={handleSave} disabled={isSaving} className="gap-2">
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    {message && (
                        <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {message.text}
                        </span>
                    )}
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-slate-400" /> Security
                </h3>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                        <p className="font-medium text-slate-900">Password</p>
                        <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                    </div>
                    <Button variant="outline" size="sm">Change Password</Button>
                </div>

                <div className="pt-4">
                    <Button
                        onClick={logout}
                        variant="outline"
                        fullWidth
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200 text-center justify-center"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
