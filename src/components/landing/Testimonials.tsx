import { PremiumGradient } from "@/components/ui/PremiumGradient";

export function Testimonials() {
    const testimonials = [
        {
            quote: "The mock interface is exactly like the real exam. It helped me manage my time and I scored 100 percentile in English!",
            author: "Aditi S.",
            score: "Score: 780/800",
            role: "SRCC, Batch 2025"
        },
        {
            quote: "Analytical reports are a game changer. I realized I was spending too much time on easy questions. Fixed it and improved by 150 marks.",
            author: "Rahul M.",
            score: "Score: 750/800",
            role: "Hindu College"
        },
        {
            quote: "I tried many platforms, but this one is the most relevant. The questions are actually NTA level, not too easy or too hard.",
            author: "Sneha P.",
            score: "Score: 765/800",
            role: "Miranda House"
        }
    ];

    return (
        <section id="testimonials" className="relative py-24 bg-surface-elevated border-t border-border overflow-hidden">
            {/* Top Transition Gradient */}
            <div className="absolute top-0 left-0 right-0 h-64 -translate-y-1/2 pointer-events-none z-0">
                <PremiumGradient variant="transition" />
            </div>

            <div className="container relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-text-primary text-center mb-16 tracking-tight">
                    Trusted by Top Scorer Students
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-surface-card p-8 rounded-2xl relative border border-border hover:border-cta-primary/30 transition-colors">
                            <div className="text-6xl text-cta-primary/20 absolute top-4 left-6 font-serif select-none">&quot;</div>
                            <p className="text-text-secondary mb-8 relative z-10 pt-6 text-lg font-medium leading-relaxed">
                                {t.quote}
                            </p>
                            <div className="border-t border-border pt-6">
                                <div className="font-bold text-text-primary text-lg">{t.author}</div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm text-cta-primary font-bold bg-surface-glass px-2 py-0.5 rounded-full">{t.score}</span>
                                </div>
                                <div className="text-sm text-text-muted font-medium">{t.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
