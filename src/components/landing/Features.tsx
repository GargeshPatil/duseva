import { Monitor, BarChart3, Trophy, BrainCircuit } from "lucide-react";

const features = [
    {
        icon: Monitor,
        title: "100% Real Exam Interface",
        description: "Experience the exact NTA exam screen, timer, and navigation to eliminate exam-day anxiety.",
    },
    {
        icon: BarChart3,
        title: "Deep Performance Analytics",
        description: "Get subject-wise breakdown, time management analysis, and accuracy reports to identify weak areas.",
    },
    {
        icon: Trophy,
        title: "All India Rank & Percentile",
        description: "Compete with thousands of serious aspirants and know exactly where you stand with predictive rank.",
    },
    {
        icon: BrainCircuit,
        title: "Detailed Solutions & Logic",
        description: "Don't just see the answer—understand the concept with step-by-step explanations for every question.",
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-slate-50">
            <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                        Everything You Need to Ace CUET
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Designed by top educators and students from SRCC & Hindu College to help you maximize your score in minimum time.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-primary mb-6 ring-1 ring-blue-100">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
