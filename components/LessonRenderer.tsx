import React, { useEffect } from 'react';
import { LessonSection, AnyBlock } from '@/types';
import { BlockEditor, convertLessonToBlocks } from './BlockRenderer';

interface LessonRendererProps {
    section: LessonSection;
    isEditing?: boolean;
    showAnswers?: boolean;
    onUpdate?: (updatedSection: LessonSection) => void;
    fontSizeLevel?: number;
}

export const LessonRenderer: React.FC<LessonRendererProps> = ({ section, isEditing = false, showAnswers = false, onUpdate, fontSizeLevel = 0 }) => {

    // Auto-convert legacy content to blocks on mount if needed
    useEffect(() => {
        if ((!section.blocks || section.blocks.length === 0) && onUpdate) {
            const convertedBlocks = convertLessonToBlocks(section);
            // Only update if we actually generated blocks (avoid infinite loops if empty)
            if (convertedBlocks.length > 0) {
                onUpdate({
                    ...section,
                    blocks: convertedBlocks
                });
            }
        }
    }, [section.id]); // Only run once per section ID

    const handleBlocksChange = (newBlocks: AnyBlock[]) => {
        if (onUpdate) {
            onUpdate({
                ...section,
                blocks: newBlocks
            });
        }
    };

    const normalizeBlocks = (blocks: AnyBlock[]): AnyBlock[] => {
        return blocks.map(b => {
            // Support "page-break" from JSON as "pageBreak"
            if ((b.type as string) === 'page-break') {
                return { ...b, type: 'pageBreak' } as any;
            }
            return b;
        });
    };

    const rawBlocks = (section.blocks && section.blocks.length > 0)
        ? section.blocks
        : convertLessonToBlocks(section);

    const blocksToRender = normalizeBlocks(rawBlocks);

    return (
        <div className={`mb-8 section-lesson ${section.pageBreakBefore ? 'break-before-page' : ''}`}>
            {/* Title */}
            {section.title && (
                <h2 className="text-xl font-bold border-b-2 border-gray-800 pb-1 mb-4 no-print text-gray-400">
                    📖 {section.title} (Block Editor Mode)
                </h2>
            )}

            <div className="min-h-[200px]">
                <BlockEditor
                    blocks={blocksToRender}
                    isEditing={isEditing}
                    showAnswers={showAnswers}
                    onChange={handleBlocksChange}
                    fontSizeLevel={fontSizeLevel}
                />
            </div>
        </div>
    );
};
