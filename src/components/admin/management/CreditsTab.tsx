import React, { useState, useEffect } from 'react';
import { CreditPackage, SiteSettings } from '@/types/admin';
import { firestoreService } from '@/services/firestoreService';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, X, Info } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function CreditsTab() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [packages, setPackages] = useState<CreditPackage[]>([]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<CreditPackage>>({});

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const data = await firestoreService.getSettings();
        setSettings(data);
        setPackages(data.creditPackages || []);
        setLoading(false);
    };

    const handleSavePackages = async (newPackages: CreditPackage[]) => {
        if (!settings) return;
        setSaving(true);
        const updatedSettings = { ...settings, creditPackages: newPackages };
        const success = await firestoreService.updateSettings(updatedSettings);
        if (success) {
            setSettings(updatedSettings);
            setPackages(newPackages);
        } else {
            alert('Failed to save credit packages.');
        }
        setSaving(false);
    };

    const handleAdd = () => {
        const newPkg: CreditPackage = {
            id: uuidv4(),
            credits: 10,
            price: 99,
            isPopular: false,
            description: ''
        };
        handleSavePackages([...packages, newPkg]);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this credit package?")) {
            handleSavePackages(packages.filter(p => p.id !== id));
        }
    };

    const startEdit = (pkg: CreditPackage) => {
        setEditingId(pkg.id);
        setEditForm(pkg);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = () => {
        if (!editForm.id) return;
        const mappedPackages = packages.map(p => p.id === editForm.id ? editForm as CreditPackage : p);
        handleSavePackages(mappedPackages);
        setEditingId(null);
        setEditForm({});
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-black/20 p-6 rounded-2xl border border-white/10">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Credit Packages</h2>
                    <p className="text-white/60">Define the pricing tiers for credit purchases. These appear dynamically in the Student Dashboard.</p>
                </div>
                <button
                    onClick={handleAdd}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-cta-primary hover:bg-cta-hover text-white rounded-xl font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Package
                </button>
            </div>

            <div className="bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-white/50 text-sm font-semibold uppercase tracking-wider">
                            <th className="p-4 pl-6">Credits</th>
                            <th className="p-4">Price ({settings?.currency || 'INR'})</th>
                            <th className="p-4">Popular?</th>
                            <th className="p-4">Description</th>
                            <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {packages.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-white/40">
                                        No credit packages defined. Click "New Package" to create one.
                                    </td>
                                </tr>
                            )}
                            {packages.map((pkg) => (
                                <motion.tr
                                    key={pkg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="border-b border- सफेद/5 hover:bg-white/[0.02] transition-colors"
                                >
                                    {editingId === pkg.id ? (
                                        <>
                                            <td className="p-4 pl-6">
                                                <input
                                                    type="number"
                                                    value={editForm.credits}
                                                    onChange={e => setEditForm({ ...editForm, credits: parseInt(e.target.value) || 0 })}
                                                    className="w-24 bg-black/40 border border-white/10 rounded px-2 py-1 text-white"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    value={editForm.price}
                                                    onChange={e => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                                                    className="w-24 bg-black/40 border border-white/10 rounded px-2 py-1 text-white"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.isPopular}
                                                    onChange={e => setEditForm({ ...editForm, isPopular: e.target.checked })}
                                                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-cta-primary focus:ring-cta-primary"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="text"
                                                    value={editForm.description || ''}
                                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                    placeholder="E.g. Best Value"
                                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-white"
                                                />
                                            </td>
                                            <td className="p-4 pr-6 text-right space-x-2">
                                                <button onClick={saveEdit} disabled={saving} className="p-2 text-green-400 hover:bg-white/10 rounded-lg">
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button onClick={cancelEdit} disabled={saving} className="p-2 text-white/50 hover:bg-white/10 rounded-lg">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-4 pl-6 font-bold text-white text-lg">
                                                <span className="flex items-center gap-2">
                                                    {pkg.credits}
                                                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-white/10 text-white/70">Credits</span>
                                                </span>
                                            </td>
                                            <td className="p-4 text-white font-medium">
                                                {settings?.currency === 'INR' ? '₹' : '$'} {pkg.price}
                                            </td>
                                            <td className="p-4">
                                                {pkg.isPopular ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                        POPULAR
                                                    </span>
                                                ) : (
                                                    <span className="text-white/20">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-white/60 text-sm">
                                                {pkg.description || '-'}
                                            </td>
                                            <td className="p-4 pr-6 text-right space-x-1">
                                                <button
                                                    onClick={() => startEdit(pkg)}
                                                    disabled={saving || editingId !== null}
                                                    className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pkg.id)}
                                                    disabled={saving || editingId !== null}
                                                    className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-blue-200 text-sm">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
                <p>
                    <strong>Rules:</strong> All tests statically cost 1 Credit. When a student pays on Razorpay, they receive the exact amount of credits defined in the package they selected. If you delete a package, it instantly disappears from the student dashboard.
                </p>
            </div>
        </div>
    );
}
