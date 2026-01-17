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
        <div className={`mb-8 section-exam break-inside-avoid ${section.pageBreakBefore ? 'break-before-page' : ''}`}>
            {section.title && (
                <h2 className={`${sizeTitle} font-bold border-b-2 border-gray-800 pb-1 mb-4`}>
                    {section.title}
                </h2>
            )}

            <div className="grid grid-cols-1 gap-0">
                {section.questions.map((q, qIndex) => (
                    <div key={q.id || qIndex} className="break-inside-avoid py-6 border-b border-gray-100 last:border-0 flex flex-col justify-between">
                        <div className={`flex gap-2 mb-4 font-medium ${sizeNumber}`}>
                            <span className="font-bold whitespace-nowrap">{qIndex + 1}.</span>
                            <div className="flex-1">
                                <div className="mb-4">
                                    {q.difficulty && getDifficultyBadge(q.difficulty, fontSizeLevel)}
                                    <div className={`inline text-gray-900 leading-relaxed ${sizeText}`}>
                                        <RichText content={q.text} />
                                    </div>
                                </div>
                                <div className="space-y-3 ml-2">
                                    {q.options.map((opt, oIndex) => {
                                        const isCorrect = q.correctOption === oIndex;
                                        return (
                                            <div key={oIndex} className={`flex items-start gap-3 ${sizeOption} group`}>
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

                        {/* Explanation */}
                        {q.explanation && (
                            <div className={`mt-4 pl-4 py-3 pr-4 border-l-4 rounded-r-md transition-all
                                ${showAnswers
                                    ? 'bg-gray-50 border-gray-300 text-gray-800'
                                    : 'invisible-box text-invisible select-none border-transparent'
                                }`}>
                                {showAnswers && (
                                    <div className="flex gap-3">
                                        <div className="shrink-0 mt-0.5 text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11-6 6v3h9l3-3" /><path d="m11.6 16.8a3 3 0 1 1-5.8-1.6" /><path d="m18 2h6v6" /><path d="m2 22h6v-6" /><path d="m9 22v-3h3" /><path d="m20 22v-3h3" /></svg>
                                        </div>
                                        <div className={`leading-relaxed ${sizeText}`}>
                                            <span className={`font-bold text-gray-700 block mb-1 ${sizeText}`}>เฉลยละเอียด</span>
                                            <RichText content={q.explanation} />
                                        </div>
                                    </div>
                                )}
                                {!showAnswers && <RichText content={q.explanation} />}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
