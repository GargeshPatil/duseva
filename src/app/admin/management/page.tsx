"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    FileText,
    Library,
    Package,
    CreditCard
} from "lucide-react";
import { OverviewTab } from "@/components/admin/management/OverviewTab";
import { QuestionsTab } from "@/components/admin/management/QuestionsTab";
import { TestsTab } from "@/components/admin/management/TestsTab";
import { BundlesTab } from "@/components/admin/management/BundlesTab";
import { PricingTab } from "@/components/admin/management/PricingTab";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function TestManagementPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const initialTab = searchParams.get('tab') as 'overview' | 'questions' | 'tests' | 'bundles' | 'pricing' || 'overview';
    const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'tests' | 'bundles' | 'pricing'>(initialTab);

    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams);
        params.set('tab', tab);
        router.push(`${pathname}?${params.toString()}`);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'questions', label: 'Question Bank', icon: Library },
        { id: 'tests', label: 'Tests', icon: FileText },
        { id: 'bundles', label: 'Bundles', icon: Package },
        { id: 'pricing', label: 'Pricing', icon: CreditCard },
    ] as const;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Test Management</h1>
                    <p className="text-slate-500 mt-1">Central command center for all exam content.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'bg-blue-50 text-blue-700 shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }
                        `}
                    >
                        <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && <OverviewTab onNavigate={(tab) => handleTabChange(tab as any)} />}
                {activeTab === 'questions' && <QuestionsTab />}
                {activeTab === 'tests' && <TestsTab />}
                {activeTab === 'bundles' && <BundlesTab />}
                {activeTab === 'pricing' && <PricingTab />}
            </div>
        </div>
    );
}
