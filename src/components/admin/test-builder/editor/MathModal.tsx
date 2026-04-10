import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (latex: string, isBlock: boolean) => void;
    initialLatex?: string;
    initialIsBlock?: boolean;
}

export function MathModal({ isOpen, onClose, onInsert, initialLatex, initialIsBlock }: MathModalProps) {
    const [latex, setLatex] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');
    const [isBlock, setIsBlock] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLatex(initialLatex || '');
            setIsBlock(initialIsBlock || false);
        } else {
            setLatex('');
        }
    }, [isOpen, initialLatex, initialIsBlock]);

    const getCleanLatex = (raw: string) => {
        return raw.trim().replace(/^\$+|\$+$/g, '').trim();
    };

    useEffect(() => {
        const cleanLatex = getCleanLatex(latex);
        if (!cleanLatex) {
            setPreviewHtml('<span class="text-text-muted italic">Preview will appear here...</span>');
            return;
        }

        try {
            const html = katex.renderToString(cleanLatex, {
                throwOnError: false,
                displayMode: isBlock,
            });
            setPreviewHtml(html);
        } catch (e) {
            setPreviewHtml(`<span class="text-semantic-error">Error: ${(e as Error).message}</span>`);
        }
    }, [latex, isBlock]);

    const handleInsert = () => {
        const cleanLatex = getCleanLatex(latex);
        if (!cleanLatex) return;
        onInsert(cleanLatex, isBlock);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Insert Math</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="radio"
                                checked={!isBlock}
                                onChange={() => setIsBlock(false)}
                                className="cursor-pointer"
                            />
                            Inline Math
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="radio"
                                checked={isBlock}
                                onChange={() => setIsBlock(true)}
                                className="cursor-pointer"
                            />
                            Block Math
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-secondary">LaTeX Input</label>
                        <textarea
                            value={latex}
                            onChange={(e) => setLatex(e.target.value)}
                            placeholder="e.g. \frac{a}{b} = c"
                            className="font-mono text-sm min-h-[100px] w-full p-3 rounded-md border border-input bg-transparent shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-secondary">Live Preview</label>
                        <div 
                            className="w-full min-h-[80px] p-4 bg-surface-card border border-border rounded-lg flex items-center justify-center overflow-x-auto"
                            dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button 
                            onClick={handleInsert} 
                            disabled={!latex.trim()} 
                            className="bg-cta-primary hover:bg-cta-hover text-white"
                        >
                            Insert
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
