import React from 'react';
import { ExamSection } from '@/types';
import { CheckCircle2, Circle } from 'lucide-react';
import { RichText } from './RichText';

interface ExamRendererProps {
    section: ExamSection;
    showAnswers?: boolean;
}

export const ExamRenderer: React.FC<ExamRendererProps> = ({ section, showAnswers = false }) => {
    return (
        <div className={`mb-8 section-exam ${section.pageBreakBefore ? 'break-before-page' : ''}`}>
            {section.title && (
                <h2 className="text-xl font-bold border-b-2 border-gray-800 pb-1 mb-4">
                    {section.title}
                </h2>
            )}

            <div className="grid grid-cols-1 gap-0">
                {section.questions.map((q, qIndex) => (
                    <div key={q.id || qIndex} className="break-inside-avoid py-6 border-b border-gray-100 last:border-0 flex flex-col justify-between">
                        <div className="flex gap-4 mb-4">
                            <span className="font-bold text-lg min-w-[1.5rem]">{qIndex + 1}.</span>
                            <div className="flex-1">
                                <div className="text-lg mb-4 text-gray-900 leading-relaxed">
                                    <RichText content={q.text} />
                                </div>
                                <div className="space-y-3 ml-2">
                                    {q.options.map((opt, oIndex) => {
                                        const isCorrect = q.correctOption === oIndex;
                                        return (
                                            <div key={oIndex} className="flex items-start gap-3 text-base group">
                                                <div className="mt-1 shrink-0 transition-transform group-hover:scale-110">
                                                    {showAnswers && isCorrect ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                                                    )}
                                                </div>
                                                <div className={`leading-relaxed ${showAnswers && isCorrect ? 'font-bold text-green-700' : 'text-gray-700'}`}>
                                                    <RichText content={opt} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Explanation / Answer Key Block 
                            This is the main part that needs "Invisible Ink".
                            We ALWAYS render it, but hide it visually if !showAnswers.
                        */}
                        {q.explanation && (
                            <div className={`mt-4 p-3 border rounded text-sm transition-all
                                ${showAnswers
                                    ? 'bg-blue-50 border-blue-100 text-blue-800'
                                    : 'invisible-box text-invisible select-none'
                                }`}>
                                <span className="font-bold block mb-1">เฉลยละเอียด:</span>
                                <RichText content={q.explanation} />
                            </div>
                        )}
                        {/* If no explanation but we want to reserve space for "Answer: X", add that logic here if needed. 
                            For now, assuming explanation covers it. 
                        */}
                    </div>
                ))}
            </div>
        </div>
    );
};
