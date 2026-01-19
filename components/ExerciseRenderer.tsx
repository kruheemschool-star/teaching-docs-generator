import React from 'react';
import { ExerciseSection } from '@/types';
import { RichText } from './RichText';

interface ExerciseRendererProps {
    section: ExerciseSection;
    showAnswers?: boolean;
    fontSizeLevel?: number;
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

export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({ section, showAnswers = false, fontSizeLevel = 0 }) => {
    // Determine sizing classes
    const sizeTitle = fontSizeLevel === 0 ? 'text-xl' : fontSizeLevel === 1 ? 'text-2xl' : 'text-3xl';
    const sizeNumber = fontSizeLevel === 0 ? 'text-xl' : fontSizeLevel === 1 ? 'text-2xl' : 'text-3xl';
    const sizeText = fontSizeLevel === 0 ? 'text-lg' : fontSizeLevel === 1 ? 'text-xl' : 'text-2xl'; // Default bumped to L

    return (
        <div className={`mb-8 section-exercise break-inside-avoid ${section.pageBreakBefore ? 'break-before-page' : ''}`}>
            {section.title && (
                <h2 className={`${sizeTitle} font-bold border-b-2 border-gray-800 pb-1 mb-4`}>
                    {section.title}
                </h2>
            )}

            {section.instructions && (
                <p className={`mb-4 text-gray-700 italic ${sizeText}`}>
                    {section.instructions}
                </p>
            )}

            <div className="space-y-6">
                {section.items.map((item, index) => (
                    <div key={item.id || index} className="break-inside-avoid">
                        <div className={`flex gap-2 mb-2 font-medium ${sizeNumber}`}>
                            <span className="font-bold whitespace-nowrap">{index + 1}.</span>
                            <div className="flex-1">
                                {item.difficulty && getDifficultyBadge(item.difficulty, fontSizeLevel)}
                                <div className="inline">
                                    <RichText content={item.question} />
                                </div>
                            </div>
                        </div>

                        {/* SVG Graphic Rendering */}
                        {item.graphic_code && (
                            <div className="my-6 flex justify-center">
                                <div
                                    className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex justify-center [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-w-[400px] [&_svg]:max-h-[400px]"
                                    dangerouslySetInnerHTML={{ __html: item.graphic_code }}
                                />
                            </div>
                        )}

                        {/* Show Solution if toggled ON */}
                        {showAnswers ? (
                            <div className="ml-6 mt-3 pl-4 py-3 pr-4 bg-gray-50 border-l-4 border-gray-300 rounded-r-md">
                                <div className="flex gap-3">
                                    <div className="shrink-0 mt-0.5 text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
                                    </div>
                                    <div className={`${sizeText} leading-relaxed w-full`}>
                                        {item.answer && (
                                            <div className={`mb-2 flex items-start gap-2 ${sizeText}`}>
                                                <span className="font-bold text-gray-700 shrink-0">คำตอบ:</span>
                                                <span className="font-medium text-gray-900">
                                                    <RichText content={item.answer} />
                                                </span>
                                            </div>
                                        )}
                                        {item.detailedSolution && (
                                            <div>
                                                <div className={`font-bold text-gray-700 mb-1 uppercase tracking-wider opacity-70 ${fontSizeLevel === 0 ? 'text-xs' : 'text-sm'}`}>วิธีทำ</div>
                                                <div className={`text-gray-600 ${sizeText}`}>
                                                    <RichText content={item.detailedSolution} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Else show lines regarding spaceForWork logic (Student Mode)
                            item.spaceForWork && (
                                <div className="ml-6 mt-2 space-y-4">
                                    {Array.from({ length: item.lines || 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="border-b border-dotted border-gray-400 h-8 w-full"
                                        />
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                ))
                }
            </div >
        </div >
    );
};
