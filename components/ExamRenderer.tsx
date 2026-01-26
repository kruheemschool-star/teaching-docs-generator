import React from 'react';
import { ExamSection } from '@/types';
import { CheckCircle2, Circle } from 'lucide-react';
import { RichText } from './RichText';

interface ExamRendererProps {
    section: ExamSection;
    showAnswers?: boolean;
    fontSizeLevel?: number;
}

const getDifficultyBadge = (difficulty?: string, fontSizeLevel = 0) => {
    const sizeClass = fontSizeLevel === 0 ? 'text-xs' : fontSizeLevel === 1 ? 'text-sm' : 'text-base';
    switch (difficulty) {
        case 'ง่าย':
            return <span className={`inline-block px-2 py-0.5 mr-2 rounded-md ${sizeClass} font-bold bg-green-50 text-green-700 border border-green-200`}>ง่าย</span>;
        case 'ปานกลาง':
            return <span className={`inline-block px-2 py-0.5 mr-2 rounded-md ${sizeClass} font-bold bg-yellow-50 text-yellow-700 border border-yellow-200`}>ปานกลาง</span>;
        case 'ยาก':
            return <span className={`inline-block px-2 py-0.5 mr-2 rounded-md ${sizeClass} font-bold bg-red-50 text-red-700 border border-red-200`}>ยาก</span>;
        case 'โจทย์ปัญหา':
            return <span className={`inline-block px-2 py-0.5 mr-2 rounded-md ${sizeClass} font-bold bg-blue-50 text-blue-700 border border-blue-200`}>โจทย์ปัญหา</span>;
        default:
            return null;
    }
};

export const ExamRenderer: React.FC<ExamRendererProps> = ({ section, showAnswers = false, fontSizeLevel = 0 }) => {
    // Determine sizing classes
    const sizeTitle = fontSizeLevel === 0 ? 'text-xl' : fontSizeLevel === 1 ? 'text-2xl' : 'text-3xl';
    const sizeNumber = fontSizeLevel === 0 ? 'text-xl' : fontSizeLevel === 1 ? 'text-2xl' : 'text-3xl'; // Number prefix default
    const sizeText = fontSizeLevel === 0 ? 'text-lg' : fontSizeLevel === 1 ? 'text-xl' : 'text-2xl'; // Question text default (already bumped once)
    const sizeOption = fontSizeLevel === 0 ? 'text-lg' : fontSizeLevel === 1 ? 'text-xl' : 'text-2xl'; // Options default (already bumped once)

    return (
        <div className={`mb-10 section-exam break-inside-avoid ${section.pageBreakBefore ? 'break-before-page' : ''}`}>
            {section.title && (
                <h2 className={`${sizeTitle} font-bold text-[#37352F] mb-6 tracking-tight`}>
                    {section.title}
                </h2>
            )}

            <div className="grid grid-cols-1 gap-8">
                {section.questions.map((q, qIndex) => (
                    <div key={q.id || qIndex} className="break-inside-avoid flex flex-col justify-between group">
                        {/* Question Header */}
                        <div className={`flex gap-3 mb-3 font-medium ${sizeNumber} text-[#37352F]`}>
                            <span className="font-bold whitespace-nowrap opacity-60">{qIndex + 1}.</span>
                            <div className="flex-1">
                                <div className="mb-3">
                                    {q.difficulty && getDifficultyBadge(q.difficulty, fontSizeLevel)}
                                    <div className={`inline leading-relaxed ${sizeText}`}>
                                        <RichText content={q.text} />
                                    </div>

                                    {/* SVG Graphic Rendering */}
                                    {q.graphic_code && (
                                        <div className="my-4 flex justify-start">
                                            <div
                                                className="bg-white p-4 rounded border border-[#E1E1E0] flex justify-center [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-w-[400px] [&_svg]:max-h-[400px]"
                                                dangerouslySetInnerHTML={{ __html: q.graphic_code }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Options */}
                                <div className="space-y-2 ml-1">
                                    {q.options && q.options.map((opt, oIndex) => {
                                        const isCorrect = q.correctOption === oIndex;
                                        const isString = typeof opt === 'string';
                                        const text = isString ? opt : opt.text;
                                        const graphicCode = !isString ? (opt as any).graphic_code : undefined;

                                        return (
                                            <div key={oIndex} className={`flex items-start gap-3 ${sizeOption} px-3 py-1.5 rounded-md transition-colors ${showAnswers && isCorrect ? 'bg-[#edf9f0]' : 'hover:bg-[#F1F1EF]'}`}>
                                                <div className="mt-[0.2em] shrink-0">
                                                    {showAnswers && isCorrect ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border border-gray-400 mt-1"></div>
                                                    )}
                                                </div>
                                                <div className={`leading-relaxed w-full ${showAnswers && isCorrect ? 'font-medium text-[#37352F]' : 'text-[#37352F]'}`}>
                                                    <RichText content={text} />
                                                    {graphicCode && (
                                                        <div className="mt-2 mb-2">
                                                            <div
                                                                className="bg-white p-2 rounded border border-[#E1E1E0] flex min-w-[200px] [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-w-[400px] [&_svg]:max-h-[150px]"
                                                                dangerouslySetInnerHTML={{ __html: graphicCode }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Explanation (Notion Callout Style) */}
                        {q.explanation && (
                            <div className={`mt-3 rounded-md transition-all
                                ${showAnswers
                                    ? 'bg-[#F1F1EF] p-4 text-[#37352F] flex gap-3'
                                    : 'h-0 opacity-0 overflow-hidden'
                                }`}>
                                {showAnswers && (
                                    <>
                                        <div className="shrink-0 text-xl">💡</div>
                                        <div className={`leading-relaxed ${sizeText}`}>
                                            <span className="font-bold mb-1 opacity-70 block text-xs uppercase tracking-wider">Solution</span>
                                            <RichText content={q.explanation} inlineParagraphs={false} />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Divider */}
                        {qIndex < section.questions.length - 1 && (
                            <div className="h-px bg-[#E1E1E0] mt-6 w-full"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
