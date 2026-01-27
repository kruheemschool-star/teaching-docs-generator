"use client";

import React, { useState, useEffect } from "react";
import { DocumentMetadata } from "@/types";
import { X, Tag, BookOpen, Calendar, Type } from "lucide-react";

interface MetadataModalProps {
    isOpen: boolean;
    onClose: () => void;
    metadata: DocumentMetadata;
    onSave: (newMetadata: DocumentMetadata) => void;
}

const CLASS_LEVELS = ["ประถมศึกษา", "ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];
const SEMESTERS = [
    { value: "semester1", label: "เทอม 1" },
    { value: "semester2", label: "เทอม 2" }
];
const TOPICS = [
    'พีชคณิต',
    'เรขาคณิต',
    'สถิติและประมวลผลข้อมูล',
    'จำนวนและตัวเลข',
    'การวัด',
    'แคลคูลัส',
    'อื่นๆ'
];

export const MetadataModal: React.FC<MetadataModalProps> = ({
    isOpen,
    onClose,
    metadata,
    onSave,
}) => {
    const [formData, setFormData] = useState<DocumentMetadata>(metadata);

    useEffect(() => {
        setFormData(metadata);
    }, [metadata, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">ข้อมูลเอกสาร</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Type className="w-4 h-4 text-gray-400" />
                            ชื่อเอกสาร
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100"
                            placeholder="ใส่ชื่อเอกสาร..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Class Level */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-gray-400" />
                                ระดับชั้น
                            </label>
                            <select
                                value={formData.classLevel || ""}
                                onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                                className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 appearance-none"
                            >
                                <option value="" disabled>เลือกชั้นปี</option>
                                {CLASS_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Semester */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                ภาคเรียน
                            </label>
                            <select
                                value={formData.semester || ""}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 appearance-none"
                            >
                                <option value="" disabled>เลือกเทอม</option>
                                {SEMESTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Topic (New) */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            หมวดหมู่ (Tag)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {TOPICS.map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setFormData({ ...formData, topic })}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition border flex items-center justify-center gap-2 ${formData.topic === topic
                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                                        : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700'
                                        }`}
                                >
                                    {/* Optional: Add dot color indicator if needed, but the active state style is enough */}
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-zinc-800/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-zinc-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-lg shadow-blue-500/20"
                    >
                        บันทึก
                    </button>
                </div>
            </div>
        </div>
    );
};
