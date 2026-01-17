import React, { useState } from 'react';
import { CourseDocument, Section } from '@/types';
import { DocumentPreview } from './DocumentPreview';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { LectureEditor } from './editors/LectureEditor';
import { ExerciseEditor } from './editors/ExerciseEditor';
import { ExamEditor } from './editors/ExamEditor';

interface VisualEditorProps {
    initialDocument: CourseDocument;
    onSave: (doc: CourseDocument) => void;
    onCancel: () => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({ initialDocument, onSave, onCancel }) => {
    const [document, setDocument] = useState<CourseDocument>(initialDocument);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

    // Helper to update document metadata
    const updateMetadata = (key: string, value: string) => {
        setDocument(prev => ({
            ...prev,
            documentMetadata: { ...prev.documentMetadata, [key]: value }
        }));
    };

    // Helper to remove section
    const removeSection = (id: string) => {
        setDocument(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s.id !== id)
        }));
        if (activeSectionId === id) {
            setActiveSectionId(null);
        }
    };

    // Helper to add new section
    const addSection = (type: 'lecture' | 'exercise' | 'exam') => {
        const newSection: Section = type === 'lecture'
            ? { id: Date.now().toString(), type: 'lecture', title: 'New Lecture', content: 'Enter content here...' }
            : type === 'exercise'
                ? { id: Date.now().toString(), type: 'exercise', title: 'New Exercise', items: [] }
                : { id: Date.now().toString(), type: 'exam', title: 'New Exam', questions: [] };

        setDocument(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }));
        setActiveSectionId(newSection.id);
    };

    const updateSection = (updatedSection: Section) => {
        setDocument(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === updatedSection.id ? updatedSection : s)
        }));
    };

    const activeSection = document.sections.find(s => s.id === activeSectionId);

    return (
        <div className="fixed inset-0 bg-zinc-900 z-50 flex flex-col">
            {/* Top Bar */}
            <div className="h-14 border-b border-zinc-700 bg-zinc-800 flex items-center justify-between px-4 shrink-0">
                <h2 className="text-white font-bold">Visual Editor</h2>
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-zinc-300 hover:text-white"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => onSave(document)}
                        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left: Editor Panel */}
                <div className="w-[400px] border-r border-zinc-700 bg-zinc-800 flex flex-col shrink-0">
                    <div className="p-4 border-b border-zinc-700 overflow-y-auto flex-1 custom-scrollbar">

                        {activeSection ? (
                            // 1. Detail View (Editor)
                            <>
                                {activeSection.type === 'lecture' && <LectureEditor section={activeSection} onChange={updateSection} onBack={() => setActiveSectionId(null)} />}
                                {activeSection.type === 'exercise' && <ExerciseEditor section={activeSection} onChange={updateSection} onBack={() => setActiveSectionId(null)} />}
                                {activeSection.type === 'exam' && <ExamEditor section={activeSection} onChange={updateSection} onBack={() => setActiveSectionId(null)} />}
                            </>
                        ) : (
                            // 2. Master View (List)
                            <>
                                {/* Metadata Editor */}
                                <div className="mb-6 space-y-4">
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Document Info</h3>
                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={document.documentMetadata.title}
                                            onChange={(e) => updateMetadata('title', e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1">Subtitle</label>
                                        <input
                                            type="text"
                                            value={document.documentMetadata.subtitle || ''}
                                            onChange={(e) => updateMetadata('subtitle', e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-400 mb-1">Instructor</label>
                                        <input
                                            type="text"
                                            value={document.documentMetadata.instructor || ''}
                                            onChange={(e) => updateMetadata('instructor', e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Section List */}
                                <div>
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Sections</h3>
                                    <div className="space-y-2">
                                        {document.sections.map((section) => (
                                            <div
                                                key={section.id}
                                                className="p-3 rounded border bg-zinc-900 border-zinc-700 cursor-pointer hover:border-zinc-500 transition-all group"
                                                onClick={() => setActiveSectionId(section.id)}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold uppercase text-blue-400">{section.type}</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                                                        className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-white font-medium truncate">{section.title || "Untitled Section"}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Section Buttons */}
                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        <button onClick={() => addSection('lecture')} className="flex flex-col items-center justify-center p-3 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 transition text-zinc-400 hover:text-white gap-2">
                                            <Plus className="w-5 h-5" />
                                            <span className="text-xs">Lecture</span>
                                        </button>
                                        <button onClick={() => addSection('exercise')} className="flex flex-col items-center justify-center p-3 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 transition text-zinc-400 hover:text-white gap-2">
                                            <Plus className="w-5 h-5" />
                                            <span className="text-xs">Exercise</span>
                                        </button>
                                        <button onClick={() => addSection('exam')} className="flex flex-col items-center justify-center p-3 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 transition text-zinc-400 hover:text-white gap-2">
                                            <Plus className="w-5 h-5" />
                                            <span className="text-xs">Exam</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                </div>

                {/* Right: Preview Panel */}
                <div className="flex-1 overflow-y-auto bg-zinc-500 p-8 flex justify-center">
                    <div className="transform scale-90 origin-top">
                        <DocumentPreview document={document} />
                    </div>
                </div>

            </div>
        </div>
    );
};
