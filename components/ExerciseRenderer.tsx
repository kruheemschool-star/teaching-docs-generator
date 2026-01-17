import React from 'react';
import { ExerciseSection } from '@/types';
import { RichText } from './RichText';

interface ExerciseRendererProps {
    section: ExerciseSection;
    showAnswers?: boolean;
}

export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({ section, showAnswers = false }) => {
    return (
        <div className={`mb-8 section-exercise break-inside-avoid ${section.pageBreakBefore ? 'break-before-page' : ''}`}>
            {section.title && (
                <h2 className="text-xl font-bold border-b-2 border-gray-800 pb-1 mb-4">
                    {section.title}
                </h2>
            )}

            {section.instructions && (
                <p className="mb-4 text-gray-700 italic">
                    {section.instructions}
                </p>
            )}

            <div className="space-y-6">
                {section.items.map((item, index) => (
                    <div key={item.id || index} className="break-inside-avoid">
                        <div className="flex gap-2 mb-2 font-medium text-lg">
                            <span className="font-bold">{index + 1}.</span>
                            <div className="flex-1">
                                <RichText content={item.question} />
                            </div>
                        </div>

                        {/* Show Solution if toggled ON */}
                        {showAnswers ? (
                            <div className="ml-6 mt-3 p-4 bg-purple-50 border border-purple-200 rounded-lg relative">
                                <div className="absolute top-0 right-0 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-bl-lg rounded-tr-lg">
                                    เฉลย
                                </div>
                                {item.answer && (
                                    <div className="mb-3">
                                        <span className="font-bold text-purple-900 mr-2">คำตอบ:</span>
                                        <span className="font-medium">{item.answer}</span>
                                    </div>
                                )}
                                {item.detailedSolution && (
                                    <div>
                                        <div className="font-bold text-sm text-purple-800 mb-1 underline decoration-purple-300 underline-offset-4">วิธีทำ</div>
                                        <div className="text-gray-800 leading-relaxed">
                                            <RichText content={item.detailedSolution} />
                                        </div>
                                    </div>
                                )}
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
                ))}
            </div>
        </div>
    );
};
