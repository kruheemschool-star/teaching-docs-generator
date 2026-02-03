"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FolderOpen, FolderPlus, ChevronRight, Home, RefreshCw, X, Trash2, Tent, CloudUpload, ArrowUpCircle, HardDrive } from 'lucide-react';
import { DocumentMetadata, Folder } from '@/types';
import { DocumentCard } from '@/components/DocumentCard';
import { FolderCard } from '@/components/FolderCard';
import { MoveDocumentModal } from '@/components/MoveDocumentModal';
import { ImportJsonModal } from '@/components/ImportJsonModal';
import { BackupModal } from '@/components/BackupModal';
import { LocalDataManager } from '@/components/LocalDataManager';
import FirestoreDebug from '@/components/FirestoreDebug';

// Local Storage Utils (Only for Migration check)
import { getAllDocuments as getLocalDocuments } from '@/lib/storage';

// New Firestore Hooks & Utils
import { useDocuments, useFolders } from '@/hooks/useFirestore';
import {
  saveDocumentToFirestore,
  createDocumentInFirestore,
  deleteDocumentFromFirestore,
  createFolderInFirestore,
  deleteFolderFromFirestore,
  moveDocumentInFirestore,
  updateDocumentTitleInFirestore,
  duplicateDocumentInFirestore,
  migrateToFirestore,
  updateFolderIconInFirestore
} from '@/lib/firestoreUtils';

const CLASS_LEVELS = ["ประถมศึกษา", "ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6", "สอบเข้า ม.1"];
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

