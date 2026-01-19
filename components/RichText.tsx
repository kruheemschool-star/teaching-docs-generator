import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface RichTextProps {
    content: string;
    className?: string;
}

export const RichText: React.FC<RichTextProps> = ({ content, className = '' }) => {
    // Helper to auto-format common math patterns missing LaTeX delimiters
    const preprocessContent = (text: string) => {
        if (!text) return text;
        let processed = text;

        // Fix common AI artifacts
        // "imes" appearing instead of "\times" (often due to bad unescaping of \t)
        processed = processed.replace(/(\d)\s*imes\s*(\d)/g, '$1 \\times $2');

        // Pattern 1: Scientific Notation (e.g., 3 x 10^8 or 3 × 10^8 or 3 x 10^{8}) -> $3 \times 10^{8}$
        // Supports optional {} around exponent
        processed = processed.replace(/(\d+(?:\.\d+)?)\s*[x×]\s*10\^\{?(\-?\d+)\}?/g, '$$$1 \\times 10^{$2}$$');

        // Pattern 2: Standalone Powers of 10 (e.g., 10^6) -> $10^{6}$
        processed = processed.replace(/(?<![\d.])\b10\^\{?(\-?\d+)\}?/g, '$$10^{$1}$$');

        return processed;
    };

    const formattedContent = preprocessContent(content);

    return (
        <div className={`prose prose-sm max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    p: ({ node, ...props }) => <p {...props} className="inline" /> // Render paragraphs inline to avoid layout breaks in questions
                }}
            >
                {formattedContent}
            </ReactMarkdown>
        </div>
    );
};
