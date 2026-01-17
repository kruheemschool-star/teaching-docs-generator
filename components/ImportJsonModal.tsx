
import { useState } from 'react';
import { X, FileJson, Check, AlertCircle } from 'lucide-react';
import { CourseDocument } from '@/types';
import { saveDocument } from '@/lib/storage';

interface ImportJsonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: () => void;
    currentFolderId: string | null;
}

export const ImportJsonModal = ({ isOpen, onClose, onImport, currentFolderId }: ImportJsonModalProps) => {
    const [jsonContent, setJsonContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleImport = () => {
        try {
            setError(null);
            if (!jsonContent.trim()) {
                setError('กรุณาวางโค้ด JSON');
                return;
            }

            // Remove Markdown code blocks if present
            let cleanJson = jsonContent
                .replace(/^```json\s*/g, '') // Remove start ```json
                .replace(/^```\s*/g, '')     // Remove start ```
                .replace(/\s*```$/g, '')      // Remove end ```
                .trim();

            // --- AUTO-FIX COMMON AI ERRORS ---
            // 1. Remove Citation tags (e.g. [cite_start], [cite_end])
            cleanJson = cleanJson.replace(/\[cite_[^\]]*\]/g, '');

            // 2. Fix Single Quotes for Keys (e.g. 'problem': -> "problem":)
            // This is a common Python/JS-like format AI sometimes outputs
            cleanJson = cleanJson.replace(/'([^']+)'\s*:/g, '"$1":');

            // 3. Fix Trailing Commas (e.g. { a: 1, } -> { a: 1 })
            cleanJson = cleanJson.replace(/,(\s*[}\]])/g, '$1');

            let data = JSON.parse(cleanJson);

            // --- Smart Normalization for AI Output ---
            // AI sometimes generates flat objects like { "title": "...", "sections": [...] }
            if (!data.documentMetadata && data.title) {
                console.log("Normalizing flat JSON structure...");
                data = {
                    documentMetadata: {
                        id: crypto.randomUUID(),
                        title: data.title,
                        subtitle: data.subtitle || '',
                        classLevel: data.classLevel || '',
                        semester: data.semester || '',
                        updatedAt: new Date().toISOString()
                    },
                    sections: data.sections || []
                };
            }

            // Case: Array of sections/blocks
            if (Array.isArray(data)) {
                data = {
                    documentMetadata: {
                        id: crypto.randomUUID(),
                        title: "Imported Document (จาก Array)",
                        updatedAt: new Date().toISOString()
                    },
                    sections: data
                };
            }

            // Basic Validation
            if (!data.documentMetadata || !data.sections) {
                throw new Error('โครงสร้าง JSON ไม่ครบถ้วน (ต้องมี documentMetadata หรือ title และ sections)');
            }

            // Prepare for import
            const newDoc: CourseDocument = {
                ...data,
                documentMetadata: {
                    ...data.documentMetadata,
                    id: crypto.randomUUID(), // Always generate new ID
                    updatedAt: new Date().toISOString(),
                    folderId: currentFolderId || null // Assign to current folder
                }
            };

            // Save
            saveDocument(newDoc);

            // Cleanup
            setJsonContent('');
            onImport();
            onClose();
            alert('นำเข้าเอกสารสำเร็จ!');

        } catch (e: any) {
            console.error(e);
            setError(e.message || 'เกิดข้อผิดพลาดในการอ่าน JSON');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <FileJson className="w-5 h-5 text-blue-600" />
                        นำเข้าเอกสารจาก JSON (AI Code)
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-4 text-sm text-blue-800 dark:text-blue-300">
                        <p className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>
                                นำโค้ด JSON ที่ได้จาก AI (เช่น ChatGPT, Claude) มาวางที่นี่ <br />
                                ระบบจะสร้างเอกสารใหม่ให้ทันทีในโฟลเดอร์ปัจจุบัน
                            </span>
                        </p>
                    </div>

                    <textarea
                        className="w-full h-64 p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder='วางโค้ด JSON ที่นี่...
{
  "documentMetadata": { ... },
  "sections": [ ... ]
}'
                        value={jsonContent}
                        onChange={(e) => setJsonContent(e.target.value)}
                    />

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50 dark:bg-zinc-800/50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-white dark:hover:bg-zinc-700 border border-transparent hover:border-gray-200 dark:hover:border-zinc-600 rounded-lg transition"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleImport}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        เริ่มสร้างเอกสาร
                    </button>
                </div>
            </div>
        </div>
    );
};
