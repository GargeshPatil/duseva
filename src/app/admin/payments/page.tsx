"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Search, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { mockDb } from "@/services/mockDb";
import { Transaction } from "@/types/admin";
import { Input } from "@/components/ui/Input";

export default function PaymentsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadTransactions();
    }, []);

    async function loadTransactions() {
        setLoading(true);
        const data = await mockDb.getTransactions();
        setTransactions(data);
        setLoading(false);
    }

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
                    <h1 className="text-2xl font-bold text-slate-900">Payments & Transactions</h1>
                    <p className="text-slate-500 mt-1">Track revenue and purchase history.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500">Total Revenue</p>
                    <h2 className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</h2>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-4 border-b border-slate-100 flex justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by User or Transaction ID..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Item</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading transactions...</td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No transactions found.</td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                            {tx.id}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {tx.userName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {tx.testTitle || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            ₹{tx.amount}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                            {tx.date}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                        ${tx.status === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    tx.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-200'}
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
