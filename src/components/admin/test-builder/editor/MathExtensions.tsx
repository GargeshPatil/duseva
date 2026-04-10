import React from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// --- Inline Math ---

const MathInlineView = (props: any) => {
    const latex = props.node.attrs.latex || '';
    
    let html = '';
    try {
        html = katex.renderToString(latex, { throwOnError: false, displayMode: false });
    } catch (e) {
        html = `<span class="text-red-500">Error: ${(e as Error).message}</span>`;
    }

    return (
        <NodeViewWrapper 
            as="span" 
            className="katex-inline cursor-pointer hover:bg-black/5 rounded p-0.5" 
            style={{ display: 'inline-block', verticalAlign: 'middle', userSelect: 'none' }}
            onClick={() => {
                if (typeof (props.editor as any).openMathModal === 'function') {
                    (props.editor as any).openMathModal(latex, false);
                }
            }}
        >
            <span dangerouslySetInnerHTML={{ __html: html }} />
        </NodeViewWrapper>
    );
};

export const MathInline = Node.create({
    name: 'math_inline',
    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
        return {
            latex: {
                default: '',
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-type="math_inline"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'math_inline' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MathInlineView);
    },
});

// --- Block Math ---

const MathBlockView = (props: any) => {
    const latex = props.node.attrs.latex || '';
    
    let html = '';
    try {
        html = katex.renderToString(latex, { throwOnError: false, displayMode: true });
    } catch (e) {
        html = `<div class="text-red-500">Error: ${(e as Error).message}</div>`;
    }

    return (
        <NodeViewWrapper 
            className="katex-block cursor-pointer hover:bg-black/5 rounded p-2 my-2 w-full text-center" 
            style={{ userSelect: 'none' }}
            onClick={() => {
                if (typeof (props.editor as any).openMathModal === 'function') {
                    (props.editor as any).openMathModal(latex, true);
                }
            }}
        >
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </NodeViewWrapper>
    );
};

export const MathBlock = Node.create({
    name: 'math_block',
    group: 'block',
    inline: false,
    atom: true,

    addAttributes() {
        return {
            latex: {
                default: '',
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="math_block"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'math_block' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MathBlockView);
    },
});
