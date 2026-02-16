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
        <section id="testimonials" className="py-20 bg-white border-t border-slate-100">
            <div className="container">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-16">
                    Trusted by Top Scorer Students
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-slate-50 p-8 rounded-2xl relative">
                            <div className="text-4xl text-blue-200 absolute top-4 left-6">"</div>
                            <p className="text-slate-700 mb-6 relative z-10 pt-4">
                                {t.quote}
                            </p>
                            <div>
                                <div className="font-bold text-slate-900">{t.author}</div>
                                <div className="text-xs text-secondary font-semibold mb-1">{t.score}</div>
                                <div className="text-sm text-slate-500">{t.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
