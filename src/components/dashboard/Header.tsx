export function Header() {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="text-sm font-medium text-slate-500">
                Dashboard / Overview
            </div>

            <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                    JD
                </div>
            </div>
        </header>
    );
}
