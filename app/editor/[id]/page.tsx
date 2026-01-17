"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DocumentPreview } from '@/components/DocumentPreview';
import { CourseDocument, HeaderFooterConfig, DEFAULT_HEADER_FOOTER_CONFIG, Section } from '@/types';
import { HeaderFooterSettings } from '@/components/HeaderFooterSettings';
import { AppendJsonModal } from '@/components/AppendJsonModal';
import { Settings, Save, Download, Printer, FileText, Edit3, Eye, EyeOff, FilePlus, Undo2, Redo2, Eraser } from 'lucide-react';
import { getDocument, saveDocument } from '@/lib/storage';

const STORAGE_KEY = 'teaching-docs-header-footer-config';

// Load config from localStorage
const loadConfig = (): HeaderFooterConfig => {
    if (typeof window === 'undefined') return DEFAULT_HEADER_FOOTER_CONFIG;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load header/footer config:', e);
    }
    return DEFAULT_HEADER_FOOTER_CONFIG;
};

// Save config to localStorage
const saveConfig = (config: HeaderFooterConfig) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
        console.error('Failed to save header/footer config:', e);
    }
};

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [documentData, setDocumentData] = useState<CourseDocument | null>(null);
    const [showAnswers, setShowAnswers] = useState(true);
    const [isBlockEditing, setIsBlockEditing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [headerFooterConfig, setHeaderFooterConfig] = useState<HeaderFooterConfig>(DEFAULT_HEADER_FOOTER_CONFIG);
    const [isLoading, setIsLoading] = useState(true);
    const [showAppendModal, setShowAppendModal] = useState(false);

    // Undo/Redo History
    // storing past states
    const [history, setHistory] = useState<CourseDocument[]>([]);
    // storing future states (for redo)
    const [redoStack, setRedoStack] = useState<CourseDocument[]>([]);

    // Load document and config
    useEffect(() => {
        setHeaderFooterConfig(loadConfig());

        if (id) {
            const doc = getDocument(id);
            if (doc) {
                setDocumentData(doc);
            } else {
                // If not found, treat as new draft (don't save yet!)
                // Create a default empty document structure
                setDocumentData({
                    documentMetadata: {
                        id: id,
                        title: "เอกสารใหม่ (Untitled)",
                        classLevel: "ม.1",
                        semester: "semester1",
                        updatedAt: new Date().toISOString(),
                        date: new Date().getFullYear().toString(),
                        instructor: "AI Teacher"
                    },
                    sections: []
                });
            }
            setIsLoading(false);
        }
    }, [id, router]);

    // Helper to save current state to history before modification
    const saveToHistory = () => {
        if (documentData) {
            setHistory(prev => [...prev.slice(-49), documentData]);
            setRedoStack([]); // Clear redo stack on new change
        }
    };

    const handleUndo = () => {
        if (history.length === 0 || !documentData) return;
        const previousState = history[history.length - 1];
        const newHistory = history.slice(0, -1);

        setRedoStack(prev => [documentData, ...prev]); // Push current to redo
        setHistory(newHistory);
        setDocumentData(previousState);
        saveDocument(previousState); // Auto-save on undo? Yes, to persist the revert.
    };

    const handleRedo = () => {
        if (redoStack.length === 0 || !documentData) return;
        const nextState = redoStack[0];
        const newRedoStack = redoStack.slice(1);

        setHistory(prev => [...prev, documentData]); // Push current to history
        setRedoStack(newRedoStack);
        setDocumentData(nextState);
        saveDocument(nextState);
    };

    // Handle section updates from Block Editor
    const handleSectionUpdate = (sectionId: string, updatedSection: any) => {
        if (!documentData) return;

        saveToHistory(); // Save state before update

        const updatedDoc = {
            ...documentData,
            sections: documentData.sections.map(s =>
                (s.id === sectionId) ? updatedSection : s
            )
        };

        // Auto-save happens? The saveDocument isn't called here in original code??
        // Checking original code: handleSectionUpdate only called setDocumentData. 
        // handleSave called saveDocument.
        // Wait, did I miss auto-save?
        // Original line 79-87 just setDocumentData.
        // If I want undo to work, fine.

        setDocumentData(updatedDoc);
    };

    // Manual Save Handler
    const handleSave = () => {
        if (!documentData) return;

        // Update timestamp
        const updatedDoc = {
            ...documentData,
            documentMetadata: {
                ...documentData.documentMetadata,
                updatedAt: new Date().toISOString()
            }
        };

        saveDocument(updatedDoc);
        setDocumentData(updatedDoc); // Update state with new timestamp
        alert("บันทึกข้อมูลเรียบร้อยแล้ว");
    };

    // Handle saving config
    const handleSaveConfig = (config: HeaderFooterConfig) => {
        setHeaderFooterConfig(config);
        saveConfig(config);
    };

    // Handle Append Sections
    const handleAppend = (newSections: Section[]) => {
        if (!documentData) return;

        saveToHistory(); // Save state before append

        const updatedDoc = {
            ...documentData,
            sections: [...documentData.sections, ...newSections],
            documentMetadata: {
                ...documentData.documentMetadata,
                updatedAt: new Date().toISOString()
            }
        };

        setDocumentData(updatedDoc);
        saveDocument(updatedDoc);

        // Scroll to bottom to show new content
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);

        alert(`เพิ่มเนื้อหา ${newSections.length} ส่วน เรียบร้อยแล้ว`);
    };

    const handleDownloadJson = () => {
        if (!documentData) return;
        const jsonString = JSON.stringify(documentData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${documentData.documentMetadata.title || 'teaching-doc'}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!documentData) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 print:bg-white text-gray-900 dark:text-gray-100 py-20 print:py-0 px-4 md:px-0 print:px-0 font-sans transition-colors duration-200">
            <div className="flex flex-col items-center gap-6">
                {/* Toolbar */}
                {/* Floating Modern Toolbar (Bottom Dock) */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-[850px] flex gap-3 justify-between items-center p-2 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-zinc-800/50 shadow-2xl z-50 print:hidden animate-in slide-in-from-bottom-10 fade-in duration-500 ring-1 ring-black/5 dark:ring-white/10">

                    {/* Left: Title & Icon */}
                    <div className="flex items-center gap-3 px-2 pl-4 flex-1 min-w-0">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={documentData.documentMetadata.title}
                            onChange={(e) => {
                                const newTitle = e.target.value;
                                setDocumentData(prev => prev ? {
                                    ...prev,
                                    documentMetadata: {
                                        ...prev.documentMetadata,
                                        title: newTitle
                                    }
                                } : null);
                            }}
                            className="text-base font-bold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none focus:ring-0 w-full truncate placeholder:text-gray-400"
                            placeholder="ตั้งชื่อเอกสาร..."
                        />
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 pr-1">

                        {/* View Toggles */}
                        <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-full p-1 hidden sm:flex">
                            <button
                                onClick={() => setIsBlockEditing(!isBlockEditing)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${isBlockEditing
                                    ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-300 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                                title="แก้ไขเนื้อหา"
                            >
                                <Edit3 className="w-4 h-4" />
                                <span className="hidden md:inline">แก้ไข</span>
                            </button>
                            <button
                                onClick={() => setShowAnswers(!showAnswers)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${showAnswers
                                    ? 'bg-white dark:bg-zinc-700 text-green-600 dark:text-green-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                                title="เฉลย"
                            >
                                {showAnswers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                <span className="hidden md:inline">เฉลย</span>
                            </button>
                        </div>

                        <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 mx-1 hidden sm:block"></div>

                        {/* Undo Buttons */}
                        <div className="flex gap-1">
                            <button
                                onClick={handleUndo}
                                disabled={history.length === 0}
                                className={`p-2.5 rounded-full transition ${history.length === 0 ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-400'}`}
                                title="ย้อนกลับ (Undo)"
                            >
                                <Undo2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleRedo}
                                disabled={redoStack.length === 0}
                                className={`p-2.5 rounded-full transition ${redoStack.length === 0 ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-400'}`}
                                title="ทำซ้ำ (Redo)"
                            >
                                <Redo2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tools */}
                        <button
                            onClick={() => setShowAppendModal(true)}
                            className="p-2.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition"
                            title="เพิ่มเนื้อหา (Append)"
                        >
                            <FilePlus className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition"
                            title="ตั้งค่า"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                if (!documentData) return;
                                if (!confirm('ต้องการล้าง "แท็กขยะ" (เช่น [cite:...]) ออกจากเอกสารทั้งหมดหรือไม่?')) return;

                                saveToHistory(); // Backup first

                                const cleanText = (text: string | undefined) => {
                                    if (!text) return text;
                                    return text
                                        .replace(/\[cite[:_]?.*?\]/g, '') // Remove citations
                                        .replace(/\[cite.*?\]/g, '')
                                        .replace(/(\d+\.)\s*[\r\n]+\s*/g, '$1 ') // Fix: "1.\nText" -> "1. Text"
                                        .replace(/^([-*])\s*[\r\n]+\s*/gm, '$1 '); // Fix: "- \nText" -> "- Text"
                                };

                                const cleanedSections = documentData.sections.map(section => {
                                    const s = { ...section };
                                    // Clean generic content
                                    if ((s as any).content) (s as any).content = cleanText((s as any).content);

                                    // Clean Lesson specific
                                    if (s.type === 'lesson') {
                                        if (s.examples) {
                                            s.examples = s.examples.map(ex => ({
                                                ...ex,
                                                problem: cleanText(ex.problem)!,
                                                solution: cleanText(ex.solution)!
                                            }));
                                        }
                                        if (s.practiceProblems) {
                                            s.practiceProblems = s.practiceProblems.map(p => {
                                                if (typeof p === 'string') return cleanText(p)!;
                                                return {
                                                    ...p,
                                                    problem: cleanText(p.problem)!,
                                                    solution: cleanText(p.solution)!,
                                                    hint: cleanText(p.hint)
                                                };
                                            });
                                        }
                                        // Clean blocks
                                        if (s.blocks) {
                                            s.blocks = s.blocks.map(b => {
                                                if (b.type === 'text') return { ...b, content: cleanText(b.content)! };
                                                if (b.type === 'callout') return { ...b, content: cleanText(b.content)!, title: cleanText(b.title) };
                                                if (b.type === 'example') return { ...b, data: { ...b.data, problem: cleanText(b.data.problem)!, solution: cleanText(b.data.solution)! } };
                                                if (b.type === 'practice') return { ...b, data: { ...b.data, problem: cleanText(b.data.problem)!, solution: cleanText(b.data.solution)! } };
                                                return b;
                                            });
                                        }
                                    }

                                    // Clean Exam specific
                                    if (s.type === 'exam') {
                                        if (s.questions) {
                                            s.questions = s.questions.map(q => ({
                                                ...q,
                                                text: cleanText(q.text)!,
                                                explanation: cleanText(q.explanation),
                                                options: q.options.map(o => cleanText(o)!)
                                            }));
                                        }
                                    }
                                    return s;
                                });

                                const newDoc = { ...documentData, sections: cleanedSections };
                                setDocumentData(newDoc);
                                saveDocument(newDoc);
                                alert('ล้างแท็กขยะเรียบร้อยแล้ว!');
                            }}
                            className="p-2.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition"
                            title="ล้างขยะ AI (Clean Artifacts)"
                        >
                            <Eraser className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleDownloadJson}
                            className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition hidden sm:block"
                            title="Export"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition"
                            title="พิมพ์"
                        >
                            <Printer className="w-5 h-5" />
                        </button>

                        {/* Save */}
                        <button
                            onClick={handleSave}
                            className="ml-1 px-6 py-2.5 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-full text-sm font-bold transition shadow-lg shadow-blue-900/20 flex items-center gap-2 transform active:scale-95"
                        >
                            <Save className="w-4 h-4" />
                            <span className="hidden sm:inline">บันทึก</span>
                        </button>
                    </div>
                </div>

                {/* Document Preview */}
                <div className={`w-full flex flex-col items-center ${headerFooterConfig.fontFamily ? `font-${headerFooterConfig.fontFamily}` : 'font-sarabun'} ${headerFooterConfig.headingFont ? `font-heading-${headerFooterConfig.headingFont}` : 'font-heading-sarabun'}`}>
                    <DocumentPreview
                        document={documentData}
                        showAnswers={showAnswers}
                        headerFooterConfig={headerFooterConfig}
                        isEditing={isBlockEditing}
                        onUpdateSection={handleSectionUpdate}
                    />
                </div>
            </div>

            {/* Header/Footer Settings Modal */}
            {showSettings && (
                <HeaderFooterSettings
                    config={headerFooterConfig}
                    onSave={handleSaveConfig}
                    onClose={() => setShowSettings(false)}
                />
            )}

            <AppendJsonModal
                isOpen={showAppendModal}
                onClose={() => setShowAppendModal(false)}
                onAppend={handleAppend}
            />
        </div>
    );
}
