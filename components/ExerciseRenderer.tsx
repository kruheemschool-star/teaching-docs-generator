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
        <div className={`mb-10 section-exercise break-inside-avoid ${section.pageBreakBefore ? 'break-before-page' : ''}`}>
            {section.title && (
                <h2 className={`${sizeTitle} font-bold text-[#37352F] mb-4 tracking-tight`}>
                    {section.title}
                </h2>
            )}

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
                            <div className="ml-8 mt-3 rounded-md bg-[#F1F1EF] p-4 text-[#37352F] flex gap-3">
                                <div className="shrink-0 text-xl">💡</div>
                                <div className={`${sizeText} leading-relaxed w-full`}>
                                    {item.answer && (
                                        <div className={`mb-2 flex items-baseline gap-2 ${sizeText}`}>
                                            <span className="font-bold opacity-70 text-sm uppercase tracking-wider shrink-0">Answer:</span>
                                            <span className="font-medium">
                                                <RichText content={item.answer} />
                                            </span>
                                        </div>
                                    )}
                                    {item.detailedSolution && (
                                        <div>
                                            <div className={`font-bold opacity-70 mb-1 uppercase tracking-wider text-xs`}>Method</div>
                                            <div className="">
                                                <RichText content={item.detailedSolution} inlineParagraphs={false} />
                                            </div>
                                        </div>
                                    )}
                                </div>
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
