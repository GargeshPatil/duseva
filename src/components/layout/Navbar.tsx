import Link from 'next/link';
import { Button } from '../ui/Button';
import { BookOpen, Menu } from 'lucide-react';

export function Navbar() {
    return (
        <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
            <div className="container flex items-center justify-between h-16">
                <div className="flex items-center gap-2">
                    <BookOpen className="text-primary h-6 w-6" />
                    <Link href="/" className="text-xl font-bold text-primary">
                        CUET Prep
                    </Link>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                        Features
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                        Pricing
                    </Link>
                    <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
                        Testimonials
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Link href="/auth/login">
                        <Button variant="ghost" size="sm">Log in</Button>
                    </Link>
                    <Link href="/auth/signup">
                        <Button size="sm">Get Started</Button>
                    </Link>
                </div>

                {/* Mobile Menu Button (Placeholder for functionality) */}
                <button className="md:hidden p-2 text-foreground">
                    <Menu className="h-6 w-6" />
                </button>
            </div>
        </nav>
    );
}
