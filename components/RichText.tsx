import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface RichTextProps {
    content: string;
    className?: string;
    inlineParagraphs?: boolean; // Default true to preserve existing layout
}

export const RichText: React.FC<RichTextProps> = ({ content, className = '', inlineParagraphs = true }) => {
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
        // Pattern 3: Fix "step_by_step_solution" where lines are merged? 
        // No, that's handled by block/inline prop. 

        // Pattern 4: Smart Auto-Wrap for \frac, \sqrt, etc that are missing $...$
        // We look for \frac{...}{...} or similar. matching nested braces with regex is hard.
        // But we can approximate.
        // Case A: \frac{...}{...}
        // Case B: \times, \approx, \le, \ge, \neq surrounded by digits/spaces?

        // Strategy: "Wrap the Line" if it looks math-heavy? No, destructive.
        // Strategy: Detect specific keywords sequence.

        // Pattern 3: Comprehensive Auto-Wrap Parser
        // Replaces both regex and previous manual parser to avoid double-wrapping bugs.
        // Scans string, tracks $ state, and wraps \frac, \sqrt, \times, etc. safely.

        const autoWrapMath = (input: string): string => {
            const output: string[] = [];
            let i = 0;
            let inMath = false; // crude nesting check (only handles $...$)

            const isMathCommand = (cmd: string) =>
                ['frac', 'sqrt', 'times', 'approx', 'le', 'ge', 'neq', 'pm', 'infty', 'cdot'].includes(cmd);

            const isBlockCommand = (cmd: string) => ['frac', 'sqrt'].includes(cmd);

            while (i < input.length) {
                const char = input[i];

                if (char === '$') {
                    // Check if escaped
                    if (i > 0 && input[i - 1] === '\\') {
                        output.push('$');
                    } else {
                        inMath = !inMath;
                        output.push('$');
                    }
                    i++;
                    continue;
                }

                if (char === '\\') {
                    // Possible command
                    // Extract command name
                    let j = i + 1;
                    while (j < input.length && /[a-zA-Z]/.test(input[j])) {
                        j++;
                    }
                    const cmd = input.slice(i + 1, j);

                    if (isMathCommand(cmd)) {
                        if (inMath) {
                            // Already in math, just copy
                            output.push(input.slice(i, j));
                            i = j;
                        } else {
                            if (isBlockCommand(cmd)) {
                                // Block command -> Use $$
                                output.push('$$');
                                output.push(input.slice(i, j));
                                i = j;

                                // Consume args {A}{B}... to keep them inside the wrapper
                                // Heuristic: Scan for { blocks immediately following (allow spaces)
                                while (i < input.length) {
                                    // limit whitespace skip
                                    let ws = i;
                                    while (ws < input.length && /\s/.test(input[ws])) ws++;

                                    if (ws < input.length && input[ws] === '{') {
                                        // Argument found, consume it
                                        // Copy whitespace
                                        output.push(input.slice(i, ws));
                                        i = ws;

                                        // Consume brace block
                                        let depth = 1;
                                        output.push('{');
                                        i++;
                                        while (i < input.length && depth > 0) {
                                            const c = input[i];
                                            output.push(c);
                                            if (c === '{') depth++;
                                            else if (c === '}') depth--;
                                            i++;
                                        }
                                    } else {
                                        // No more args
                                        break;
                                    }
                                }
                                output.push('$$'); // Close block
                            } else {
                                // Inline command -> Use $
                                output.push('$');
                                output.push(input.slice(i, j));
                                i = j;
                                output.push('$');
                            }
                        }
                    } else {
                        // Unknown command, just copy
                        output.push(input.slice(i, j));
                        i = j;
                    }
                } else {
                    output.push(char);
                    i++;
                }
            }
            return output.join('');
        };

        // Step 1: Wrap all LaTeX commands (\frac, \times, etc.)
        let wrappedContent = autoWrapMath(processed);

        // Step 2: Apply legacy Regex patterns ONLY to non-math text segments
        // This prevents nested dollars (e.g. $\frac{$10^5$}{...}$)
        const segments = wrappedContent.split('$');
        for (let k = 0; k < segments.length; k += 2) {
            let text = segments[k];

            // Pattern 1: Scientific Notation
            text = text.replace(/(\d+(?:\.\d+)?)\s*[x×]\s*10\^\{?(\-?\d+)\}?/g, '$$$1 \\times 10^{$2}$$');

            // Pattern 2: Standalone Powers of 10
            text = text.replace(/(?<![\d.])\b10\^\{?(\-?\d+)\}?/g, '$$10^{$1}$$');

            // Fix common AI artifacts
            text = text.replace(/(\d)\s*imes\s*(\d)/g, '$1 \\times $2');

            segments[k] = text;
        }

        return segments.join('$');
    };

    const formattedContent = preprocessContent(content);

    return (
        <div className={`prose prose-sm max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    p: ({ node, ...props }) => <p {...props} className={inlineParagraphs ? "inline" : ""} /> // Render paragraphs inline to avoid layout breaks in questions
                }}
            >
                {formattedContent}
            </ReactMarkdown>
        </div>
    );
};
