import { Input } from "@/components/ui/Input";
import { Bundle, Test } from "@/types/admin";
import { Check } from "lucide-react";

interface BundleTestSelectionProps {
    bundle: Partial<Bundle>;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredTests: Test[];
    toggleTestSelection: (testId: string) => void;
}

export function BundleTestSelection({ bundle, searchTerm, setSearchTerm, filteredTests, toggleTestSelection }: BundleTestSelectionProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-semibold text-slate-900">Included Tests</h3>
                <span className="text-sm text-slate-500">{bundle.includedTests?.length || 0} selected</span>
            </div>

            <div className="relative">
                <Input
                    placeholder="Search tests to include..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                />
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2 border border-slate-100 rounded-lg p-2">
                {filteredTests.map(test => {
                    const isSelected = bundle.includedTests?.includes(test.id);
                    return (
                        <div
                            key={test.id}
                            onClick={() => toggleTestSelection(test.id)}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border ${isSelected
                                ? 'bg-blue-50 border-blue-200'
                                : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                                }`}
                        >
                            <div>
                                <p className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{test.title}</p>
                                <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                                    <span>{test.questions?.length || 0} Qs</span>
                                    <span>•</span>
                                    <span>{test.category}</span>
                                </div>
                            </div>
                            {isSelected && (
                                <div className="bg-blue-600 rounded-full p-1 text-white">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                    );
                })}
                {filteredTests.length === 0 && (
                    <p className="text-center text-slate-500 py-4 text-sm">No tests found matching search.</p>
                )}
            </div>
        </div>
    );
}
