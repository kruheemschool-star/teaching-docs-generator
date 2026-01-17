"use client";

import { Folder } from "@/types";
import { Folder as FolderIcon, X } from "lucide-react";

interface MoveDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMove: (folderId: string | null) => void;
    folders: Folder[];
    currentFolderId: string | null;
}

export const MoveDocumentModal = ({ isOpen, onClose, onMove, folders, currentFolderId }: MoveDocumentModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">ย้ายเอกสารไปที่...</h3>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    <button
                        onClick={() => onMove(null)} // Move to Root
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${currentFolderId === null
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                            : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'}`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                            <FolderIcon className="w-4 h-4" />
                        </div>
                        หน้าหลัก (Home)
                    </button>

                    {folders.map(folder => (
                        <button
                            key={folder.id}
                            onClick={() => onMove(folder.id)}
                            disabled={folder.id === currentFolderId}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${folder.id === currentFolderId
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium cursor-default opacity-50'
                                : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'}`}
                        >
                            <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                                <FolderIcon className="w-4 h-4" />
                            </div>
                            {folder.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
