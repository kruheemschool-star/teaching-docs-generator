"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, FolderOpen, FolderPlus, ChevronRight, Home, FileJson, Database } from 'lucide-react';
import { DocumentMetadata, Folder } from '@/types';
import {
  getAllDocuments,
  deleteDocument,
  createDocument,
  saveDocument,
  getDocument,
  getAllFolders,
  createFolder,
  deleteFolder,
  moveDocumentToFolder
} from '@/lib/storage';
import { DocumentCard } from '@/components/DocumentCard';
import { FolderCard } from '@/components/FolderCard';
import { MoveDocumentModal } from '@/components/MoveDocumentModal';
import { ImportJsonModal } from '@/components/ImportJsonModal';
import { BackupModal } from '@/components/BackupModal';

const LEGACY_STORAGE_KEY = 'teaching-docs-current-work';

const CLASS_LEVELS = ["ประถมศึกษา", "ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];
const SEMESTERS = [
  { value: "semester1", label: "เทอม 1" },
  { value: "semester2", label: "เทอม 2" }
];

export default function Dashboard() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterTerm, setFilterTerm] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const [moveModal, setMoveModal] = useState<{ isOpen: boolean; docId: string | null }>({ isOpen: false, docId: null });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Migration & Load logic
  useEffect(() => {
    // 1. Check for legacy work
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        if (parsed && parsed.documentMetadata) {
          // It's a valid doc, save it properly
          if (!parsed.documentMetadata.id) {
            parsed.documentMetadata.id = crypto.randomUUID();
            parsed.documentMetadata.updatedAt = new Date().toISOString();
          }
          saveDocument(parsed);
          localStorage.removeItem(LEGACY_STORAGE_KEY);
          console.log("Migrated legacy document");
        }
      } catch (e) {
        console.error("Migration failed", e);
      }
    }

    // 2. Load all data
    refreshData();
  }, []);

  const refreshData = () => {
    setDocuments(getAllDocuments());
    setFolders(getAllFolders());
  };

  const handleDelete = (id: string) => {
    deleteDocument(id);
    refreshData();
  };

  const handleRename = (id: string, currentTitle: string) => {
    const newTitle = prompt("กรุณาระบุชื่อเอกสารใหม่:", currentTitle);
    if (newTitle && newTitle.trim() !== "") {
      const doc = getDocument(id);
      if (doc) {
        doc.documentMetadata.title = newTitle.trim();
        saveDocument(doc);
        refreshData();
      }
    }
  };

  const handleDuplicate = (id: string) => {
    const doc = getDocument(id);
    if (doc) {
      const newDoc = { ...doc };
      newDoc.documentMetadata = {
        ...newDoc.documentMetadata,
        id: crypto.randomUUID(),
        title: `${newDoc.documentMetadata.title} (สำเนา)`,
        updatedAt: new Date().toISOString()
      };
      saveDocument(newDoc);
      refreshData();
    }
  };

  const handleCreateNew = () => {
    const newDoc = createDocument("เอกสารใหม่ (Untitled)", "ม.1", "เทอม 1");
    if (currentFolderId) {
      newDoc.documentMetadata.folderId = currentFolderId;
      saveDocument(newDoc);
    }
    router.push(`/editor/${newDoc.documentMetadata.id}`);
  };

  // --- Folder Handlers ---

  const handleCreateFolder = () => {
    const name = prompt("ตั้งชื่อโฟลเดอร์ใหม่:");
    if (name && name.trim()) {
      createFolder(name.trim());
      refreshData();
    }
  };

  const handleDeleteFolder = (id: string) => {
    deleteFolder(id);
    refreshData();
  };

  const handleRenameFolder = (id: string, currentName: string) => {
    alert("ขออภัย: ฟีเจอร์เปลี่ยนชื่อโฟลเดอร์กำลังมาเร็วๆ นี้");
  };

  const handleMoveRequest = (docId: string) => {
    setMoveModal({ isOpen: true, docId });
  };

  const handleMoveConfirm = (targetFolderId: string | null) => {
    if (moveModal.docId) {
      moveDocumentToFolder(moveModal.docId, targetFolderId);
      refreshData();
      setMoveModal({ isOpen: false, docId: null });
    }
  };

  const handleFileDrop = (docId: string, targetFolderId: string) => {
    moveDocumentToFolder(docId, targetFolderId);
    refreshData();
  };

  // Filter Logic
  const filteredDocs = documents.filter(doc => {
    // 1. Structure Filter (Folder)
    const inCurrentFolder = currentFolderId
      ? doc.folderId === currentFolderId
      : !doc.folderId; // null or undefined

    // 2. Search/Global Filters
    const matchesClass = filterClass === "all" || doc.classLevel === filterClass;
    const matchesTerm = filterTerm === "all" || doc.semester === filterTerm;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());

    return inCurrentFolder && matchesClass && matchesTerm && matchesSearch;
  }).sort((a, b) => {
    const dateA = new Date(a.updatedAt).getTime();
    const dateB = new Date(b.updatedAt).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const getCurrentFolder = () => folders.find(f => f.id === currentFolderId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-6 mb-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <button
              onClick={() => setCurrentFolderId(null)}
              className={`flex items-center gap-1 hover:text-blue-600 transition ${!currentFolderId ? 'text-blue-600 font-medium' : ''}`}
            >
              <Home className="w-4 h-4" />
              <span>หน้าหลัก</span>
            </button>

            {currentFolderId && getCurrentFolder() && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-black dark:text-white flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  {getCurrentFolder()?.name}
                </span>
              </>
            )}
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Dashboard
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setIsBackupModalOpen(true)}
                className="p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 rounded-xl transition shadow-sm"
                title="จัดการข้อมูล (Backup & Restore)"
              >
                <Database className="w-5 h-5" />
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium transition flex items-center gap-2"
              >
                <FolderPlus className="w-5 h-5" />
                <span className="hidden sm:inline">สร้างโฟลเดอร์</span>
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-500/30 flex items-center gap-2 transform hover:scale-105 active:scale-95"
              >
                <FileJson className="w-6 h-6" />
                <span>นำเข้า Code (Import)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white/80 dark:bg-zinc-900/80 p-2 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm sticky top-[70px] z-10 backdrop-blur-md transition-colors duration-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ค้นหาชื่อเอกสาร..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            />
          </div>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2 bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-sm text-gray-900 dark:text-gray-100"
          >
            <option value="all" className="bg-white dark:bg-zinc-900">ทุกระดับชั้น</option>
            {CLASS_LEVELS.map(l => <option key={l} value={l} className="bg-white dark:bg-zinc-900">{l}</option>)}
          </select>

          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="px-4 py-2 bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-sm text-gray-900 dark:text-gray-100"
          >
            <option value="all" className="bg-white dark:bg-zinc-900">ทุกเทอม</option>
            {SEMESTERS.map(s => <option key={s.value} value={s.value} className="bg-white dark:bg-zinc-900">{s.label}</option>)}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            className="px-4 py-2 bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            <option value="newest" className="bg-white dark:bg-zinc-900">🕒 ล่าสุดก่อน (Newest)</option>
            <option value="oldest" className="bg-white dark:bg-zinc-900">📅 เก่าสุดก่อน (Oldest)</option>
          </select>
        </div>

        {/* --- Folders Section (Only at Root) --- */}
        {!currentFolderId && folders.length > 0 && !searchQuery && (
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-1">
              โฟลเดอร์ ({folders.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {folders.map(folder => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onClick={() => setCurrentFolderId(folder.id)}
                  onDelete={handleDeleteFolder}
                  onRename={handleRenameFolder}
                  onDropDocument={(docId) => handleFileDrop(docId, folder.id)}
                />
              ))}
            </div>
            <div className="my-8 h-px bg-gray-200 dark:bg-zinc-800"></div>
          </div>
        )}

        {/* Grid */}
        <div className="mb-4 flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            เอกสาร ({filteredDocs.length})
          </h3>
        </div>

        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onRename={handleRename}
                onMove={() => handleMoveRequest(doc.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-800 transition-colors duration-200">
            <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">ไม่พบเอกสารในหน้านี้</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">เริ่มสร้างเอกสารใหม่ หรือใช้ AI ช่วยสร้างได้เลย</p>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-500/30 flex items-center gap-2 transform hover:scale-105 active:scale-95"
            >
              <FileJson className="w-6 h-6" />
              <span>นำเข้า Code (Import)</span>
            </button>
          </div>
        )}
      </main>

      {/* Move Modal */}
      <MoveDocumentModal
        isOpen={moveModal.isOpen}
        onClose={() => setMoveModal({ isOpen: false, docId: null })}
        folders={folders}
        currentFolderId={currentFolderId}
        onMove={handleMoveConfirm}
      />
      <ImportJsonModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={refreshData}
        currentFolderId={currentFolderId}
      />
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRestoreComplete={refreshData}
      />
    </div>
  );
}
