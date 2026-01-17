import React from 'react';
import { CourseDocument, Section, HeaderFooterConfig, DEFAULT_HEADER_FOOTER_CONFIG } from '@/types';
import { LectureRenderer } from './LectureRenderer';
import { ExerciseRenderer } from './ExerciseRenderer';
import { ExamRenderer } from './ExamRenderer';
import { LessonRenderer } from './LessonRenderer';

interface DocumentPreviewProps {
    document: CourseDocument;
    showAnswers?: boolean;
    headerFooterConfig?: HeaderFooterConfig;
    isEditing?: boolean;
    onUpdateSection?: (sectionId: string, updatedSection: Section) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
    document,
    showAnswers = false,
    headerFooterConfig = DEFAULT_HEADER_FOOTER_CONFIG,
    isEditing = false,
    onUpdateSection
}) => {
    const { documentMetadata, sections } = document;
    const { header, footer } = headerFooterConfig;

    const renderSection = (section: Section, index: number) => {
        switch (section.type) {
            case 'lecture':
                return <LectureRenderer key={section.id || index} section={section} />;
            case 'lesson':
                return (
                    <LessonRenderer
                        key={section.id || index}
                        section={section}
                        isEditing={isEditing}
                        showAnswers={showAnswers}
                        onUpdate={(updatedSection) => onUpdateSection && onUpdateSection(section.id, updatedSection)}
                    />
                );
            case 'exercise':
                return <ExerciseRenderer key={section.id || index} section={section} showAnswers={showAnswers} />;
            case 'exam':
                return <ExamRenderer key={section.id || index} section={section} showAnswers={showAnswers} />;
            default:
                return null;
        }
    };

    return (
        <div className="a4-paper bg-white text-black">
            {/* Screen Header */}
            {header.enabled && (
                <header className="mb-12 border-b-2 border-black pb-8 no-print">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-6">
                            {header.logoUrl && (
                                <img
                                    src={header.logoUrl}
                                    alt="Logo"
                                    className="w-16 h-16 object-contain"
                                />
                            )}
                            <div className="space-y-2">
                                {header.schoolName && (
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{header.schoolName}</p>
                                )}
                                {header.showTitle && (
                                    <h1 className="text-4xl font-extrabold uppercase tracking-tight leading-tight">{documentMetadata.title}</h1>
                                )}
                                {documentMetadata.subtitle && (
                                    <p className="text-xl text-gray-600 font-light">{documentMetadata.subtitle}</p>
                                )}
                                {header.customText && (
                                    <p className="text-sm text-gray-500 border-l-2 border-gray-300 pl-3 italic">{header.customText}</p>
                                )}
                            </div>
                        </div>
                        <div className="text-right text-sm text-gray-500 space-y-1">
                            {header.showInstructor && documentMetadata.instructor && (
                                <div>
                                    <span className="block text-xs uppercase text-gray-400 font-bold tracking-widest">Instructor</span>
                                    <p className="font-semibold text-gray-800 text-base">{documentMetadata.instructor}</p>
                                </div>
                            )}
                            {header.showDate && documentMetadata.date && (
                                <p className="pt-2">{documentMetadata.date}</p>
                            )}
                        </div>
                    </div>
                </header>
            )}

            {/* Print Header (repeats on each page) */}
            {header.enabled && (
                <div className="print-header-fixed hidden print:flex">
                    <div className="w-full flex justify-between items-center text-sm border-b border-gray-300 pb-2">
                        <div className="flex items-center gap-2">
                            {header.logoUrl && (
                                <img src={header.logoUrl} alt="" className="w-8 h-8 object-contain" />
                            )}
                            <div>
                                {header.schoolName && (
                                    <span className="text-xs text-gray-500 block">{header.schoolName}</span>
                                )}
                                {header.showTitle && (
                                    <span className="font-bold uppercase">{documentMetadata.title}</span>
                                )}
                            </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                            {header.showInstructor && documentMetadata.instructor && (
                                <span className="block">{documentMetadata.instructor}</span>
                            )}
                            {header.showDate && documentMetadata.date && (
                                <span>{documentMetadata.date}</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Print Footer (repeats on each page) */}
            {footer.enabled && (
                <div className="print-footer-fixed hidden print:flex">
                    <div className="w-full flex justify-between items-center text-xs border-t border-gray-200 pt-2">
                        <span className="text-gray-500">{footer.leftText || ""}</span>
                        <span className="text-gray-500">{footer.centerText || ""}</span>
                        <span className="text-gray-500">
                            {footer.rightText || ""}
                            {footer.showPageNumber && (
                                <span className="font-bold ml-2">หน้า <span className="page-number"></span></span>
                            )}
                        </span>
                    </div>
                </div>
            )}

            {/* Content */}
            <main>
                {sections.map(renderSection)}
            </main>

            {/* Screen Footer */}
            {footer.enabled && (
                <footer className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400 no-print">
                    <div className="flex justify-between items-center">
                        <span>{footer.leftText || ""}</span>
                        <span>{footer.centerText || "Generated by Teaching Docs Generator"}</span>
                        <span>{footer.rightText || ""}</span>
                    </div>
                </footer>
            )}

            {/* A4 Page Guides (Visual Check) - Only visible on screen, not print */}
            <div className="absolute top-0 left-0 w-full pointer-events-none z-50 no-print" style={{ height: '100%' }}>
                {/* 
                   A4 Height is 297mm. 
                   We will generate lines every 297mm to show where pages break.
                   We'll just create a repeated background pattern or a few absolute divs.
                   CSS repetition is easiest.
                */}
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: 'linear-gradient(to bottom, transparent 296mm, red 297mm)',
                        backgroundSize: '100% 297mm',
                        opacity: 0.5
                    }}
                />
            </div>
        </div>
    );
};
