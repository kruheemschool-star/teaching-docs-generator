import React, { createContext, useContext, useState, useEffect } from 'react';

export type PinColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export interface Pin {
    id: string;
    documentId: string;
    sectionId: string;
    blockId?: string; // Optional, capable of pinning specific blocks
    title: string; // Display text for the pin
    color: PinColor;
    note?: string;
    createdAt: string;
}

interface PinContextType {
    pins: Pin[];
    addPin: (pin: Omit<Pin, 'id' | 'createdAt'>) => void;
    removePin: (id: string) => void;
    getPinsByDocument: (documentId: string) => Pin[];
    isPinned: (documentId: string, sectionId: string, blockId?: string) => boolean;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

export const PinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pins, setPins] = useState<Pin[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const savedPins = localStorage.getItem('teaching-docs-pins');
        if (savedPins) {
            try {
                setPins(JSON.parse(savedPins));
            } catch (e) {
                console.error("Failed to parse pins", e);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('teaching-docs-pins', JSON.stringify(pins));
    }, [pins]);

    const addPin = (pinData: Omit<Pin, 'id' | 'createdAt'>) => {
        const newPin: Pin = {
            ...pinData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };
        setPins(prev => [...prev, newPin]);
    };

    const removePin = (id: string) => {
        setPins(prev => prev.filter(p => p.id !== id));
    };

    const getPinsByDocument = (documentId: string) => {
        return pins.filter(p => p.documentId === documentId);
    };

    const isPinned = (documentId: string, sectionId: string, blockId?: string) => {
        return pins.some(p =>
            p.documentId === documentId &&
            p.sectionId === sectionId &&
            (blockId ? p.blockId === blockId : !p.blockId)
        );
    };

    return (
        <PinContext.Provider value={{ pins, addPin, removePin, getPinsByDocument, isPinned }}>
            {children}
        </PinContext.Provider>
    );
};

export const usePin = () => {
    const context = useContext(PinContext);
    if (!context) {
        throw new Error("usePin must be used within a PinProvider");
    }
    return context;
};
