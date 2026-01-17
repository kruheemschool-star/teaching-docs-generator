import React from 'react';
import { LectureSection } from '@/types';

interface LectureEditorProps {
    section: LectureSection;
    onChange: (updatedSection: LectureSection) => void;
    onBack: () => void;
}

export const LectureEditor: React.FC<LectureEditorProps> = ({ section, onChange, onBack }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <button onClick={onBack} className="text-zinc-400 hover:text-white text-sm">
                    ← Back
                </button>
                <span className="text-zinc-500">|</span>
                <h3 className="text-white font-bold text-sm uppercase">Edit Lecture</h3>
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
                <label className="block text-xs text-zinc-400 mb-1">Content (Markdown supported)</label>
                <textarea
                    value={section.content}
                    onChange={(e) => onChange({ ...section, content: e.target.value })}
                    className="w-full h-64 bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none font-mono"
                />
                <p className="text-xs text-zinc-500 mt-1">Supports Markdown & LaTeX ($$x^2$$)</p>
            </div>
        </div>
    );
};
