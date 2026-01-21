import { useState } from 'react';
import { X, Download, Upload, Database, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { createBackup, restoreBackup, BackupData } from '@/lib/backup';

interface BackupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRestoreComplete: () => void;
}

export const BackupModal = ({ isOpen, onClose, onRestoreComplete }: BackupModalProps) => {
    const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
    const [jsonContent, setJsonContent] = useState('');
    const [restoreStatus, setRestoreStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    if (!isOpen) return null;

    const handleDownloadBackup = () => {
        const data = createBackup();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `teaching-docs-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRestore = () => {
        try {
            if (!jsonContent.trim()) {
                setRestoreStatus({ type: 'error', message: 'กรุณาวางโค้ดหรือเลือกไฟล์ JSON' });
                return;
            }

            const data: BackupData = JSON.parse(jsonContent);
            const result = restoreBackup(data);

            if (result.success) {
                setRestoreStatus({ type: 'success', message: `${result.message}` });
                onRestoreComplete();
                // Clear state after success
                setTimeout(() => {
                    onClose();
                    setRestoreStatus({ type: null, message: '' });
                    setJsonContent('');
                }, 2000);
            } else {
                setRestoreStatus({ type: 'error', message: result.message });
            }
        } catch (e: any) {
            setRestoreStatus({ type: 'error', message: 'ไฟล์ JSON ไม่ถูกต้อง หรือข้อมูลเสียหาย' });
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setJsonContent(event.target.result as string);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        จัดการข้อมูล (Backup & Restore)
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-zinc-800">
                    <button
                        onClick={() => setActiveTab('export')}
                        className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === 'export' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50 dark:bg-purple-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                    >
                        <Download className="w-4 h-4" /> ส่งออก (Export)
                    </button>
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === 'import' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                    >
                        <Upload className="w-4 h-4" /> นำเข้า (Import)
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto">

                    {activeTab === 'export' && (
                        <div className="space-y-6 text-center py-8">
                            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Database className="w-10 h-10 text-purple-600" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">สำรองข้อมูลทั้งหมด</h4>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                                    ดาวน์โหลดข้อมูลเอกสารและโฟลเดอร์ทั้งหมดลงเครื่องของคุณ เพื่อป้องกันข้อมูลหาย หรือนำไปใช้บนเครื่องอื่น
                                </p>
                                <button
                                    onClick={handleDownloadBackup}
                                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-purple-500/30 transition transform hover:-translate-y-1 flex items-center gap-2 mx-auto"
                                >
                                    <Download className="w-5 h-5" />
                                    ดาวน์โหลดไฟล์ Backup
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'import' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-4 text-sm text-blue-800 dark:text-blue-300">
                                <p className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>
                                        <b>คำเตือน:</b> การนำเข้าข้อมูลจะเพิ่มข้อมูลใหม่เข้าไป <br />
                                        หากมีเอกสารเดิมอยู่แล้ว ระบบจะเก็บไว้ ไม่ทับของเดิม (เว้นแต่จะแก้ไขชื่อหรือ ID ซ้ำกัน)
                                    </span>
                                </p>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-8 text-center bg-gray-50 dark:bg-zinc-900/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer relative">
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    accept=".json"
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                <p className="font-medium text-gray-700 dark:text-gray-300">คลิกเพื่อเลือกไฟล์ Backup (.json)</p>
                                <p className="text-xs text-gray-500 mt-1">หรือลากไฟล์มาวางที่นี่</p>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-zinc-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-zinc-900 px-2 text-gray-400">หรือวางโค้ด JSON</span>
                                </div>
                            </div>

                            <textarea
                                className="w-full h-32 p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder='Paste JSON content here...'
                                value={jsonContent}
                                onChange={(e) => setJsonContent(e.target.value)}
                            />

                            {restoreStatus.message && (
                                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${restoreStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {restoreStatus.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    {restoreStatus.message}
                                </div>
                            )}

                            <button
                                onClick={handleRestore}
                                disabled={!jsonContent.trim()}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                เริ่มกู้คืนข้อมูล
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
