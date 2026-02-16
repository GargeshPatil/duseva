"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Search, Ban, CheckCircle, Mail, Loader2, RefreshCw } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { User } from "@/types/admin";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";

export default function UserManagementPage() {
    const { userData } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingRole, setUpdatingRole] = useState<string | null>(null);

    const isDeveloper = userData?.role === 'developer';

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setLoading(true);
        const data = await firestoreService.getUsers();
        setUsers(data);
        setLoading(false);
    }

    async function handleRoleUpdate(uid: string, newRole: string) {
        if (!isDeveloper) return;
        setUpdatingRole(uid);

        const success = await firestoreService.updateUserRole(
            uid,
            newRole as 'student' | 'admin' | 'developer'
        );

        if (success) {
            // Optimistic update
            setUsers(users.map(u => u.id === uid ? { ...u, role: newRole as any } : u));
        } else {
            alert("Failed to update role. Please try again.");
        }
        setUpdatingRole(null);
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage student access and accounts.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadUsers} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4">Tests Taken</th>
                                <th className="px-6 py-4">Avg. Score</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                            Loading users...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No users found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{user.name}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
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
                                                        className="text-xs rounded border border-slate-200 px-2 py-1 bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="developer">Developer</option>
                                                    </select>
                                                    {updatingRole === user.id && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
                                                </div>
                                            ) : (
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium 
                                                    ${user.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                                                        user.role === 'developer' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                                    {user.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {user.joinedAt}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {user.testsTaken}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {user.avgScore > 0 ? `${user.avgScore}%` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600">
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
            </div>
        </div>
    );
}
