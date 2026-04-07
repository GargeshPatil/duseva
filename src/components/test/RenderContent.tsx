'use client';
import React from 'react';
import { JSONContent } from '@tiptap/react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

interface RenderContentProps {
  content: JSONContent | null | undefined;
  fallback?: string;
  className?: string;
}

export const RenderContent: React.FC<RenderContentProps> = ({ content, fallback, className = "" }) => {
  if (!content || typeof content !== 'object') {
    if (fallback) {
      // Legacy fallback
      return (
        <div
          className={`whitespace-pre-wrap ${className}`}
          dangerouslySetInnerHTML={{ __html: fallback }}
        />
      );
    }
    return null;
  }

  const renderNode = (node: JSONContent | null | undefined, index: number): React.ReactNode => {
    if (!node) return null;
    
    switch (node.type) {
      case 'doc':
        return (
          <div key={index} className={className}>
            {node.content?.map((child, i) => renderNode(child, i))}
          </div>
        );

      case 'paragraph':
        return (
          <p key={index} className="mb-2 last:mb-0">
            {node.content ? node.content.map((child, i) => renderNode(child, i)) : <br />}
          </p>
        );

      case 'text':
        let elem: React.ReactNode = node.text || '';

        if (node.marks) {
          // TipTap marks applied sequentially
          node.marks.forEach((mark, mIdx) => {
            switch (mark.type) {
              case 'bold':
                elem = <strong key={`bold-${index}-${mIdx}`}>{elem}</strong>;
                break;
              case 'italic':
                elem = <em key={`italic-${index}-${mIdx}`}>{elem}</em>;
                break;
              case 'underline':
                elem = <u key={`underline-${index}-${mIdx}`}>{elem}</u>;
                break;
              case 'superscript':
                elem = <sup key={`sup-${index}-${mIdx}`}>{elem}</sup>;
                break;
              case 'subscript':
                elem = <sub key={`sub-${index}-${mIdx}`}>{elem}</sub>;
                break;
            }
          });
        }
        return <React.Fragment key={index}>{elem}</React.Fragment>;

      case 'image':
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={index}
            src={node.attrs?.src || ''}
            alt={node.attrs?.alt || ''}
            title={node.attrs?.title || ''}
            className="max-w-full rounded mx-auto my-4 object-contain max-h-[400px]"
          />
        );

      case 'math_inline':
        return (
          <span key={index} className="mx-1 align-baseline inline-block">
            <InlineMath math={node.attrs?.latex || ""} />
          </span>
        );

      case 'math_block':
        return (
          <div key={index} className="my-4 overflow-x-auto text-center flex justify-center w-full">
            <BlockMath math={node.attrs?.latex || ""} />
          </div>
        );

      case 'bulletList':
        return (
          <ul key={index} className="list-disc list-outside ml-6 mb-2">
            {node.content?.map((child, i) => renderNode(child, i))}
          </ul>
        );

      case 'orderedList':
        return (
          <ol key={index} className="list-decimal list-outside ml-6 mb-2">
            {node.content?.map((child, i) => renderNode(child, i))}
          </ol>
        );

      case 'listItem':
        return (
          <li key={index} className="pl-1 mb-1">
            {node.content?.map((child, i) => renderNode(child, i))}
          </li>
        );

      default:
        // Handle unknown nodes
        if (node.content) {
          return (
            <div key={index}>
              {node.content.map((child, i) => renderNode(child, i))}
            </div>
          );
        }
        return null;
    }
  };

  return renderNode(content, 0);
};
