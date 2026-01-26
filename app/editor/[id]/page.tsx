"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DocumentPreview } from '@/components/DocumentPreview';
import { CourseDocument, HeaderFooterConfig, DEFAULT_HEADER_FOOTER_CONFIG, Section, DocumentMetadata } from '@/types';

import { AppendJsonModal } from '@/components/AppendJsonModal';
import { MetadataModal } from '@/components/MetadataModal';
import { Save, Download, Printer, FileText, Edit3, Eye, EyeOff, FilePlus, Undo2, Redo2, Eraser, Plus, Minus, Info } from 'lucide-react';
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

    const [headerFooterConfig, setHeaderFooterConfig] = useState<HeaderFooterConfig>(DEFAULT_HEADER_FOOTER_CONFIG);
    const [isLoading, setIsLoading] = useState(true);
    const [showAppendModal, setShowAppendModal] = useState(false);
    const [showMetadataModal, setShowMetadataModal] = useState(false); // New State
    const [fontSizeLevel, setFontSizeLevel] = useState(0); // 0=M, 1=L, 2=XL

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

    const handleSaveMetadata = (newMetadata: DocumentMetadata) => {
        if (!documentData) return;
        saveToHistory();

        const updatedDoc = {
            ...documentData,
            documentMetadata: {
                ...newMetadata,
                updatedAt: new Date().toISOString()
            }
        };

        setDocumentData(updatedDoc);
        saveDocument(updatedDoc);
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
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 print:bg-white text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">

            {/* Document Preview Area */}
            <div className={`w-full flex justify-center py-20 px-4 md:px-0 print:p-0 ${headerFooterConfig.fontFamily ? `font-${headerFooterConfig.fontFamily}` : 'font-sarabun'} ${headerFooterConfig.headingFont ? `font-heading-${headerFooterConfig.headingFont}` : 'font-heading-sarabun'}`}>
                <div className="w-full max-w-5xl print:w-full print:max-w-none">
                    <DocumentPreview
                        document={documentData}
                        showAnswers={showAnswers}
                        headerFooterConfig={headerFooterConfig}
                        isEditing={isBlockEditing}
                        onUpdateSection={handleSectionUpdate}
                        fontSizeLevel={fontSizeLevel}
                    />
                </div>
            </div>

            {/* Bottom Floating Toolbar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto max-w-4xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 shadow-2xl rounded-full p-2 flex items-center justify-center gap-4 z-50 print:hidden animate-in slide-in-from-bottom-10 fade-in duration-500">

                {/* Left: Title - REMOVED per user request */}

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 pr-1">

                    {/* View Controls */}
                    <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-full p-1 hidden sm:flex">
                        <button
                            onClick={() => setIsBlockEditing(!isBlockEditing)}
                            className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${isBlockEditing
                                ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-300 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            title="แก้ไขเนื้อหา"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span className="hidden lg:inline">แก้ไข</span>
                        </button>
                        <button
                            onClick={() => setShowAnswers(!showAnswers)}
                            className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${showAnswers
                                ? 'bg-white dark:bg-zinc-700 text-green-600 dark:text-green-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            title="เฉลย"
                        >
                            {showAnswers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            <span className="hidden lg:inline">เฉลย</span>
                        </button>
                    </div>

                    <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800 hidden sm:block mx-1"></div>

                    {/* Font Size */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 rounded-full px-1.5 py-1 border border-gray-200 dark:border-zinc-700">
                        <button
                            onClick={() => setFontSizeLevel(prev => Math.max(0, prev - 1))}
                            disabled={fontSizeLevel === 0}
                            className="p-1.5 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title="ลดขนาด"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-mono font-bold w-4 text-center text-gray-600 dark:text-gray-300 select-none">
                            {fontSizeLevel === 0 ? 'M' : fontSizeLevel === 1 ? 'L' : 'XL'}
                        </span>
                        <button
                            onClick={() => setFontSizeLevel(prev => Math.min(2, prev + 1))}
                            disabled={fontSizeLevel === 2}
                            className="p-1.5 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                            title="เพิ่มขนาด"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800 hidden sm:block mx-1"></div>

                    {/* Tools */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => {
                                if (!documentData) return;
                                if (!confirm('ต้องการล้าง "แท็กขยะ" (เช่น [cite:...]) ออกจากเอกสารทั้งหมดหรือไม่?')) return;
                                saveToHistory(); // Backup first
                                const cleanText = (text: string | undefined) => {
                                    if (!text) return text;
                                    return text
                                        .replace(/\[cite\s*[:_]?\s*\d+.*?\]/gi, '')
                                        .replace(/\[cite[:_]?.*?\]/gi, '')
                                        .replace(/\[source[:_]?.*?\]/gi, '')
                                        .replace(/【\d+:\d+†source】/g, '')
                                        .replace(/(\d+\.)\s*[\r\n]+\s*/g, '$1 ')
                                        .replace(/^([-*])\s*[\r\n]+\s*/gm, '$1 ');
                                };
                                const cleanedSections = documentData.sections.map(section => {
                                    const s = { ...section };
                                    if ((s as any).content) (s as any).content = cleanText((s as any).content);
                                    if (s.type === 'lesson') {
                                        if (s.examples) s.examples = s.examples.map(ex => ({ ...ex, problem: cleanText(ex.problem)!, solution: cleanText(ex.solution)! }));
                                        if (s.practiceProblems) s.practiceProblems = s.practiceProblems.map(p => typeof p === 'string' ? { problem: cleanText(p)!, solution: '', hint: '' } : { ...p, problem: cleanText(p.problem)!, solution: cleanText(p.solution)!, hint: cleanText(p.hint) });
                                        if (s.blocks) s.blocks = s.blocks.map(b => {
                                            if (b.type === 'text') return { ...b, content: cleanText(b.content)! };
                                            if (b.type === 'callout') return { ...b, content: cleanText(b.content)!, title: cleanText(b.title) };
                                            if (b.type === 'example') return { ...b, data: { ...b.data, problem: cleanText(b.data.problem)!, solution: cleanText(b.data.solution)! } };
                                            if (b.type === 'practice') return { ...b, data: { ...b.data, problem: cleanText(b.data.problem)!, solution: cleanText(b.data.solution)! } };
                                            return b;
                                        });
                                    }
                                    if (s.type === 'exam') {
                                        if (s.questions) s.questions = s.questions.map(q => ({ ...q, text: cleanText(q.text)!, explanation: cleanText(q.explanation), options: q.options.map(o => typeof o === 'string' ? cleanText(o)! : { ...o, text: cleanText(o.text)! }) }));
                                    }
                                    return s;
                                });
                                const newDoc = { ...documentData, sections: cleanedSections };
                                setDocumentData(newDoc);
                                saveDocument(newDoc);
                                alert('ล้างแท็กขยะเรียบร้อยแล้ว!');
                            }}
                            className="p-2.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition hidden sm:inline-flex"
                            title="ล้างขยะ AI"
                        >
                            <Eraser className="w-5 h-5" />
                        </button>

                        {/* Metadata/Settings Button */}
                        <button
                            onClick={() => setShowMetadataModal(true)}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition"
                            title="ข้อมูลเอกสาร/หมวดหมู่"
                        >
                            <Info className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setShowAppendModal(true)}
                            className="p-2.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition"
                            title="เพิ่มเนื้อหา"
                        >
                            <FilePlus className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleUndo}
                            disabled={history.length === 0}
                            className={`p-2.5 rounded-full transition ${history.length === 0 ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                            title="Undo"
                        >
                            <Undo2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={redoStack.length === 0}
                            className={`p-2.5 rounded-full transition hidden sm:inline-flex ${redoStack.length === 0 ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                            title="Redo"
                        >
                            <Redo2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition hidden sm:inline-flex"
                            title="พิมพ์"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="ml-1 px-5 py-2.5 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-full text-sm font-bold transition shadow-lg shadow-blue-900/20 flex items-center gap-2 transform active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">บันทึก</span>
                    </button>
                </div>
            </div>

            <AppendJsonModal
                isOpen={showAppendModal}
                onClose={() => setShowAppendModal(false)}
                onAppend={handleAppend}
            />

            <MetadataModal
                isOpen={showMetadataModal}
                onClose={() => setShowMetadataModal(false)}
                metadata={documentData.documentMetadata}
                onSave={handleSaveMetadata}
            />
        </div >
    );
}
