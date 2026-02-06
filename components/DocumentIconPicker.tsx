"use client";

import { useState, useRef, useEffect } from "react";
import {
    FileText, BookOpen, GraduationCap, ClipboardList, PenTool,
    Calculator, Lightbulb, Target, FileQuestion, Sparkles,
    Rocket, Trophy, Star, Flame, Zap, Brain, Puzzle, Shapes,
    Check, LucideIcon
} from "lucide-react";

// Icon definitions with names
export const DOCUMENT_ICONS: { id: string; icon: LucideIcon; label: string }[] = [
    { id: "file-text", icon: FileText, label: "เอกสาร" },
    { id: "book-open", icon: BookOpen, label: "หนังสือ" },
    { id: "graduation-cap", icon: GraduationCap, label: "ข้อสอบ" },
    { id: "clipboard-list", icon: ClipboardList, label: "รายการ" },
    { id: "pen-tool", icon: PenTool, label: "ปากกา" },
    { id: "calculator", icon: Calculator, label: "เครื่องคิดเลข" },
    { id: "lightbulb", icon: Lightbulb, label: "ไอเดีย" },
    { id: "target", icon: Target, label: "เป้าหมาย" },
    { id: "file-question", icon: FileQuestion, label: "คำถาม" },
    { id: "sparkles", icon: Sparkles, label: "พิเศษ" },
    { id: "rocket", icon: Rocket, label: "จรวด" },
    { id: "trophy", icon: Trophy, label: "ถ้วยรางวัล" },
    { id: "star", icon: Star, label: "ดาว" },
    { id: "flame", icon: Flame, label: "ไฟ" },
    { id: "zap", icon: Zap, label: "สายฟ้า" },
    { id: "brain", icon: Brain, label: "สมอง" },
    { id: "puzzle", icon: Puzzle, label: "จิ๊กซอว์" },
    { id: "shapes", icon: Shapes, label: "รูปทรง" },
];

// Pastel Color Palette - Soft & Beautiful
export const ICON_COLORS: { id: string; hex: string; bg: string; label: string }[] = [
    { id: "sky", hex: "#7DD3FC", bg: "bg-sky-100 dark:bg-sky-900/30", label: "ฟ้าอ่อน" },
    { id: "rose", hex: "#FDA4AF", bg: "bg-rose-100 dark:bg-rose-900/30", label: "ชมพูกุหลาบ" },
    { id: "violet", hex: "#C4B5FD", bg: "bg-violet-100 dark:bg-violet-900/30", label: "ม่วงลาเวนเดอร์" },
    { id: "emerald", hex: "#6EE7B7", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: "เขียวมิ้นท์" },
    { id: "amber", hex: "#FCD34D", bg: "bg-amber-100 dark:bg-amber-900/30", label: "เหลืองพีช" },
    { id: "cyan", hex: "#67E8F9", bg: "bg-cyan-100 dark:bg-cyan-900/30", label: "ฟ้าน้ำทะเล" },
    { id: "fuchsia", hex: "#F0ABFC", bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30", label: "ชมพูบานเย็น" },
    { id: "lime", hex: "#BEF264", bg: "bg-lime-100 dark:bg-lime-900/30", label: "เขียวมะนาว" },
];

// Helper to get icon component by ID
export const getIconById = (iconId: string | undefined): LucideIcon => {
    const found = DOCUMENT_ICONS.find(i => i.id === iconId);
    return found ? found.icon : FileText;
};

// Helper to get color by ID
export const getColorById = (colorId: string | undefined) => {
    const found = ICON_COLORS.find(c => c.id === colorId);
    return found || ICON_COLORS[0]; // Default to blue
};

interface DocumentIconPickerProps {
    currentIcon?: string;
    currentColor?: string;
    onSelect: (iconId: string, colorId: string) => void;
    onClose: () => void;
}

export const DocumentIconPicker = ({
    currentIcon = "file-text",
    currentColor = "blue",
    onSelect,
    onClose
}: DocumentIconPickerProps) => {
    const [selectedIcon, setSelectedIcon] = useState(currentIcon);
    const [selectedColor, setSelectedColor] = useState(currentColor);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleIconClick = (e: React.MouseEvent, iconId: string) => {
        e.stopPropagation();
        e.preventDefault();
        setSelectedIcon(iconId);
        onSelect(iconId, selectedColor);
    };

    const handleColorClick = (e: React.MouseEvent, colorId: string) => {
        e.stopPropagation();
        e.preventDefault();
        setSelectedColor(colorId);
        onSelect(selectedIcon, colorId);
    };

    const color = getColorById(selectedColor);

    return (
        <div
            ref={pickerRef}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-4 w-[280px] animate-in fade-in zoom-in-95 duration-200"
        >
            {/* Header */}
            <div className="text-xs font-bold text-gray-400 uppercase mb-3">เลือกไอคอน</div>

            {/* Icon Grid */}
            <div className="grid grid-cols-6 gap-1.5 mb-4">
                {DOCUMENT_ICONS.map((item) => {
                    const IconComponent = item.icon;
                    const isSelected = selectedIcon === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={(e) => handleIconClick(e, item.id)}
                            title={item.label}
                            className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isSelected
                                ? `${color.bg} ring-2 ring-offset-1`
                                : "hover:bg-gray-100 dark:hover:bg-zinc-800"
                                }`}
                            style={isSelected ? { outlineColor: color.hex, boxShadow: `0 0 0 2px ${color.hex}` } : {}}
                        >
                            <IconComponent
                                className="w-5 h-5"
                                style={{ color: isSelected ? color.hex : "#9CA3AF" }}
                            />
                            {isSelected && (
                                <div
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: color.hex }}
                                >
                                    <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-zinc-800 my-3" />

            {/* Color Picker */}
            <div className="text-xs font-bold text-gray-400 uppercase mb-2">เลือกสี</div>
            <div className="flex gap-2">
                {ICON_COLORS.map((colorItem) => {
                    const isSelected = selectedColor === colorItem.id;
                    return (
                        <button
                            key={colorItem.id}
                            onClick={(e) => handleColorClick(e, colorItem.id)}
                            title={colorItem.label}
                            className={`w-8 h-8 rounded-full transition-all ${isSelected ? "ring-2 ring-offset-2 scale-110" : "hover:scale-105"
                                }`}
                            style={{
                                backgroundColor: colorItem.hex,
                                boxShadow: isSelected ? `0 0 0 2px white, 0 0 0 4px ${colorItem.hex}` : undefined
                            }}
                        >
                            {isSelected && (
                                <Check className="w-4 h-4 text-white mx-auto" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DocumentIconPicker;
