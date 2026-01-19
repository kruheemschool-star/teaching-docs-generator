import React from 'react';
import { ExamSection } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface ExamEditorProps {
    section: ExamSection;
    onChange: (updatedSection: ExamSection) => void;
    onBack: () => void;
}

export const ExamEditor: React.FC<ExamEditorProps> = ({ section, onChange, onBack }) => {

    const addQuestion = () => {
        onChange({
            ...section,
            questions: [...section.questions, { text: "New Question", options: ["Option A", "Option B", "Option C", "Option D"], correctOption: 0 }]
        });
    };

    const updateQuestion = (qIndex: number, field: string, value: any) => {
        const newQuestions = [...section.questions];
        newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
        onChange({ ...section, questions: newQuestions });
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...section.questions];
        const newOptions = [...newQuestions[qIndex].options];
        const originalOpt = newOptions[oIndex];

        if (typeof originalOpt === 'string') {
            newOptions[oIndex] = value;
        } else {
            newOptions[oIndex] = { ...originalOpt, text: value };
        }

        newQuestions[qIndex].options = newOptions;
        onChange({ ...section, questions: newQuestions });
    };

    const removeQuestion = (index: number) => {
        const newQuestions = section.questions.filter((_, i) => i !== index);
        onChange({ ...section, questions: newQuestions });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm">
                    ← Back
                </button>
                <span className="text-zinc-500">|</span>
                <h3 className="text-white font-bold text-sm uppercase">Edit Exam</h3>
            </div>

            <div>
                <label className="block text-xs text-zinc-400 mb-1">Title</label>
                <input
                    type="text"
                    value={section.title || ''}
                    onChange={(e) => onChange({ ...section, title: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                />
            </div>

            <div className="border-t border-zinc-700 pt-4">
                <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase">Questions</label>
                    <button onClick={addQuestion} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Question
                    </button>
                </div>

                <div className="space-y-4">
                    {section.questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-zinc-900 p-3 rounded border border-zinc-700">
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={q.text}
                                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                    className="flex-1 bg-zinc-800 border border-zinc-600 rounded p-1 text-sm text-gray-200 focus:border-blue-500 outline-none font-bold"
                                    placeholder="Question text"
                                />
                                <button onClick={() => removeQuestion(qIndex)} className="text-zinc-500 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-1 ml-2 border-l-2 border-zinc-700 pl-3">
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name={`correct-${qIndex}`}
                                            checked={q.correctOption === oIndex}
                                            onChange={() => updateQuestion(qIndex, 'correctOption', oIndex)}
                                            className="accent-green-500"
                                            title="Mark as correct answer"
                                        />
                                        <input
                                            type="text"
                                            value={typeof opt === 'string' ? opt : opt.text}
                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                            className="flex-1 bg-transparent border-b border-zinc-800 focus:border-zinc-500 text-xs text-zinc-300 py-1 outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
