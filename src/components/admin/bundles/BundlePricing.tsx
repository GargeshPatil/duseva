import { Input } from "@/components/ui/Input";
import { Bundle } from "@/types/admin";

interface BundlePricingProps {
    bundle: Partial<Bundle>;
    setBundle: (bundle: Partial<Bundle>) => void;
}

export function BundlePricing({ bundle, setBundle }: BundlePricingProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Pricing</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                    <Input
                        type="number"
                        value={bundle.price}
                        onChange={(e) => setBundle({ ...bundle, price: parseFloat(e.target.value) })}
                        min={0}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Original Price (₹)</label>
                    <Input
                        type="number"
                        value={bundle.originalPrice}
                        onChange={(e) => setBundle({ ...bundle, originalPrice: parseFloat(e.target.value) })}
                        min={0}
                        placeholder="Optional (for strike-through)"
                    />
                </div>
            </div>
        </div>
    );
}
