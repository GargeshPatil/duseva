import { Input } from "@/components/ui/Input";
import { Bundle } from "@/types/admin";

interface BundleBasicInfoProps {
    bundle: Partial<Bundle>;
    setBundle: (bundle: Partial<Bundle>) => void;
}

export function BundleBasicInfo({ bundle, setBundle }: BundleBasicInfoProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Basic Information</h3>
            <div className="grid gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bundle Name</label>
                    <Input
                        value={bundle.name}
                        onChange={(e) => setBundle({ ...bundle, name: e.target.value })}
                        placeholder="e.g., Complete Science Mock Package"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px]"
                        value={bundle.description}
                        onChange={(e) => setBundle({ ...bundle, description: e.target.value })}
                        placeholder="What does this bundle include?"
                    />
                </div>
            </div>
        </div>
    );
}
