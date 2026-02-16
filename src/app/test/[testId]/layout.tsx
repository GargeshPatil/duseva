export default function TestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* No Navbar or Sidebar here - distraction free mode */}
            {children}
        </div>
    );
}
