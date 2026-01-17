"use client";

import React, { useState } from "react";
import { HeaderFooterConfig, DEFAULT_HEADER_FOOTER_CONFIG } from "@/types";
import { X, Settings } from "lucide-react";

interface HeaderFooterSettingsProps {
    config: HeaderFooterConfig;
    onSave: (config: HeaderFooterConfig) => void;
    onClose: () => void;
}

export const HeaderFooterSettings: React.FC<HeaderFooterSettingsProps> = ({
    config,
    onSave,
    onClose,
}) => {
    const [localConfig, setLocalConfig] = useState<HeaderFooterConfig>(config);

    const updateHeader = (updates: Partial<typeof config.header>) => {
        setLocalConfig((prev) => ({
            ...prev,
            header: { ...prev.header, ...updates },
        }));
    };

    const updateFooter = (updates: Partial<typeof config.footer>) => {
        setLocalConfig((prev) => ({
            ...prev,
            footer: { ...prev.footer, ...updates },
        }));
    };

    const handleSave = () => {
        onSave(localConfig);
        onClose();
    };

    const handleReset = () => {
        setLocalConfig(DEFAULT_HEADER_FOOTER_CONFIG);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-zinc-800 transition-colors duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h2 className="text-xl font-bold text-black dark:text-white">ตั้งค่าหัวกระดาษ/ท้ายกระดาษ</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Font Settings Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                🅰️ รูปแบบตัวอักษร (Font)
                            </h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-4 border border-gray-200 dark:border-zinc-700">
                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    เลือกฟอนต์
                                </label>
                                <select
                                    value={localConfig.fontFamily || 'sarabun'}
                                    onChange={(e) => setLocalConfig({ ...localConfig, fontFamily: e.target.value as any })}
                                    className="w-full border border-gray-200 dark:border-zinc-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="sarabun">Sarabun (ทางการ - แนะนำ)</option>
                                    <option value="mali">Mali (ลายมือเด็ก - น่ารัก)</option>
                                    <option value="chakra">Chakra Petch (ทันสมัย - Techno)</option>
                                    <option value="niramit">Niramit (หัวข้อข่าว - ร่วมสมัย)</option>
                                    <option value="charm">Charm (ตัวเขียน - หรูหรา)</option>
                                </select>
                                <label className="flex items-center gap-2 pt-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localConfig.forceStandardFont || false}
                                        onChange={(e) => setLocalConfig({ ...localConfig, forceStandardFont: e.target.checked })}
                                        className="w-4 h-4 accent-black dark:accent-white"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">คงรูปแบบหัว/ท้ายกระดาษเป็นแบบทางการ (Sarabun)</span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Header Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                📄 หัวกระดาษ (Header)
                            </h3>
                            <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-gray-100">
                                <input
                                    type="checkbox"
                                    checked={localConfig.header.enabled}
                                    onChange={(e) => updateHeader({ enabled: e.target.checked })}
                                    className="w-5 h-5 accent-black dark:accent-white"
                                />
                                <span className="text-sm font-medium">เปิดใช้งาน</span>
                            </label>
                        </div>

                        {localConfig.header.enabled && (
                            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-4 space-y-4 border border-gray-200 dark:border-zinc-700">
                                {/* School Name */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        ชื่อโรงเรียน/สถาบัน
                                    </label>
                                    <input
                                        type="text"
                                        value={localConfig.header.schoolName || ""}
                                        onChange={(e) => updateHeader({ schoolName: e.target.value })}
                                        placeholder="เช่น โรงเรียนสาธิต มหาวิทยาลัย..."
                                        className="w-full border border-gray-200 dark:border-zinc-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                </div>

                                {/* Logo URL */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        URL โลโก้ (ถ้ามี)
                                    </label>
                                    <input
                                        type="text"
                                        value={localConfig.header.logoUrl || ""}
                                        onChange={(e) => updateHeader({ logoUrl: e.target.value })}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full border border-gray-200 dark:border-zinc-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                </div>

                                {/* Custom Text */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        ข้อความเพิ่มเติม
                                    </label>
                                    <input
                                        type="text"
                                        value={localConfig.header.customText || ""}
                                        onChange={(e) => updateHeader({ customText: e.target.value })}
                                        placeholder="เช่น กลุ่มสาระการเรียนรู้คณิตศาสตร์"
                                        className="w-full border border-gray-200 dark:border-zinc-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    />
                                </div>

                                {/* Checkboxes */}
                                <div className="grid grid-cols-3 gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white dark:hover:bg-zinc-700 transition text-gray-700 dark:text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={localConfig.header.showTitle}
                                            onChange={(e) => updateHeader({ showTitle: e.target.checked })}
                                            className="w-4 h-4 accent-black dark:accent-white"
                                        />
                                        <span className="text-sm">แสดงหัวข้อ</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white dark:hover:bg-zinc-700 transition text-gray-700 dark:text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={localConfig.header.showDate}
                                            onChange={(e) => updateHeader({ showDate: e.target.checked })}
                                            className="w-4 h-4 accent-black dark:accent-white"
                                        />
                                        <span className="text-sm">แสดงวันที่</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white dark:hover:bg-zinc-700 transition text-gray-700 dark:text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={localConfig.header.showInstructor}
                                            onChange={(e) => updateHeader({ showInstructor: e.target.checked })}
                                            className="w-4 h-4 accent-black dark:accent-white"
                                        />
                                        <span className="text-sm">แสดงชื่อครู</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Footer Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                📝 ท้ายกระดาษ (Footer)
                            </h3>
                            <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-gray-100">
                                <input
                                    type="checkbox"
                                    checked={localConfig.footer.enabled}
                                    onChange={(e) => updateFooter({ enabled: e.target.checked })}
                                    className="w-5 h-5 accent-black dark:accent-white"
                                />
                                <span className="text-sm font-medium">เปิดใช้งาน</span>
                            </label>
                        </div>

                        {localConfig.footer.enabled && (
                            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-4 space-y-4 border border-gray-200 dark:border-zinc-700">
                                {/* Page Number */}
                                <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={localConfig.footer.showPageNumber}
                                        onChange={(e) => updateFooter({ showPageNumber: e.target.checked })}
                                        className="w-5 h-5 accent-black dark:accent-white"
                                    />
                                    <span className="font-medium">แสดงเลขหน้า</span>
                                </label>

                                {/* Footer Texts */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">ข้อความซ้าย</label>
                                        <input
                                            type="text"
                                            value={localConfig.footer.leftText || ""}
                                            onChange={(e) => updateFooter({ leftText: e.target.value })}
                                            placeholder="เช่น ชื่อโรงเรียน"
                                            className="w-full border border-gray-200 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">ข้อความกลาง</label>
                                        <input
                                            type="text"
                                            value={localConfig.footer.centerText || ""}
                                            onChange={(e) => updateFooter({ centerText: e.target.value })}
                                            placeholder="เช่น ข้อสอบกลางภาค"
                                            className="w-full border border-gray-200 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">ข้อความขวา</label>
                                        <input
                                            type="text"
                                            value={localConfig.footer.rightText || ""}
                                            onChange={(e) => updateFooter({ rightText: e.target.value })}
                                            placeholder="เช่น ภาคเรียนที่ 1"
                                            className="w-full border border-gray-200 dark:border-zinc-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 px-6 py-4 flex justify-between rounded-b-xl z-10">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition font-medium"
                    >
                        รีเซ็ตค่าเริ่มต้น
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition font-medium"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition font-bold"
                        >
                            บันทึก
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
