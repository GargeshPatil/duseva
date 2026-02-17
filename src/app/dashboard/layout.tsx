import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <div className="md:ml-64 flex flex-col min-h-screen pb-16 md:pb-0">
                <Header />
                <main className="flex-1 p-4 md:p-6">
                    {children}
                </main>
            </div>
            <MobileNav />
        </div>
    );
}
