import React from 'react';
import { ExamSection, DocumentMetadata } from '@/types';
import { CheckCircle2, Circle, GraduationCap } from 'lucide-react';
import { RichText } from './RichText';
import { PinButton } from './PinButton';

interface ExamRendererProps {
    section: ExamSection;
    showAnswers?: boolean;
    fontSizeLevel?: number;
    metadata?: DocumentMetadata;
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

export const ExamRenderer: React.FC<ExamRendererProps> = ({ section, showAnswers = false, fontSizeLevel = 0, metadata }) => {
    // Determine sizing classes
    const sizeTitle = fontSizeLevel === 0 ? 'text-xl' : fontSizeLevel === 1 ? 'text-2xl' : 'text-3xl';
    const sizeNumber = fontSizeLevel === 0 ? 'text-xl' : fontSizeLevel === 1 ? 'text-2xl' : 'text-3xl'; // Number prefix default
    const sizeText = fontSizeLevel === 0 ? 'text-lg' : fontSizeLevel === 1 ? 'text-xl' : 'text-2xl'; // Question text default (already bumped once)
    const sizeOption = fontSizeLevel === 0 ? 'text-lg' : fontSizeLevel === 1 ? 'text-xl' : 'text-2xl'; // Options default (already bumped once)

    return (
        <div className={`mb-10 section-exam break-inside-avoid ${section.pageBreakBefore ? 'break-before-page' : ''}`}>

            {/* Improved Header Styling */}
            <div className="mb-8 no-print">
                <div className="flex flex-col gap-3 items-start">
                    {/* Content Type Badge */}
                    <span className="bg-black text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <GraduationCap className="w-3.5 h-3.5" />
                        ข้อสอบ (EXAM)
                    </span>

                    {/* Main Title & Metadata */}
                    <div className="w-full pb-4 border-b border-gray-200">
                        {/* Context/breadcrumbs */}
                        <div className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                            {metadata?.classLevel && <span>{metadata.classLevel}</span>}
                            {metadata?.classLevel && metadata?.subjectType && <span className="w-1 h-1 rounded-full bg-gray-300"></span>}
                            {metadata?.subjectType && <span>{metadata.subjectType}</span>}

                            {(metadata?.classLevel || metadata?.subjectType) && (metadata?.topic || metadata?.subtopic) && <span className="text-gray-300">/</span>}

                            {metadata?.topic && <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{metadata.topic}</span>}

                            {metadata?.subtopic && metadata?.topic && <span className="text-gray-300">/</span>}
                            {metadata?.subtopic && <span className="text-gray-600 font-medium">{metadata.subtopic}</span>}
                        </div>



                        <div className={`${sizeTitle} font-bold text-[#37352F] tracking-tight leading-tight [&_.prose]:text-inherit [&_.prose]:leading-inherit [&_.prose_p]:text-inherit [&_.prose_p]:font-bold flex items-start gap-3 group/title`}>
                            <div className="flex-1">
                                <RichText content={section.title || "ข้อสอบ"} />
                            </div>
                            <PinButton
                                documentId={metadata?.id || 'unknown'}
                                sectionId={section.id}
                                title={section.title || "ข้อสอบ"}
                                className="mt-1 opacity-0 group-hover/title:opacity-100 transition-opacity"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {section.questions.map((q, qIndex) => {
                    const questionId = q.id || `${section.id}-question-${qIndex}`;
                    return (
                        <div key={questionId} id={questionId} className="break-inside-avoid flex flex-col justify-between group/question relative">
                            {/* Question Header */}
                            <div className={`flex gap-3 mb-3 font-medium ${sizeNumber} text-[#37352F]`}>
                                <div className="flex items-start gap-1">
                                    <span className="font-bold whitespace-nowrap opacity-60">{qIndex + 1}.</span>
                                    {/* Pin Button for Question */}
                                    <div className="opacity-0 group-hover/question:opacity-100 transition-opacity mt-1">
                                        <PinButton
                                            documentId={metadata?.id || 'unknown'}
                                            sectionId={questionId}
                                            title={`ข้อสอบข้อที่ ${qIndex + 1}: ${(q.text || "").slice(0, 20)}...`}
                                        />
                                    </div>
                                </div>
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
                                        <div className="flex flex-col gap-3 w-full">
                                            {/* 1. Key Concept */}
                                            {q.key_concept && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800">
                                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                                                        🔑 Key Concept (หลักการ)
                                                    </div>
                                                    <div className={`text-[#37352F] dark:text-gray-200 ${sizeText}`}>
                                                        <RichText content={q.key_concept} inlineParagraphs={false} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* 2. Solution/Explanation */}
                                            <div className="flex gap-3">
                                                <div className="shrink-0 text-xl">💡</div>
                                                <div className={`leading-relaxed w-full ${sizeText}`}>
                                                    <span className="font-bold mb-1 opacity-70 block text-xs uppercase tracking-wider">Solution</span>
                                                    <RichText content={q.explanation || ''} inlineParagraphs={false} />
                                                </div>
                                            </div>

                                            {/* 3. Common Mistakes */}
                                            {q.common_mistakes && (
                                                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-100 dark:border-red-800 mt-1">
                                                    <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                        ⚠️ Common Mistakes (จุดที่มักผิด)
                                                    </div>
                                                    <div className={`text-[#37352F] dark:text-gray-200 ${sizeText}`}>
                                                        <RichText content={q.common_mistakes} inlineParagraphs={false} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Divider */}
                            {qIndex < section.questions.length - 1 && (
                                <div className="h-px bg-[#E1E1E0] mt-6 w-full"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
