"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Search, Mail, Loader2, RefreshCw, Users, Shield, TrendingUp, Filter } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { User } from "@/types/admin";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { motion, Variants } from "framer-motion";

export default function UserManagementPage() {
    const { userData } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingRole, setUpdatingRole] = useState<string | null>(null);

    const isDeveloper = userData?.role === 'developer';

    async function loadUsers() {
        setLoading(true);
        try {
            const data = await firestoreService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadUsers();
    }, []);

    async function handleRoleUpdate(uid: string, newRole: string) {
        if (!isDeveloper) return;
        setUpdatingRole(uid);

        const success = await firestoreService.updateUserRole(
            uid,
            newRole as 'student' | 'admin' | 'developer'
        );

        if (success) {
            // Optimistic update
            setUsers(users.map(u => u.id === uid ? { ...u, role: newRole as User['role'] } : u));
        } else {
            alert("Failed to update role. Please try again.");
        }
        setUpdatingRole(null);
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-[1600px] mx-auto pb-20"
        >
            {/* Header Hero */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-surface-card/60 border border-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cta-primary/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-6">
                            <Users className="h-4 w-4 text-brand-purple" /> User Management
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tight leading-tight mb-2">
                            Accounts & Access
                        </h1>
                        <p className="text-white/60 font-medium max-w-lg">
                            Manage student accounts, control admin privileges, and track user engagement across the platform.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={loadUsers}
                            disabled={loading}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md rounded-2xl h-12 px-6 gap-2 transition-all"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                        </Button>
                        <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md rounded-2xl h-12 px-6 gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                            <TrendingUp className="h-4 w-4" /> Export CSV
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats purely for visual flair */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Students", value: users.filter(u => u.role === 'student').length, icon: Users, color: "text-blue-400" },
                    { label: "Administrators", value: users.filter(u => u.role === 'admin').length, icon: Shield, color: "text-purple-400" },
                    { label: "Developers", value: users.filter(u => u.role === 'developer').length, icon: Shield, color: "text-rose-400" },
                ].map((stat, i) => (
                    <div key={i} className="bg-surface-card/60 border border-white/10 backdrop-blur-xl rounded-[1.5rem] p-6 flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-white/5 border border-white/5 shadow-inner ${stat.color}`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white tracking-tight">{loading ? '-' : stat.value}</div>
                            <div className="text-sm text-white/50 font-medium">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Main Content Table */}
            <motion.div variants={itemVariants} className="bg-surface-card/60 border border-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-elevated/30">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-11 h-12 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-cta-primary/50 rounded-xl w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="secondary" className="bg-black/20 hover:bg-white/10 text-white border border-white/10 rounded-xl h-12 px-4 gap-2 w-full sm:w-auto">
                        <Filter className="h-4 w-4 text-white/60" /> Filter
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-black/20 text-white/60 font-semibold border-b border-white/10">
                            <tr>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">User</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Role</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Joined</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Tests Taken</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px]">Avg. Score</th>
                                <th className="px-6 py-5 uppercase tracking-wider text-[11px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-cta-primary" />
                                            <span className="text-white/50 font-medium tracking-wide">Fetching users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                                            <Search className="h-6 w-6 text-white/40" />
                                        </div>
                                        <div className="text-white/70 font-medium text-lg">No users found</div>
                                        <div className="text-white/40 text-sm mt-1">Try adjusting your search query.</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-bold text-sm text-white shadow-inner">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white tracking-wide">{user.name}</div>
                                                    <div className="text-xs text-white/50 font-medium">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isDeveloper ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                                        disabled={updatingRole === user.id}
                                                        className="text-xs font-semibold rounded-lg border border-white/10 px-3 py-1.5 bg-black/40 text-white focus:ring-2 focus:ring-cta-primary/50 outline-none transition-all appearance-none cursor-pointer hover:bg-white/5"
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="developer">Developer</option>
                                                    </select>
                                                    {updatingRole === user.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-cta-primary" />}
                                                </div>
                                            ) : (
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border
                                                    ${user.role === 'admin' ? 'bg-brand-purple/20 text-brand-purple border-brand-purple/30' :
                                                        user.role === 'developer' ? 'bg-semantic-warning/20 text-amber-400 border-amber-500/30' :
                                                            'bg-white/10 text-white/70 border-white/10'}`}>
                                                    {user.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-white/60 font-medium text-sm">
                                            {user.joinedAt}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-white font-medium shadow-inner">
                                                {user.testsTaken || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.avgScore > 0 ? (
                                                <span className="text-emerald-400 font-bold bg-semantic-success/10 px-2 py-1 rounded-md">
                                                    {user.avgScore}%
                                                </span>
                                            ) : (
                                                <span className="text-white/30 font-medium">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end">
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                    <Mail className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
