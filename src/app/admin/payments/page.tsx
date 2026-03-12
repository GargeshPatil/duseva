"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Search, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { firestoreService } from "@/services/firestoreService";
import { Transaction } from "@/types/admin";
import { Input } from "@/components/ui/Input";

export default function PaymentsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    async function loadTransactions() {
        const data = await firestoreService.getRecentTransactions();
        setTransactions(data);
        setLoading(false);
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadTransactions();
    }, []);

    const filteredTransactions = transactions.filter(tx =>
        tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = transactions
        .filter(t => t.status === 'success')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Payments & Transactions</h1>
                    <p className="text-text-muted mt-1">Track revenue and purchase history.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-text-muted">Total Revenue</p>
                    <h2 className="text-2xl font-bold text-semantic-success">₹{totalRevenue.toLocaleString()}</h2>
                </div>
            </div>

            <div className="bg-surface-glass backdrop-blur-md rounded-xl shadow-2xl border border-white/10">
                <div className="p-4 border-b border-white/10 flex justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                        <Input
                            placeholder="Search by User or Transaction ID..."
                            className="pl-9 bg-surface-base border-white/20 text-text-primary placeholder:text-text-muted"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="gap-2 border-white/20 text-text-primary hover:bg-white/10">
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-text-secondary font-medium border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Item</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-text-muted">Loading transactions...</td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-text-muted">No transactions found.</td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-text-muted">
                                            {tx.id}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-text-primary">
                                            {tx.userName}
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary">
                                            {tx.testTitle || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-text-primary">
                                            ₹{tx.amount}
                                        </td>
                                        <td className="px-6 py-4 text-text-muted text-xs">
                                            {tx.date}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                        ${tx.status === 'success' ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/20' :
                                                    tx.status === 'failed' ? 'bg-semantic-error/10 text-semantic-error border-semantic-error/20' :
                                                        'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20'}
                      `}>
                                                {tx.status === 'success' && <CheckCircle className="h-3 w-3" />}
                                                {tx.status === 'failed' && <XCircle className="h-3 w-3" />}
                                                {tx.status === 'pending' && <Clock className="h-3 w-3" />}
                                                <span className="capitalize">{tx.status}</span>
                                            </span>
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
