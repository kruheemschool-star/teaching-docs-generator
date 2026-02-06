"use client";

import { DocumentMetadata } from "@/types";
import { Copy, Edit, MoreVertical, Trash2, FolderInput, Palette, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { DocumentIconPicker, getIconById, getColorById } from "./DocumentIconPicker";

interface DocumentCardProps {
    doc: DocumentMetadata;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onRename: (id: string, currentTitle: string) => void;
    onMove: () => void;
    onIconChange?: (id: string, iconId: string, colorId: string) => void;
    // New Props for Bulk Selection
    selected?: boolean;
    onToggleSelect?: (id: string) => void;
    selectionMode?: boolean;
    // List View Props
    viewMode?: 'grid' | 'list';
    index?: number;
    totalCount?: number;
    onReorder?: (id: string, direction: 'up' | 'down') => void;
    // Drag-Drop Props
    onDragStart?: (e: React.DragEvent) => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDragEnd?: () => void;
    isDragging?: boolean;
}

export const DocumentCard = ({
    doc,
    onDelete,
    onDuplicate,
    onRename,
    onMove,
    onIconChange,
    selected = false,
    onToggleSelect,
    selectionMode = false,
    viewMode = 'grid',
    index = 0,
    totalCount = 0,
    onReorder,
    onDragStart: externalDragStart,
    onDragOver: externalDragOver,
    onDragEnd: externalDragEnd,
    isDragging = false
}: DocumentCardProps) => {

    // --- Topic Color Decoration ---
    const getTopicTheme = (topic?: string) => {
        switch (topic) {
            case 'พีชคณิต': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', light: 'bg-blue-100 dark:bg-blue-800' };
            case 'เรขาคณิต': return { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800', light: 'bg-green-100 dark:bg-green-800' };
            case 'สถิติและประมวลผลข้อมูล': return { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', light: 'bg-orange-100 dark:bg-orange-800' };
            case 'แคลคูลัส': return { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', light: 'bg-purple-100 dark:bg-purple-800' };
            case 'จำนวนและตัวเลข': return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', light: 'bg-yellow-100 dark:bg-yellow-800' };
            case 'การวัด': return { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800', light: 'bg-teal-100 dark:bg-teal-800' };
            default: return { bg: 'bg-gray-50 dark:bg-zinc-800', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-zinc-700', light: 'bg-gray-200 dark:bg-zinc-700' };
        }
    };

    const theme = getTopicTheme(doc.topic);

    // Add logic here
    const [showMenu, setShowMenu] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);

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

    const handleIconClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onIconChange) {
            setShowIconPicker(!showIconPicker);
        }
    };

    const handleIconSelect = (iconId: string, colorId: string) => {
        if (onIconChange) {
            onIconChange(doc.id, iconId, colorId);
        }
    };

    // Parse icon and color from doc.icon (format: "iconId:colorId")
    const [iconId, colorId] = (doc.icon || "file-text:blue").split(":");
    const IconComponent = getIconById(iconId);
    const iconColor = getColorById(colorId);

    // ========== LIST VIEW ==========
    if (viewMode === 'list') {
        return (
            <div
                draggable
                onDragStart={externalDragStart}
                onDragOver={externalDragOver}
                onDragEnd={externalDragEnd}
                className={`group relative bg-white dark:bg-zinc-900 border rounded-lg px-4 py-3 transition-all hover:shadow-md duration-200 cursor-grab active:cursor-grabbing
                    ${selected
                        ? 'border-rose-300 ring-2 ring-rose-300/20 bg-rose-50/50 dark:bg-rose-900/10'
                        : 'border-gray-200 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-800'
                    }
                    ${isDragging ? 'opacity-50 scale-95 shadow-lg' : ''}
                `}
            >
                <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <div className="text-gray-400 dark:text-gray-500">
                        <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Selection Checkbox */}
                    {onToggleSelect && (
                        <div
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleSelect(doc.id);
                            }}
                            className="cursor-pointer"
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected
                                ? 'bg-rose-500 border-rose-500 text-white'
                                : 'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 group-hover:border-rose-300'
                                }`}>{selected && <div className="w-2 h-2 bg-white rounded-full" />}</div>
                        </div>
                    )}

                    {/* Icon */}
                    <div
                        onClick={handleIconClick}
                        ref={iconRef}
                        className={`w-10 h-10 rounded-lg ${theme.bg} flex items-center justify-center shrink-0 cursor-pointer hover:opacity-80 transition-opacity`}
                    >
                        <IconComponent className={`w-5 h-5 ${theme.text}`} style={{ color: doc.icon ? iconColor.hex : undefined }} />
                    </div>

                    {/* Title */}
                    <Link href={`/editor/${doc.id}`} className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {doc.title || "ไม่มีชื่อเรื่อง"}
                        </h3>
                    </Link>

                    {/* Tags */}
                    <div className="hidden md:flex items-center gap-2 shrink-0">
                        {doc.topic && doc.topic !== "อื่นๆ" && (
                            <span className={`px-2 py-0.5 text-xs rounded-md font-medium border ${theme.bg} ${theme.text} ${theme.border}`}>
                                {doc.topic}
                            </span>
                        )}
                        {doc.classLevel && (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-xs rounded-md font-medium">
                                {doc.classLevel}
                            </span>
                        )}
                    </div>

                    {/* Timestamp */}
                    <div className="hidden lg:block text-xs text-gray-400 dark:text-gray-500 shrink-0 w-32 text-right">
                        {doc.updatedAt && !isNaN(new Date(doc.updatedAt).getTime())
                            ? formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true, locale: th })
                            : "เมื่อสักครู่"}
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (onReorder && index > 0) onReorder(doc.id, 'up');
                            }}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="ย้ายขึ้น"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (onReorder && index < totalCount - 1) onReorder(doc.id, 'down');
                            }}
                            disabled={index >= totalCount - 1}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="ย้ายลง"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Icon Picker (List View) */}
                    {showIconPicker && (
                        <div className="absolute top-12 left-14 z-50">
                            <DocumentIconPicker
                                currentIcon={iconId}
                                currentColor={colorId}
                                onSelect={handleIconSelect}
                                onClose={() => setShowIconPicker(false)}
                            />
                        </div>
                    )}

                    {/* Menu Button */}
                    <div className="relative shrink-0" ref={menuRef}>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
                        >
                            <MoreVertical className="w-4 h-4" />
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
            </div >
        );
    }

    // ========== GRID VIEW (Original) ==========
    return (
        <Link
            href={`/editor/${doc.id}`}
            draggable
            onDragStart={handleDragStart}
            className={`block group relative bg-white dark:bg-zinc-900 border rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-1 duration-200 cursor-grab active:cursor-grabbing
                ${selected
                    ? 'border-rose-300 ring-2 ring-rose-300/20 bg-rose-50/50 dark:bg-rose-900/10'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-800'
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

            {/* Icon / Visual Header (Updated) */}
            <div className={`relative h-28 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-xl transition-colors ${theme.bg} flex items-center justify-center group-hover:opacity-90`}>

                {/* Visual "Paper" Mockup */}
                <div
                    onClick={handleIconClick}
                    ref={iconRef}
                    className={`w-20 h-24 bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform duration-300 transform group-hover:scale-105 group-hover:-rotate-2 hover:!scale-110 hover:!rotate-0 hover:shadow-md relative z-10`}
                >
                    {/* Mini Lines to simulate text */}
                    <div className={`w-12 h-1 rounded-full opacity-30 ${theme.light}`}></div>
                    <div className={`w-14 h-1 rounded-full opacity-20 ${theme.light}`}></div>
                    <div className={`w-10 h-1 rounded-full opacity-20 ${theme.light}`}></div>

                    {/* The Icon */}
                    <IconComponent className={`w-8 h-8 ${theme.text} transition-colors`} style={{ color: doc.icon ? iconColor.hex : undefined }} />
                </div>

                {/* Decorative Elements */}
                <div className={`absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-50 ${theme.light} blur-2xl`}></div>
                <div className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-30 ${theme.light} blur-xl`}></div>
            </div>

            {/* Icon Picker - MOVED OUTSIDE overflow container */}
            {showIconPicker && (
                <div className="absolute top-32 left-1/2 -translate-x-1/2 z-50">
                    <DocumentIconPicker
                        currentIcon={iconId}
                        currentColor={colorId}
                        onSelect={handleIconSelect}
                        onClose={() => setShowIconPicker(false)}
                    />
                </div>
            )}

            {/* Menu Button (Floating on Top Right) */}
            <div className="absolute top-3 right-3 z-20" ref={menuRef}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="p-1.5 rounded-full bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black hover:shadow-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition backdrop-blur-sm"
                >
                    <MoreVertical className="w-4 h-4" />
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

            {/* Title & Info */}
            {/* Title & Info */}
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {(doc.title === "เอกสารใหม่" || !doc.title) && doc.topic && doc.topic !== "อื่นๆ"
                    ? <span className="text-gray-500 font-normal block text-sm mb-1">{doc.topic}</span>
                    : null
                }
                {doc.title || "ไม่มีชื่อเรื่อง"}
            </h3>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
                {doc.topic && doc.topic !== "อื่นๆ" && (
                    <span className={`px-2 py-0.5 text-xs rounded-md font-medium border ${theme.bg} ${theme.text} ${theme.border}`}>
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
        </Link >
    );
};
