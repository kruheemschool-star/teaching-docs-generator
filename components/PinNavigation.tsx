import React from 'react';
import { usePin, PinColor } from '@/contexts/PinContext';
import { MapPin, Trash2, ExternalLink } from 'lucide-react';

interface PinNavigationProps {
    documentId: string;
}

const PIN_COLORS: { value: PinColor; bg: string; border: string; text: string }[] = [
    { value: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    { value: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    { value: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    { value: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    { value: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
];

export const PinNavigation: React.FC<PinNavigationProps> = ({ documentId }) => {
    const { getPinsByDocument, removePin } = usePin();
    const pins = getPinsByDocument(documentId);

    if (pins.length === 0) return null;

    const handleScrollTo = (sectionId: string, blockId?: string) => {
        // Determine target ID (block takes precedence)
        const targetId = blockId || sectionId;

        // Wait for potential render updates
        setTimeout(() => {
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Highlight effect
                element.classList.add('ring-2', 'ring-offset-2', 'ring-blue-400', 'transition-all', 'duration-500');
                setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-400');
                }, 2000);
            } else {
                console.warn(`Element with ID ${targetId} not found.`);
            }
        }, 100);
    };

    return (
        <div className="fixed right-6 top-24 z-40 w-64 hidden xl:block animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-black" />
                        Pins ({pins.length})
                    </h3>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                    {pins.map(pin => {
                        const style = PIN_COLORS.find(c => c.value === pin.color);
                        return (
                            <div
                                key={pin.id}
                                className={`group p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer relative ${style?.bg || 'bg-gray-50'} ${style?.border || 'border-gray-200'}`}
                                onClick={() => handleScrollTo(pin.sectionId, pin.blockId)}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold truncate mb-0.5 ${style?.text || 'text-gray-700'}`}>
                                            {pin.title}
                                        </p>
                                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                            {new Date(pin.createdAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); removePin(pin.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/50 rounded text-gray-400 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
