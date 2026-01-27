import React from 'react';
import { ExerciseSection, DocumentMetadata } from '@/types';
import { RichText } from './RichText';
import { BookOpen, CheckSquare } from 'lucide-react';

interface ExerciseRendererProps {
    section: ExerciseSection;
    showAnswers?: boolean;
    fontSizeLevel?: number;
    metadata?: DocumentMetadata;
}

const getDifficultyBadge = (difficulty?: string, fontSizeLevel = 0) => {
    const sizeClass = fontSizeLevel === 0 ? 'text-xs' : fontSizeLevel === 1 ? 'text-sm' : 'text-base';
    switch (difficulty) {
        case 'ง่าย':
            return <span className={`inline-block px-2 py-0.5 mr-2 rounded ${sizeClass} font-bold bg-green-100 text-green-700`}>ง่าย</span>;
        case 'ปานกลาง':
            return <span className={`inline-block px-2 py-0.5 mr-2 rounded ${sizeClass} font-bold bg-yellow-100 text-yellow-700`}>ปานกลาง</span>;
        case 'ยาก':
            return <span className={`inline-block px-2 py-0.5 mr-2 rounded ${sizeClass} font-bold bg-red-100 text-red-700`}>ยาก</span>;
        case 'โจทย์ปัญหา':
            return <span className={`inline-block px-2 py-0.5 mr-2 rounded ${sizeClass} font-bold bg-blue-100 text-blue-700`}>โจทย์ปัญหา</span>;
        default:
            return null;
    }
};

export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({ section, showAnswers = false, fontSizeLevel = 0, metadata }) => {
    // Determine sizing classes
    const sizeTitle = fontSizeLevel === 0 ? 'text-xl' : fontSizeLevel === 1 ? 'text-2xl' : 'text-3xl';
    const sizeNumber = fontSizeLevel === 0 ? 'text-xl' : fontSizeLevel === 1 ? 'text-2xl' : 'text-3xl';
    const sizeText = fontSizeLevel === 0 ? 'text-lg' : fontSizeLevel === 1 ? 'text-xl' : 'text-2xl'; // Default bumped to L

    return (
        <div className={`mb-10 section-exercise break-inside-avoid ${section.pageBreakBefore ? 'break-before-page' : ''}`}>

            {/* Improved Header Styling */}
            <div className="mb-8 no-print">
                <div className="flex flex-col gap-3 items-start">
                    {/* Content Type Badge */}
                    <span className="bg-black text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <CheckSquare className="w-3.5 h-3.5" />
                        แบบฝึกหัด (EXERCISE)
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

                        <div className={`${sizeTitle} font-bold text-[#37352F] tracking-tight leading-tight [&_.prose]:text-inherit [&_.prose]:leading-inherit [&_.prose_p]:text-inherit [&_.prose_p]:font-bold`}>
                            <RichText content={section.title || "แบบฝึกหัด"} />
                        </div>
                    </div>
                </div>
            </div>

            {section.instructions && (
                <p className={`mb-6 text-gray-600 italic ${sizeText}`}>
                    {section.instructions}
                </p>
            )}

            <div className="space-y-8">
                {section.items.map((item, index) => (
                    <div key={item.id || index} className="break-inside-avoid">
                        <div className={`flex gap-3 mb-2 font-medium ${sizeNumber} text-[#37352F]`}>
                            <span className="font-bold whitespace-nowrap opacity-60">{index + 1}.</span>
                            <div className="flex-1">
                                {item.difficulty && getDifficultyBadge(item.difficulty, fontSizeLevel)}
                                <div className="inline leading-relaxed">
                                    <RichText content={item.question} />
                                </div>
                            </div>
                        </div>

                        {/* SVG Graphic Rendering */}
                        {item.graphic_code && (
                            <div className="my-4 flex justify-start pl-8">
                                <div
                                    className="bg-white p-4 rounded border border-[#E1E1E0] flex justify-center [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-w-[400px] [&_svg]:max-h-[400px]"
                                    dangerouslySetInnerHTML={{ __html: item.graphic_code }}
                                />
                            </div>
                        )}

                        {/* Show Solution if toggled ON */}
                        {showAnswers ? (
                            <div className="ml-8 mt-3 rounded-md bg-[#F1F1EF] p-4 text-[#37352F] flex flex-col gap-4">

                                {/* 1. Key Concept */}
                                {item.key_concept && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800">
                                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                                            🔑 Concept (หลักการ)
                                        </div>
                                        <div className={sizeText}>
                                            <RichText content={item.key_concept} inlineParagraphs={false} />
                                        </div>
                                    </div>
                                )}

                                {/* 2. Answer & Detailed Solution */}
                                <div className={`${sizeText} leading-relaxed w-full`}>
                                    {item.answer && (
                                        <div className={`mb-3 flex items-baseline gap-2 ${sizeText}`}>
                                            <span className="font-bold opacity-70 text-sm uppercase tracking-wider shrink-0">Answer:</span>
                                            <span className="font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                                <RichText content={item.answer} />
                                            </span>
                                        </div>
                                    )}
                                    {item.detailedSolution && (
                                        <div>
                                            <div className={`font-bold opacity-70 mb-1 uppercase tracking-wider text-xs`}>Method</div>
                                            <div className="pl-2 border-l-2 border-gray-300">
                                                <RichText content={item.detailedSolution} inlineParagraphs={false} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Common Mistakes */}
                                {item.common_mistakes && (
                                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-100 dark:border-red-800">
                                        <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                            ⚠️ Caution (จุดที่มักผิด)
                                        </div>
                                        <div className={sizeText}>
                                            <RichText content={item.common_mistakes} inlineParagraphs={false} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Else show lines regarding spaceForWork logic (Student Mode)
                            item.spaceForWork && (
                                <div className="ml-8 mt-4 space-y-8 opacity-50">
                                    {Array.from({ length: item.lines || 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="border-b border-dashed border-[#E1E1E0] h-6 w-full"
                                        />
                                    ))}
                                </div>
                            )
                        )}

                        {/* Divider */}
                        {index < section.items.length - 1 && (
                            <div className="h-px bg-[#E1E1E0] mt-8 opacity-50 ml-8"></div>
                        )}
                    </div>
                ))
                }
            </div >
        </div >
    );
};
