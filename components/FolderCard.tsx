"use client";

import { Folder } from "@/types";
import { Folder as FolderIcon, MoreVertical, Trash2, Edit2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface FolderCardProps {
    folder: Folder;
    onClick: () => void;
    onDelete: (id: string) => void;
    onRename: (id: string, currentName: string) => void;
    onDropDocument?: (docId: string) => void;
}

export const FolderCard = ({ folder, onClick, onDelete, onRename, onDropDocument }: FolderCardProps) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
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

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (confirm(`คุณแน่ใจหรือไม่ที่จะลบโฟลเดอร์ "${folder.name}"?\n(เอกสารข้างในจะถูกย้ายออกมาที่หน้าหลัก)`)) {
            onDelete(folder.id);
        }
        setShowMenu(false);
    };

    const handleRename = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onRename(folder.id, folder.name);
        setShowMenu(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (onDropDocument) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const docId = e.dataTransfer.getData("docId");
        if (docId && onDropDocument) {
            // Prevent dropping into itself if we were dragging folders (not yet, but good practice)
            onDropDocument(docId);
        }
    };

    return (
        <div
            onClick={onClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer flex items-center gap-4 ${isDragOver ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30 scale-105 shadow-xl' : ''}`}
        >
            {/* Icon */}
            <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg flex items-center justify-center shrink-0">
                <FolderIcon className="w-5 h-5 fill-current" />
            </div>

            {/* Name */}
            <h3 title={folder.name} className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate flex-1 leading-tight">
                {folder.name}
            </h3>

            {/* Menu Button */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-gray-100 dark:border-zinc-800 z-20 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={handleRename}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            เปลี่ยนชื่อ
                        </button>
                        <button
                            onClick={handleDelete}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            ลบโฟลเดอร์
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
