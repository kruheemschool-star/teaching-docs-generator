import React from 'react';
import { ExerciseSection } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface ExerciseEditorProps {
    section: ExerciseSection;
    onChange: (updatedSection: ExerciseSection) => void;
    onBack: () => void;
}

export const ExerciseEditor: React.FC<ExerciseEditorProps> = ({ section, onChange, onBack }) => {

    const addItem = () => {
        onChange({
            ...section,
            items: [...section.items, { question: "New Question", spaceForWork: true, lines: 3 }]
        });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...section.items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ ...section, items: newItems });
    };

    const removeItem = (index: number) => {
        const newItems = section.items.filter((_, i) => i !== index);
        onChange({ ...section, items: newItems });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm">
                    ← Back
                </button>
                <span className="text-zinc-500">|</span>
                <h3 className="text-white font-bold text-sm uppercase">Edit Exercise</h3>
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

            <div>
                <label className="block text-xs text-zinc-400 mb-1">Instructions</label>
                <textarea
                    value={section.instructions || ''}
                    onChange={(e) => onChange({ ...section, instructions: e.target.value })}
                    className="w-full h-20 bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                />
            </div>

            <div className="border-t border-zinc-700 pt-4">
                <div className="flex justify-between items-end mb-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase">Questions</label>
                    <button onClick={addItem} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Question
                    </button>
                </div>

                <div className="space-y-3">
                    {section.items.map((item, index) => (
                        <div key={index} className="bg-zinc-900 p-3 rounded border border-zinc-700">
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={item.question}
                                    onChange={(e) => updateItem(index, 'question', e.target.value)}
                                    className="flex-1 bg-zinc-800 border border-zinc-600 rounded p-1 text-sm text-gray-200 focus:border-blue-500 outline-none"
                                    placeholder="Question text"
                                />
                                <button onClick={() => removeItem(index)} className="text-zinc-500 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex gap-4 items-center">
                                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={item.spaceForWork}
                                        onChange={(e) => updateItem(index, 'spaceForWork', e.target.checked)}
                                        className="rounded bg-zinc-800 border-zinc-600"
                                    />
                                    Space for work
                                </label>

                                {item.spaceForWork && (
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-zinc-400">Lines:</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={20}
                                            value={item.lines || 0}
                                            onChange={(e) => updateItem(index, 'lines', parseInt(e.target.value))}
                                            className="w-12 bg-zinc-800 border border-zinc-600 rounded p-1 text-xs text-white text-center"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
