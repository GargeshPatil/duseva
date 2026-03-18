import React from 'react';

interface SectionTabsProps {
    streams: string[];
    currentSection: string;
    onSectionChange: (section: string) => void;
}

export function SectionTabs({ streams, currentSection, onSectionChange }: SectionTabsProps) {
    if (!streams || streams.length <= 1) return null; // Only show if multiple sections/streams exist

    return (
        <div className="bg-[#1D4E89] text-white flex items-end px-2 pt-2 border-b-2 border-orange-500 overflow-x-auto custom-scrollbar">
            {streams.map((s) => {
                const isActive = s === currentSection;
                return (
                    <button
                        key={s}
                        onClick={() => onSectionChange(s)}
                        className={`
                            px-4 py-2 text-sm font-semibold rounded-t-md mx-0.5 whitespace-nowrap
                             transition-colors
                            ${isActive 
                                ? 'bg-white text-[#1D4E89] shadow-[0_-2px_5px_rgba(0,0,0,0.1)] relative z-10' 
                                : 'bg-blue-800 text-blue-200 hover:bg-blue-700'}
                        `}
                    >
                        {s}
                    </button>
                );
            })}
        </div>
    );
}
