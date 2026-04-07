import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { MathInline, MathBlock } from './MathExtensions';
import { MathModal } from './MathModal';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Superscript as SuperscriptIcon, Subscript as SubscriptIcon, SquareRadical, Image as ImageIcon, Loader2 } from 'lucide-react';
import TiptapImage from '@tiptap/extension-image';

interface RichTextEditorProps {
    value?: JSONContent | null;
    onChange: (value: JSONContent) => void;
    compact?: boolean;
    placeholder?: string;
    onImageUpload?: (file: File) => Promise<string>;
}

const MenuBar = ({ editor, compact, onOpenMathModal, onImageUpload }: { editor: any, compact?: boolean, onOpenMathModal: () => void, onImageUpload?: (file: File) => Promise<string> }) => {
    const [isUploading, setIsUploading] = useState(false);

    if (!editor) {
        return null;
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onImageUpload) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
             alert('Image must be less than 2MB');
             return;
        }

        setIsUploading(true);
        try {
            const url = await onImageUpload(file);
            editor.chain().focus().setImage({ src: url }).run();
        } catch (err) {
            console.error('Image upload failed', err);
            alert('Image upload failed');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // clear input to allow same file selection again
        }
    };

    const Button = ({ onClick, isActive, disabled, title, children }: any) => (
        <button
            type="button"
            onMouseDown={(e) => e.preventDefault()} // Crucial: Prevents editor from losing focus and clearing stored marks
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-1.5 rounded flex items-center justify-center transition-colors ${
                isActive ? 'bg-cta-primary/20 text-cta-primary' : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-wrap gap-1 p-1.5 border-b border-border bg-surface-base rounded-t-lg items-center">
            <Button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </Button>

            {!compact && (
                <>
                    <Button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        disabled={!editor.can().chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        title="Underline"
                    >
                        <UnderlineIcon className="w-4 h-4" />
                    </Button>

                    <div className="w-px h-4 bg-border mx-1" />

                    <Button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </Button>
                    <Button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numbered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </Button>
                </>
            )}

            <div className="w-px h-4 bg-border mx-1" />

            <Button
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                isActive={editor.isActive('superscript')}
                title="Superscript"
            >
                <SuperscriptIcon className="w-4 h-4" />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                isActive={editor.isActive('subscript')}
                title="Subscript"
            >
                <SubscriptIcon className="w-4 h-4" />
            </Button>

            <div className="w-px h-4 bg-border mx-1" />

            <Button
                onClick={onOpenMathModal}
                title="Insert Math"
            >
                <SquareRadical className="w-4 h-4 text-cta-primary" />
            </Button>

            {onImageUpload && (
                <>
                    <div className="w-px h-4 bg-border mx-1" />
                    <label 
                        className={`p-1.5 rounded flex items-center justify-center transition-colors cursor-pointer text-text-secondary hover:bg-surface-elevated hover:text-text-primary ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                        title="Insert Image"
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 text-cta-primary animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                </>
            )}
        </div>
    );
};

export function RichTextEditor({ value, onChange, compact = false, placeholder, onImageUpload }: RichTextEditorProps) {
    const [isMathModalOpen, setIsMathModalOpen] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Superscript,
            Subscript,
            MathInline,
            MathBlock,
            TiptapImage.configure({
                HTMLAttributes: {
                    class: 'max-w-full rounded mx-auto my-4',
                },
            }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none p-3 overflow-y-auto w-full h-full ${
                    compact ? 'min-h-[60px]' : 'min-h-[120px]'
                } outline-none`,
            },
        },
    });

    // Update content cleanly when the `value` prop changes completely from outside (e.g. switching questions)
    useEffect(() => {
        if (editor && value !== undefined) {
            const currentContent = editor.getJSON();
            // A simple rough check to avoid unnecessary re-renders
            if (JSON.stringify(currentContent) !== JSON.stringify(value)) {
                editor.commands.setContent(value || '');
            }
        }
    }, [editor, value]);

    const handleInsertMath = (latex: string, isBlock: boolean) => {
        if (!editor) return;
        
        if (isBlock) {
            editor.chain().focus().insertContent({
                type: 'math_block',
                attrs: { latex }
            }).run();
        } else {
            editor.chain().focus().insertContent({
                type: 'math_inline',
                attrs: { latex }
            }).run();
        }
    };

    if (!editor) {
        return <div className="animate-pulse bg-surface-card rounded-lg h-32 w-full border border-border" />;
    }

    return (
        <div className="bg-surface-card border border-border rounded-lg flex flex-col focus-within:ring-2 focus-within:ring-cta-primary/50 transition-shadow transition-colors">
            <MenuBar editor={editor} compact={compact} onOpenMathModal={() => setIsMathModalOpen(true)} onImageUpload={onImageUpload} />
            <div className="relative flex-1 bg-surface-base rounded-b-lg">
                {placeholder && editor.isEmpty && (
                    <div className="absolute top-3 left-3 text-text-muted pointer-events-none text-sm">
                        {placeholder}
                    </div>
                )}
                <EditorContent editor={editor} className="h-full text-sm text-text-primary" />
            </div>
            
            <MathModal 
                isOpen={isMathModalOpen} 
                onClose={() => setIsMathModalOpen(false)} 
                onInsert={handleInsertMath} 
            />
        </div>
    );
}
