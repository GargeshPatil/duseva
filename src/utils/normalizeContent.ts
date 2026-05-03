import { JSONContent } from '@tiptap/react';

/**
 * Returns true if a paragraph node has no meaningful text content.
 */
function isEmptyParagraph(node: JSONContent): boolean {
    if (node.type !== 'paragraph') return false;
    if (!node.content || node.content.length === 0) return true;
    // A paragraph with only whitespace-or-empty text nodes is also empty
    return node.content.every(
        (child) => child.type === 'text' && (!child.text || child.text.trim() === '')
    );
}

/**
 * Normalise a TipTap JSONContent document so that consecutive empty paragraph
 * nodes are collapsed into a single empty paragraph.
 *
 * This is applied at READ TIME only — it never mutates or overwrites Firestore data.
 *
 * Background: legacy questions were authored with double empty paragraphs to work
 * around a rendering bug where single paragraphs appeared with too much visual
 * space. After the renderer fix, we collapse them so legacy content renders
 * identically to newly authored content.
 *
 * Non-paragraph nodes (math, image, lists, etc.) are left completely untouched.
 */
export function normalizeContent(content: JSONContent): JSONContent {
    if (content.type !== 'doc' || !content.content) return content;

    const normalized: JSONContent[] = [];
    let prevWasEmpty = false;

    for (const node of content.content) {
        if (isEmptyParagraph(node)) {
            if (!prevWasEmpty) {
                normalized.push(node);
            }
            // Skip additional consecutive empty paragraphs
            prevWasEmpty = true;
        } else {
            normalized.push(node);
            prevWasEmpty = false;
        }
    }

    return { ...content, content: normalized };
}
