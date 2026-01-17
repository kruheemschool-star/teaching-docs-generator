import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { CourseDocument } from '@/types';

interface FileUploadProps {
    onDataLoaded: (data: CourseDocument) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
    const [error, setError] = useState<string | null>(null);
    const [pastedContent, setPastedContent] = useState('');

    const processContent = (content: string) => {
        setError(null);
        try {
            // 1. Smart Cleaning: Remove Markdown code blocks if present
            let cleanContent = content.trim();
            if (cleanContent.startsWith('```json')) {
                cleanContent = cleanContent.replace(/^```json/, '').replace(/```$/, '');
            } else if (cleanContent.startsWith('```')) {
                cleanContent = cleanContent.replace(/^```/, '').replace(/```$/, '');
            }

            // 2. Parse JSON
            const parsedData = JSON.parse(cleanContent);

            // 3. Structural Validation
            if (!parsedData.sections || !Array.isArray(parsedData.sections)) {
                throw new Error("Invalid JSON structure: Missing 'sections' array.");
            }

            // 4. Logical Validation (The "Intelligent" Part)
            const warnings: string[] = [];
            parsedData.sections.forEach((section: any, index: number) => {
                if (section.type === 'exam') {
                    section.questions?.forEach((q: any, qIndex: number) => {
                        if (q.correctOption < 0 || q.correctOption >= q.options.length) {
                            warnings.push(`Section ${index + 1} (Exam), Question ${qIndex + 1}: Correct option index (${q.correctOption}) is invalid.`);
                            // Auto-fix: Reset to 0
                            q.correctOption = 0;
                        }
                    });
                }
            });

            if (warnings.length > 0) {
                console.warn("Auto-corrected issues:", warnings);
                setError(`Fixed ${warnings.length} issues automatically (e.g. invalid answer indexes).`);
            }

            onDataLoaded(parsedData as CourseDocument);
        } catch (err) {
            console.error(err);
            // Enhanced Error Message
            let msg = 'Failed to parse JSON.';
            if (err instanceof SyntaxError) {
                msg += ' Check for missing commas or quotes.';
            } else if (err instanceof Error) {
                msg += ' ' + err.message;
            }
            setError(msg);
        }
    };

    const handlePasteSubmit = () => {
        processContent(pastedContent);
    };

    return (
        <div className="w-full max-w-xl mx-auto mt-0">
            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        📋 วางโค้ด JSON จาก AI
                    </label>
                    <textarea
                        value={pastedContent}
                        onChange={(e) => setPastedContent(e.target.value)}
                        placeholder='วางโค้ด JSON ที่ได้จาก Gemini หรือ ChatGPT ที่นี่...'
                        className="w-full h-64 p-4 bg-[#F7F7F5] text-gray-900 font-mono text-sm rounded-lg border-2 border-gray-200 focus:border-black outline-none resize-none leading-relaxed"
                    />
                </div>
                <button
                    onClick={handlePasteSubmit}
                    disabled={!pastedContent.trim()}
                    className="w-full py-3 bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-lg text-base transition"
                >
                    🚀 สร้างเอกสาร (Render Document)
                </button>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2 font-medium border border-red-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
};
