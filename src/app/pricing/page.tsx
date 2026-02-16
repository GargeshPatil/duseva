import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

export default function PricingPage() {
    const plans = [
        {
            name: "Subject Mock",
            price: "₹99",
            description: "Perfect for weak subject improvement",
            features: [
                "5 Full Length Subject Mocks",
                "Detailed Solutions",
                "Performance Analysis",
                "Valid for 6 months"
            ],
            cta: "Buy Now",
            popular: false
        },
        {
            name: "All-In-One Bundle",
            price: "₹999",
            description: "Complete preparation package",
            features: [
                "40+ Full Length Mocks",
                "All Streams (Science, Commerce, Arts)",
                "General Test + English Included",
                "Chapter-wise Tests",
                "Rank Prediction",
                "Valid till Exam Date"
            ],
            cta: "Get Full Access",
            popular: true
        },
        {
            name: "General Test + English",
            price: "₹499",
            description: "Most common combination",
            features: [
                "20 Full Length Mocks",
                "10 General Test + 10 English",
                "Latest Pattern 2026",
                "Valid till Exam Date"
            ],
            cta: "Buy Now",
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="py-20">
                <div className="container">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-lg text-slate-600">
                            Invest in your future for less than the cost of a pizza. No hidden fees.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`
                  bg-white rounded-2xl p-8 border relative flex flex-col
                  ${plan.popular
                                        ? "border-blue-500 shadow-xl scale-105 z-10"
                                        : "border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                                    }
                `}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </div>
                                )}

                                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                </div>
                                <p className="text-slate-500 mb-8 text-sm">{plan.description}</p>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                                            <Check className="h-5 w-5 text-green-500 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    variant={plan.popular ? "primary" : "outline"}
                                    fullWidth
                                    className={plan.popular ? "bg-blue-600 hover:bg-blue-700" : ""}
                                >
                                    {plan.cta}
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <p className="text-slate-500 mb-4">Trusted by 10,000+ Students across India</p>
                        <div className="flex justify-center gap-8 opacity-50 grayscale">
                            {/* Trust badges placeholders */}
                            <div className="font-bold text-xl">Razorpay</div>
                            <div className="font-bold text-xl">UPI</div>
                            <div className="font-bold text-xl">Visa</div>
                            <div className="font-bold text-xl">Mastercard</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