export default function Dashboard() {
  const router = useRouter();

  // Real-time Data from Firestore
  const { documents, loading: docsLoading, error: docsError } = useDocuments();
  const { folders, loading: foldersLoading, error: foldersError } = useFolders();

  const isLoading = docsLoading || foldersLoading;
  const error = docsError || foldersError;

  // Local State
  const [isSyncing, setIsSyncing] = useState(false);
  const [localDocCount, setLocalDocCount] = useState(0);

  // UI State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterTerm, setFilterTerm] = useState<string>("all");
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [moveModal, setMoveModal] = useState<{ isOpen: boolean; docId: string | null }>({ isOpen: false, docId: null });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isLocalManagerOpen, setIsLocalManagerOpen] = useState(false);

  // Bulk Selection State
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const selectionMode = selectedDocIds.size > 0;

  // Check for local documents for migration suggestion
  useEffect(() => {
    // Check if we have local data that isn't in cloud (mock check: just check existence)
    const local = getLocalDocuments();
    setLocalDocCount(local.length);
  }, []);

  // Sync/Migrate Logic
  const handleMigrate = async () => {
    if (!confirm(`พบเอกสารในเครื่อง ${localDocCount} รายการ ยืนยันที่จะย้ายขึ้น Cloud ทั้งหมด?`)) return;
    setIsSyncing(true);
    try {
      const result = await migrateToFirestore();
      if (result.success) {
        alert(`ย้ายข้อมูลสำเร็จ ${result.count} รายการ`);
        // Optional: clear local storage after success?
        // localStorage.clear(); 
        setLocalDocCount(0);
      } else {
        alert("เกิดข้อผิดพลาดในการย้ายข้อมูล");
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการย้ายข้อมูล");
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedDocIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDocIds(newSelected);
  };

  const clearSelection = () => {
    setSelectedDocIds(new Set());
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedDocIds);
    if (!confirm(`ต้องการลบเอกสาร ${idsToDelete.length} รายการใช่หรือไม่?`)) return;

    // Execute deletes in parallel
    await Promise.all(idsToDelete.map(id => deleteDocumentFromFirestore(id)));
    clearSelection();
  };

  // --- Handlers (Firestore Only) ---

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
    // Optimistic loading or just wait for firestore
    const result = await duplicateDocumentInFirestore(id);
    if (!result) {
      alert("เกิดข้อผิดพลาดในการทำสำเนา");
    }
  };

  const handleCreateNew = async () => {
    // Attempt to get a topic context
    const defaultTopic = filterTopic !== "all" ? filterTopic : "อื่นๆ";

    // Optional: Ask for Topic/Title upfront
    // const title = prompt("ตั้งชื่อเอกสาร (หรือกด OK เพื่อใช้ชื่ออัตโนมัติ):", "เอกสารการสอน");
    // if (title === null) return; // Cancelled

    // Smart Title Generation based on context logic
    let initialTitle = "เอกสารใหม่";
    if (filterTopic !== "all") {
      initialTitle = `เอกสาร${filterTopic}`;
    } else if (filterClass !== "all") {
      initialTitle = `เอกสาร ${filterClass}`;
    }

    const newDoc = await createDocumentInFirestore(
      initialTitle, // title
      filterClass !== "all" ? filterClass : "ม.1", // classLevel
      filterTerm !== "all" ? filterTerm : "เทอม 1", // semester
      defaultTopic // topic
    );

    if (newDoc) {
      // If we are in a folder, move it there
      if (currentFolderId) {
        await moveDocumentInFirestore(newDoc.documentMetadata.id, currentFolderId);
      }

      // OPTIONAL: If we want to rename it immediately to the topic if it's specific?
      // But the user said "even if we didn't name it... show the chapter name".
      // Our updated DocumentCard calculates the badge from metadata.topic. 
      // So ensuring 'topic' is set correctly is key.

      router.push(`/editor/${newDoc.documentMetadata.id}`);
    } else {
      alert("สร้างเอกสารล้มเหลว");
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

  const handleUpdateFolderIcon = async (id: string, icon: string) => {
    await updateFolderIconInFirestore(id, icon);
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
    const matchesTopic = filterTopic === "all" || (doc.topic === filterTopic);
    const matchesSearch = (doc.title || "").toLowerCase().includes(searchQuery.toLowerCase());

    return inCurrentFolder && matchesClass && matchesTerm && matchesTopic && matchesSearch;
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

          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-3">
                <Tent className="w-8 h-8 text-orange-500" />
                Base Camp
                {isLoading && <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />}
              </h2>
              {/* Cloud Status Indicator */}
              <div className={`px-2 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${!isLoading ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                <div className={`w-2 h-2 rounded-full ${!isLoading ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                {isLoading ? 'Syncing...' : 'Cloud Active'}
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm max-w-md animate-in slide-in-from-top-2">
                <Trash2 className="w-4 h-4" /> {/* Reuse existing icon or AlertCircle if available */}
                <span>{error} (ตรวจสอบ internet หรือ Console)</span>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap gap-3">

              {/* Migration Action - Show if local docs exist */}
              {/* Migration / Local Data Action */}
              {localDocCount > 0 && (
                <button
                  onClick={() => setIsLocalManagerOpen(true)}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-bold transition shadow-sm flex items-center gap-2 text-sm animate-pulse"
                  title="จัดการไฟล์ที่ค้างในเครื่อง"
                >
                  <HardDrive className="w-4 h-4" />
                  <span className="hidden sm:inline">Offline Files ({localDocCount})</span>
                </button>
              )}

              <button
                onClick={handleCreateFolder}
                className="px-4 py-2.5 bg-transparent border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition flex items-center gap-2 text-sm"
              >
                <FolderPlus className="w-4 h-4" />
                <span className="hidden sm:inline">สร้างโฟลเดอร์</span>
              </button>

              <button
                onClick={handleCreateNew}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-sm shadow-blue-500/30 flex items-center gap-2 text-sm"
              >
                <FolderPlus className="w-4 h-4" />
                <span>สร้างเอกสาร</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters - Hide on True Empty State */}
        {documents.length > 0 && (
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
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="px-4 py-2 bg-transparent border border-gray-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer text-sm text-gray-900 dark:text-gray-100"
            >
              <option value="all" className="bg-white dark:bg-zinc-900">ทุกหมวดหมู่</option>
              {TOPICS.map(t => (
                <option key={t} value={t} className="bg-white dark:bg-zinc-900">{t}</option>
              ))}
            </select>
          </div>
        )}

        <LocalDataManager
          isOpen={isLocalManagerOpen}
          onClose={() => setIsLocalManagerOpen(false)}
          onDataChanged={() => {
            const local = getLocalDocuments();
            setLocalDocCount(local.length);
          }}
        />

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
                  onIconChange={handleUpdateFolderIcon}
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
                selected={selectedDocIds.has(doc.id)}
                onToggleSelect={toggleSelection}
                selectionMode={selectionMode}
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
              <div className="flex flex-col items-center max-w-md mx-auto">
                {/* Minimalist Line Art Illustration */}
                <div className="mb-8 opacity-90">
                  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-blue-200 dark:stroke-indigo-900/50">
                    <path d="M40 60C40 54.4772 44.4772 50 50 50H150C155.523 50 160 54.4772 160 60V160C160 165.523 155.523 170 150 170H50C44.4772 170 40 165.523 40 160V60Z" strokeWidth="2" strokeLinecap="round" />
                    <path d="M70 50V170" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M40 90H160" strokeWidth="2" strokeOpacity="0.5" />
                    <path d="M40 110H160" strokeWidth="2" strokeOpacity="0.5" />
                    <path d="M40 130H160" strokeWidth="2" strokeOpacity="0.5" />

                    {/* Pencil/Ruler Element */}
                    <path d="M80 80L120 120" strokeWidth="2" strokeLinecap="round" />
                    <path d="M120 80L80 120" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="100" cy="100" r="10" strokeWidth="2" />

                    {/* Decorative Geometric Elements */}
                    <path d="M160 30L170 40L160 50" strokeWidth="2" strokeLinecap="round" className="stroke-indigo-300 dark:stroke-indigo-700" />
                    <circle cx="30" cy="160" r="5" strokeWidth="2" className="stroke-blue-300 dark:stroke-blue-700" />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  ยังไม่มีวิชาโปรดของคุณที่นี่
                </h3>

                <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
                  {localDocCount > 0
                    ? "แต่เราพบข้อมูลในเครื่องของคุณ กดปุ่ม Migrate ด้านบนเพื่อย้ายข้อมูลมาได้เลย!"
                    : "เริ่มสร้างเอกสารแรกเพื่อเปลี่ยนโจทย์ยากให้เป็นเรื่องง่ายกันเลย!"
                  }
                </p>

                <button
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                >
                  <FolderPlus className="w-5 h-5" />
                  <span>เริ่มสร้างเอกสารแรก</span>
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
          // Re-check local docs to urge migration
          const local = getLocalDocuments();
          setLocalDocCount(local.length);
        }}
        currentFolderId={currentFolderId}
      />
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRestoreComplete={() => {
          // Re-check local docs to urge migration
          const local = getLocalDocuments();
          setLocalDocCount(local.length);
        }}
      />

      {/* Bulk Action Bar */}
      {selectionMode && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-4 border-r border-gray-200 dark:border-zinc-800 pr-6">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
              {selectedDocIds.size}
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">เลือกแล้ว</span>
          </div>

          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl transition font-medium"
          >
            <Trash2 className="w-5 h-5" />
            <span>ลบที่เลือก</span>
          </button>

          <button
            onClick={clearSelection}
            className="p-2 ml-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {/* Debug Tool */}
      <FirestoreDebug />
    </div>
  );
}
