"use client";

import { DocumentMetadata } from "@/types";
import { Copy, Edit, FileText, MoreVertical, Trash2, FolderInput } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
// ... imports

interface DocumentCardProps {
    doc: DocumentMetadata;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onRename: (id: string, currentTitle: string) => void;
    onMove: () => void;
    // New Props for Bulk Selection
    selected?: boolean;
    onToggleSelect?: (id: string) => void;
    selectionMode?: boolean;
}

export const DocumentCard = ({
    doc,
    onDelete,
    onDuplicate,
    onRename,
    onMove,
    selected = false,
    onToggleSelect,
    selectionMode = false
}: DocumentCardProps) => {
    // ... existing ...

    // Add logic here
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onDuplicate(doc.id);
        setShowMenu(false);
    };

    const handleRename = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onRename(doc.id, doc.title);
        setShowMenu(false);
    };

    const handleMove = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onMove();
        setShowMenu(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onDelete(doc.id);
        setShowMenu(false);
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData("docId", doc.id);
        e.dataTransfer.effectAllowed = "move";
    };

    return (
        <Link
            href={`/editor/${doc.id}`}
            draggable
            onDragStart={handleDragStart}
            className={`block group relative bg-white dark:bg-zinc-900 border rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-1 duration-200 cursor-grab active:cursor-grabbing
                ${selected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700'
                }
            `}
        >
            {/* Selection Checkbox Overlay */}
            {(selectionMode || selected) && onToggleSelect && (
                <div
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleSelect(doc.id);
                    }}
                    className="absolute top-4 right-4 z-30 p-2 cursor-pointer"
                >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 group-hover:border-blue-400'
                        }`}>
                        {selected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                </div>
            )}

            {/* Checkbox Hover Trigger (if not in selection mode) */}
            {!selectionMode && onToggleSelect && (
                <div
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleSelect(doc.id);
                    }}
                    className="absolute top-4 right-12 z-20 w-8 h-8 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                >
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 ml-auto pointer-events-none" />
                </div>
            )}

            {/* Icon */}
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                </div>

                {/* Menu Button */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-gray-100 dark:border-zinc-800 z-20 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={handleRename}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                เปลี่ยนชื่อ
                            </button>
                            <button
                                onClick={handleMove}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                            >
                                <FolderInput className="w-4 h-4" />
                                ย้ายไปโฟลเดอร์
                            </button>
                            <button
                                onClick={handleDuplicate}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                ทำสำเนา
                            </button>
                            <div className="my-1 border-t border-gray-100 dark:border-zinc-800"></div>
                            <button
                                onClick={handleDelete}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                ลบเอกสาร
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Title & Info */}
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {doc.title || "ไม่มีชื่อเรื่อง"}
            </h3>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
                {/* Topic Tag */}
                {doc.topic && doc.topic !== "อื่นๆ" && (
                    <span className={`px-2 py-0.5 text-xs rounded-md font-medium border ${doc.topic === 'พีชคณิต' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                            doc.topic === 'เรขาคณิต' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                                doc.topic === 'สถิติและประมวลผลข้อมูล' ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800' :
                                    doc.topic === 'แคลคูลัส' ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :
                                        doc.topic === 'จำนวนและตัวเลข' ? 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' :
                                            doc.topic === 'การวัด' ? 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800' :
                                                'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                        }`}>
                        {doc.topic}
                    </span>
                )}

                {doc.classLevel && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-xs rounded-md font-medium border border-transparent">
                        {doc.classLevel}
                    </span>
                )}
                {doc.semester && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-xs rounded-md font-medium border border-transparent">
                        {doc.semester === "semester1" ? "เทอม 1" : doc.semester === "semester2" ? "เทอม 2" : "เทอม 1"}
                    </span>
                )}
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-zinc-800 pt-3 flex items-center justify-between">
                <span>แก้ไขล่าสุด</span>
                <span>{doc.updatedAt && !isNaN(new Date(doc.updatedAt).getTime())
                    ? formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true, locale: th })
                    : "เมื่อสักครู่"}
                </span>
            </div>
        </Link>
    );
};
