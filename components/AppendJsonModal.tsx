import { useState } from 'react';
import { X, FileJson, Check, PlusCircle, AlertCircle } from 'lucide-react';
import { Section } from '@/types';
import { SmartJsonEditor } from './SmartJsonEditor';
import { smartAdaptJson } from '@/lib/smartAdapter';

interface AppendJsonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAppend: (newSections: Section[]) => void;
}

export const AppendJsonModal = ({ isOpen, onClose, onAppend }: AppendJsonModalProps) => {
    const [jsonContent, setJsonContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAppend = () => {
        try {
            setError(null);
            if (!jsonContent.trim()) {
                setError('กรุณาวางโค้ด JSON');
                return;
            }

            let data;

            // Try parsing raw content first (Smart Editor likely already fixed it)
            try {
                data = JSON.parse(jsonContent);
            } catch (initialParseError) {
                // --- ROBUST CLEANING STRATEGY (Fallback) ---

                // 1. Remove Markdown Code Blocks
                let cleanJson = jsonContent
                    .replace(/^```json\s*/g, '')
                    .replace(/^```\s*/g, '')
                    .replace(/\s*```$/g, '')
                    .trim();

                // 2. Remove Citation Artifacts (GLOBAL REMOVAL)
                cleanJson = cleanJson
                    .replace(/\[cite\s*[:_]?\s*\d+.*?\]/gi, '')
                    .replace(/\[cite.*?\]/gi, '')
                    .replace(/\[source.*?\]/gi, '')
                    .replace(/【\d+:\d+†source】/g, '');

                // 3. Fix Common AI JSON Malformations
                cleanJson = cleanJson.replace(/'([^']+)'\s*:/g, '"$1":');
                cleanJson = cleanJson.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
                cleanJson = cleanJson.replace(/,(\s*[}\]])/g, '$1');

                data = JSON.parse(cleanJson);
            }

            // --- SMART ADAPTER ---
            // Use the intelligent adapter to convert ANY input into Section[]
            let sectionsToAppend: Section[] = smartAdaptJson(data);

            if (sectionsToAppend.length === 0) {
                // Final fallback for really weird structures not caught by adapter
                // Treat the whole data as a code block content
                sectionsToAppend = [{
                    id: crypto.randomUUID(),
                    type: 'lecture',
                    title: 'Imported JSON',
                    content: '```json\n' + JSON.stringify(data, null, 2) + '\n```'
                }];
            }

            // Validate / Fix IDs
            const sanitizedSections = sectionsToAppend.map(s => ({
                ...s,
                id: s.id || crypto.randomUUID(), // Ensure ID exists
            }));

            if (sanitizedSections.length === 0) {
                throw new Error('ไม่พบเนื้อหา (Sections) ใน JSON ที่ระบุ');
            }

            onAppend(sanitizedSections);
            setJsonContent('');
            onClose();

        } catch (e: any) {
            // Don't log to console to avoid Next.js error overlay for user input errors
            let msg = 'ข้อมูล JSON ไม่ถูกต้อง';
            if (e instanceof SyntaxError) {
                msg = `รูปแบบ JSON ไม่ถูกต้อง: ${e.message}`; // More detailed info
            } else if (e.message) {
                msg = `เกิดข้อผิดพลาด: ${e.message}`;
            }
            setError(msg);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-green-600" />
                        เพิ่มเนื้อหาต่อท้าย (Append JSON)
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4 mb-4 text-sm text-green-800 dark:text-green-300">
                        <p className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>
                                วาง Code JSON ของ "แบบฝึกหัด" หรือ "เนื้อหาใหม่" ที่นี่ <br />
                                ระบบจะนำไป <b>ต่อท้าย</b> เนื้อหาเดิมที่มีอยู่ทันที
                            </span>
                        </p>
                    </div>

                    <div className="h-80 mb-4">
                        <SmartJsonEditor
                            value={jsonContent}
                            onChange={(val) => setJsonContent(val)}
                            onValidChange={(isValid) => setError(isValid ? null : 'รูปแบบ JSON ยังไม่ถูกต้อง')}
                        />
                    </div>

                    {error && error !== 'รูปแบบ JSON ยังไม่ถูกต้อง' && (
                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
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
                        onClick={handleAppend}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg shadow-green-500/20 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" />
                        เพิ่มเนื้อหา
                    </button>
                </div>
            </div>
        </div>
    );
};
