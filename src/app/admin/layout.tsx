import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <AdminSidebar />

            <div className="md:ml-64 min-h-screen flex flex-col">
                {/* Mobile Header Placeholder (can be expanded later) */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 md:hidden sticky top-0 z-30">
                    <div className="font-bold text-slate-900">CUET Admin Panel</div>
                </header>

                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
