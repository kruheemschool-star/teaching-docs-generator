import React, { useState, useRef, useEffect } from 'react';
import { PinColor, usePin } from '@/contexts/PinContext';
import { Bookmark, MapPin, X } from 'lucide-react';

interface PinButtonProps {
    documentId: string;
    sectionId: string;
    blockId?: string;
    title: string; // Context title (e.g. section name)
    className?: string;
}

const PIN_COLORS: { value: PinColor; label: string; bg: string; text: string }[] = [
    { value: 'red', label: 'สำคัญมาก', bg: 'bg-red-500', text: 'text-red-600' },
    { value: 'blue', label: 'อ่านค้างไว้', bg: 'bg-blue-500', text: 'text-blue-600' },
    { value: 'green', label: 'เข้าใจแล้ว', bg: 'bg-green-500', text: 'text-green-600' },
    { value: 'yellow', label: 'ทบทวน', bg: 'bg-yellow-400', text: 'text-yellow-600' },
    { value: 'purple', label: 'ไอเดีย', bg: 'bg-purple-500', text: 'text-purple-600' },
];

export const PinButton: React.FC<PinButtonProps> = ({ documentId, sectionId, blockId, title, className = '' }) => {
    const { addPin, removePin, pins } = usePin();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Check if pinned
    const existingPin = pins.find(p =>
        p.documentId === documentId &&
        p.sectionId === sectionId &&
        (blockId ? p.blockId === blockId : !p.blockId)
    );

    const isPinned = !!existingPin;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePin = (color: PinColor) => {
        addPin({
            documentId,
            sectionId,
            blockId,
            title,
            color
        });
        setIsOpen(false);
    };

    const handleRemove = () => {
        if (existingPin) {
            removePin(existingPin.id);
        }
    };

    const currentColor = existingPin ? PIN_COLORS.find(c => c.value === existingPin.color) : null;

    const wrapperClass = isPinned
        ? className.replace('opacity-0', 'opacity-100') // Force visible if pinned
        : className;

    return (
        <div className={`relative inline-block no-print ${wrapperClass}`} ref={menuRef}>
            {/* Toggle Button */}
            <button
                onClick={() => isPinned ? handleRemove() : setIsOpen(!isOpen)}
                className={`p-1.5 rounded-full transition-all duration-200 flex items-center justify-center
                    ${isPinned
                        ? `${currentColor?.text} bg-white shadow-sm ring-1 ring-black/5 hover:bg-gray-50`
                        : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'
                    }`}
                title={isPinned ? "Unpin contents" : "Pin contents"}
            >
                <MapPin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
            </button>

            {/* Color Selection Menu */}
            {isOpen && !isPinned && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-xl border border-gray-100 ring-1 ring-black/5 z-50 animate-in fade-in zoom-in duration-200 min-w-[140px]">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">เลือกประเภทหมุด</div>
                    <div className="flex flex-col gap-1">
                        {PIN_COLORS.map((c) => (
                            <button
                                key={c.value}
                                onClick={() => handlePin(c.value)}
                                className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 rounded-md text-left transition-colors group"
                            >
                                <div className={`w-3 h-3 rounded-full ${c.bg} ring-1 ring-inset ring-black/10 group-hover:scale-110 transition-transform`}></div>
                                <span className="text-xs text-gray-600 font-medium group-hover:text-black">{c.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
