import React, { useEffect } from 'react';
import { LessonSection, AnyBlock, DocumentMetadata } from '@/types';
import { BlockEditor, convertLessonToBlocks } from './BlockRenderer';
import { BookOpen, GraduationCap, Layout } from 'lucide-react';
import { RichText } from './RichText';

interface LessonRendererProps {
    section: LessonSection;
    isEditing?: boolean;
    showAnswers?: boolean;
    onUpdate?: (updatedSection: LessonSection) => void;
    fontSizeLevel?: number;
    metadata?: DocumentMetadata;
}

export const LessonRenderer: React.FC<LessonRendererProps> = ({ section, isEditing = false, showAnswers = false, onUpdate, fontSizeLevel = 0, metadata }) => {

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

    // Parse subtopic from title/metadata if possible, otherwise use what we have.
    // metadata.topic is usually "Chapter" or Main Topic
    // metadata.subtopic is not in interface, but let's assume section.title is the subtopic or specific lesson title.

    return (
        <div className={`mb-8 section-lesson ${section.pageBreakBefore ? 'break-before-page' : ''}`}>

            {/* Improved Header Styling */}
            <div className="mb-8 no-print">
                <div className="flex flex-col gap-3 items-start">
                    {/* Content Type Badge (Black Pill) */}
                    <span className="bg-black text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <BookOpen className="w-3.5 h-3.5" />
                        เนื้อหาบทเรียน (LESSON)
                    </span>

                    {/* Main Title & Metadata */}
                    <div className="w-full pb-4 border-b border-gray-200">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                {/* Context/breadcrumbs: Class - Subject - Chapter */}
                                <div className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                                    {metadata?.classLevel && <span>{metadata.classLevel}</span>}
                                    {metadata?.classLevel && metadata?.subjectType && <span className="w-1 h-1 rounded-full bg-gray-300"></span>}
                                    {metadata?.subjectType && <span>{metadata.subjectType}</span>}

                                    {(metadata?.classLevel || metadata?.subjectType) && (metadata?.topic || metadata?.subtopic) && <span className="text-gray-300">/</span>}

                                    {metadata?.topic && <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{metadata.topic}</span>}

                                    {metadata?.subtopic && metadata?.topic && <span className="text-gray-300">/</span>}
                                    {metadata?.subtopic && <span className="text-gray-600 font-medium">{metadata.subtopic}</span>}
                                </div>

                                {/* Section Title */}
                                <div className="text-2xl font-bold text-gray-900 leading-tight [&_.prose]:text-2xl [&_.prose]:font-bold [&_.prose_p]:text-2xl [&_.prose_p]:font-bold">
                                    <RichText content={section.title || "บทเรียน"} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
