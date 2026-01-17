import React from 'react';
import ReactMarkdown from 'react-markdown';
import RemarkMath from 'remark-math';
import RehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { LectureSection } from '@/types';

interface LectureRendererProps {
    section: LectureSection;
    fontSizeLevel?: number;
}

export const LectureRenderer: React.FC<LectureRendererProps> = ({ section, fontSizeLevel = 0 }) => {
    // Dynamic Prose Size
    const proseClass = fontSizeLevel === 0 ? 'prose-xl' : fontSizeLevel === 1 ? 'prose-2xl' : 'prose-2xl text-2xl'; // XL -> 2XL -> Custom Large

    return (
        <div className={`mb-8 section-lecture ${section.pageBreakBefore ? 'break-before-page' : ''}`}>
            {section.title && (
                <h2 className={`font-bold border-b-2 border-gray-800 pb-1 mb-4 ${fontSizeLevel === 0 ? 'text-xl' : fontSizeLevel === 1 ? 'text-2xl' : 'text-3xl'
                    }`}>
                    {section.title}
                </h2>
            )}

            <div className={`prose ${proseClass} max-w-none text-gray-800`}>
                <ReactMarkdown
                    remarkPlugins={[RemarkMath]}
                    rehypePlugins={[RehypeKatex]}
                >
                    {section.content}
                </ReactMarkdown>
            </div>

            {section.keyPoints && section.keyPoints.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 border-l-4 border-gray-400 rounded-r-md">
                    <h3 className={`font-bold text-gray-700 mb-2 uppercase tracking-wide ${fontSizeLevel === 0 ? 'text-sm' : 'text-base'}`}>Key Points</h3>
                    <ul className={`list-disc list-inside space-y-1 ${fontSizeLevel === 0 ? 'text-sm' : 'text-base'}`}>
                        {section.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
