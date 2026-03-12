export function Header() {
    return (
        <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-30 md:hidden">
            <div className="text-sm font-semibold text-text-primary tracking-wide">
                Dashboard Overview
            </div>

            <div className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm font-bold text-white shadow-sm backdrop-blur-md">
                    JD
                </div>
            </div>
        </header>
    );
}
