import { PremiumGradient } from "@/components/ui/PremiumGradient";

export default function TestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-transparent flex flex-col relative text-text-primary">
            <PremiumGradient variant="examSafe" className="fixed inset-0" />
            {/* No Navbar or Sidebar here - distraction free mode */}
            {children}
        </div>
    );
}
