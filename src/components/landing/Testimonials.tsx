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
        <section id="testimonials" className="py-24 bg-white border-t border-slate-100">
            <div className="container">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 text-center mb-16 tracking-tight">
                    Trusted by Top Scorer Students
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-slate-50 p-8 rounded-2xl relative border border-slate-100 hover:border-blue-100 transition-colors">
                            <div className="text-6xl text-blue-100 absolute top-4 left-6 font-serif select-none">&quot;</div>
                            <p className="text-slate-700 mb-8 relative z-10 pt-6 text-lg font-medium leading-relaxed">
                                {t.quote}
                            </p>
                            <div className="border-t border-slate-200 pt-6">
                                <div className="font-bold text-slate-900 text-lg">{t.author}</div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm text-primary font-bold bg-blue-50 px-2 py-0.5 rounded-full">{t.score}</span>
                                </div>
                                <div className="text-sm text-slate-500 font-medium">{t.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
