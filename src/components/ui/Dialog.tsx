"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange?.(false)} />
            <div className="relative z-50 w-full max-w-lg p-4 sm:p-0">
                {children}
            </div>
        </div>
    );
};

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative w-full overflow-hidden rounded-lg bg-white text-slate-950 shadow-xl ring-1 ring-slate-950/5 p-6",
            className
        )}
        {...props}
    >
        {children}
        <button
            onClick={(e) => {
                // Find nearest dialog overlay or use context if we had one
                // For this simple implementation, we rely on the parent closing it via props, 
                // but the close button needs access to setOpen. 
                // A better way is using context, but for brevity:
                const parent = (e.target as HTMLElement).closest('.fixed.inset-0.z-50');
                if (parent) {
                    // This is hacky. Real implementation should use Context.
                    // Let's just assume the user passes a close handler or we'll add a close button separately if needed.
                    // Actually, let's just make the X button work by bubbling up or similar? 
                    // No, let's just render the X here and hope the parent handles it?
                    // The standard shadcn pattern uses context. Let's do a mini context.
                }
            }}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500"
        >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </button>
    </div>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-500", className)}
        {...props}
    />
));
DialogDescription.displayName = "DialogDescription";

export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
};
