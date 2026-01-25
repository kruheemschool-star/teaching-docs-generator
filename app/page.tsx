"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FolderOpen, FolderPlus, ChevronRight, Home, FileJson, Database, CloudUpload, RefreshCw } from 'lucide-react';
import { DocumentMetadata, Folder } from '@/types';
import { DocumentCard } from '@/components/DocumentCard';
import { FolderCard } from '@/components/FolderCard';
import { MoveDocumentModal } from '@/components/MoveDocumentModal';
import { ImportJsonModal } from '@/components/ImportJsonModal';
import { BackupModal } from '@/components/BackupModal';

// New Firestore Hooks & Utils
import { useDocuments, useFolders } from '@/hooks/useFirestore';
import {
  createDocumentInFirestore,
  saveDocumentToFirestore,
  deleteDocumentFromFirestore,
  createFolderInFirestore,
  deleteFolderFromFirestore,
  moveDocumentInFirestore,
  migrateToFirestore,
  updateDocumentTitleInFirestore, // New
  duplicateDocumentInFirestore    // New
} from '@/lib/firestoreUtils';

const CLASS_LEVELS = ["ประถมศึกษา", "ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];
const SEMESTERS = [
  { value: "semester1", label: "เทอม 1" },
  { value: "semester2", label: "เทอม 2" }
];

export default function Dashboard() {
  const router = useRouter();

  // Real-time Data from Firestore
  const { documents, loading: docsLoading } = useDocuments();
  const { folders, loading: foldersLoading } = useFolders(); // You need to implement useFolders hook in @/hooks/useFirestore.ts if you haven't! I see I added it.

  // UI State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterTerm, setFilterTerm] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const [moveModal, setMoveModal] = useState<{ isOpen: boolean; docId: string | null }>({ isOpen: false, docId: null });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // --- Handlers using Firestore ---

  const handleMigration = async () => {
    if (!confirm("ยืนยันที่จะอัพโหลดข้อมูลทั้งหมดในเครื่องขึ้นสู่ Cloud?\n(ควรทำเพียงครั้งเดียวเพื่อย้ายข้อมูล)")) return;

    setMigrating(true);
    const result = await migrateToFirestore();
    setMigrating(false);

    if (result.success) {
      alert(`สำเร็จ! ย้ายข้อมูล ${result.count} รายการขึ้น Cloud เรียบร้อยแล้ว`);
    } else {
      alert("เกิดข้อผิดพลาดในการย้ายข้อมูล กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("ต้องการลบเอกสารนี้ใช่หรือไม่?")) {
      await deleteDocumentFromFirestore(id);
    }
  };

  const handleRename = async (id: string, currentTitle: string) => {
    const newTitle = prompt("กรุณาระบุชื่อเอกสารใหม่:", currentTitle);
    if (newTitle && newTitle.trim() !== "") {
      await updateDocumentTitleInFirestore(id, newTitle.trim());
    }
  };

  const handleDuplicate = async (id: string) => {
    const result = await duplicateDocumentInFirestore(id);
    if (!result) {
      alert("เกิดข้อผิดพลาดในการทำสำเนา");
    }
  };

  const handleCreateNew = async () => {
    // 1. Create directly in Firestore
    const newDoc = await createDocumentInFirestore("เอกสารใหม่ (Untitled)", "ม.1", "เทอม 1");

    if (newDoc) {
      if (currentFolderId) {
        // Move to folder immediately if needed, or update the obj before create?
        // Ideally createDocumentInFirestore should accept folderId.
        // But for now, let's just move it.
        await moveDocumentInFirestore(newDoc.documentMetadata.id, currentFolderId);
      }
      router.push(`/editor/${newDoc.documentMetadata.id}`);
    } else {
      alert("สร้างเอกสารล้มเหลว กรุณาตรวจสอบการเชื่อมต่อ");
    }
  };

  // --- Folder Handlers ---

  const handleCreateFolder = async () => {
    const name = prompt("ตั้งชื่อโฟลเดอร์ใหม่:");
    if (name && name.trim()) {
      await createFolderInFirestore(name.trim());
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (confirm("ต้องการลบโฟลเดอร์นี้และเนื้อหาภายในใช่หรือไม่?")) {
      await deleteFolderFromFirestore(id);
    }
  };

  const handleRenameFolder = (id: string, currentName: string) => {
    alert("ขออภัย: ฟีเจอร์เปลี่ยนชื่อโฟลเดอร์กำลังมาเร็วๆ นี้");
  };

  const handleMoveRequest = (docId: string) => {
    setMoveModal({ isOpen: true, docId });
  };

  const handleMoveConfirm = async (targetFolderId: string | null) => {
    if (moveModal.docId) {
      await moveDocumentInFirestore(moveModal.docId, targetFolderId);
      setMoveModal({ isOpen: false, docId: null });
    }
  };

  const handleFileDrop = async (docId: string, targetFolderId: string) => {
    await moveDocumentInFirestore(docId, targetFolderId);
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
  }); // Already sorted by hook

  const getCurrentFolder = () => folders.find(f => f.id === currentFolderId);

  const isLoading = docsLoading || foldersLoading;

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

          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2">
              Dashboard
              {isLoading && <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />}
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleMigration}
                disabled={migrating}
                className="px-4 py-3 bg-white dark:bg-zinc-800 border border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl font-medium transition flex items-center gap-2"
                title="อัพโหลดข้อมูลในเครื่องขึ้น Cloud"
              >
                {migrating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CloudUpload className="w-5 h-5" />}
                <span className="hidden sm:inline">Sync to Cloud</span>
              </button>
              {/*               
              <button
                onClick={() => setIsBackupModalOpen(true)}
                className="p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 rounded-xl transition shadow-sm"
                title="จัดการข้อมูล (Backup & Restore)"
              >
                <Database className="w-5 h-5" />
              </button> 
*/}
              <button
                onClick={handleCreateFolder}
                className="px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-xl font-medium transition flex items-center gap-2"
              >
                <FolderPlus className="w-5 h-5" />
                <span className="hidden sm:inline">สร้างโฟลเดอร์</span>
              </button>
              <button
                onClick={handleCreateNew} // Updated to creating new doc
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-500/30 flex items-center gap-2 transform hover:scale-105 active:scale-95"
              >
                <FolderPlus className="w-6 h-6" />
                <span>สร้างเอกสารใหม่</span>
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
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 max-w-lg w-full border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                  <span className="text-4xl">✨</span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  ยังไม่มีเอกสารที่นี่
                </h3>

                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                  เริ่มต้นสร้างสื่อการสอนชิ้นแรกของคุณได้ง่ายๆ<br />
                  ด้วยพลัง AI หรือเขียนเองตามใจชอบ
                </p>

                <button
                  onClick={handleCreateNew}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <div className="p-1 bg-white/20 rounded-lg">
                    <FolderPlus className="w-6 h-6" />
                  </div>
                  <span>เริ่มสร้างเอกสารชิ้นแรก</span>
                </button>
              </div>
            )}
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
        onImport={() => {
          // Refresh not needed with real-time listeners? 
          // If importing manually, we might need a way to push to firestore. 
          // The existing import probably saves to localStorage.
          // We should warn user.
          alert("ระบบ Import นี้ยังบันทึกรูปลงเครื่องอยู่ โปรดกด 'Sync to Cloud' หลังจาก Import เสร็จสิ้น");
        }}
        currentFolderId={currentFolderId}
      />
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRestoreComplete={() => { }}
      />
    </div>
  );
}
