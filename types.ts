export type SectionType = 'lecture' | 'exercise' | 'exam' | 'lesson';

export interface Folder {
    id: string;
    name: string;
    createdAt: string;
    icon?: string; // New: Emoji icon
}

export interface DocumentMetadata {
    id: string; // Unique ID for file management
    folderId?: string | null; // Folder ID this document belongs to
    title: string;
    subtitle?: string;
    classLevel?: string; // e.g., "ม.1"
    semester?: string; // e.g., "เทอม 1"
    subjectType?: string; // e.g., "พื้นฐาน"
    instructor?: string;
    date?: string;
    updatedAt: string; // ISO timestamp for sorting
    headerImage?: string; // Optional URL for a logo/header
    topic?: string; // e.g., "พีชคณิต", "เรขาคณิต"
    icon?: string; // New: Emoji icon
}

export interface BaseSection {
    id: string;
    type: SectionType;
    title?: string;
    pageBreakBefore?: boolean; // Force new page before this section
}

export interface LectureSection extends BaseSection {
    type: 'lecture';
    content: string; // Markdown supported
    keyPoints?: string[];
}

// Lesson Section - for detailed foundational teaching content
export interface LessonExample {
    problem: string;
    solution: string;
    steps?: string[];
}

// Block System Definitions
export type BlockType = 'text' | 'image' | 'example' | 'spacer' | 'callout' | 'pageBreak' | 'graph' | 'practice';

export interface BaseBlock {
    id: string;
    type: BlockType;
}

export interface TextBlock extends BaseBlock {
    type: 'text';
    content: string; // Markdown
}

export interface ImageBlock extends BaseBlock {
    type: 'image';
    url: string;
    caption?: string;
    width?: number; // % or pixel
}

export interface SpacerBlock extends BaseBlock {
    type: 'spacer';
    height: number; // in pixel representing mm likely, or logical unit
}

export interface ExampleBlock extends BaseBlock {
    type: 'example';
    data: LessonExample;
}

export interface PracticeBlock extends BaseBlock {
    type: 'practice';
    data: LessonExample; // Reuse structure: problem + solution
}

export interface CalloutBlock extends BaseBlock {
    type: 'callout';
    title?: string;
    content: string;
    icon?: string;
    color?: 'blue' | 'yellow' | 'green' | 'red' | 'purple';
}

export interface PageBreakBlock extends BaseBlock {
    type: 'pageBreak';
}

export interface GraphBlock extends BaseBlock {
    type: 'graph';
    code: string;
}

export type AnyBlock = TextBlock | ImageBlock | SpacerBlock | ExampleBlock | CalloutBlock | PageBreakBlock | GraphBlock | PracticeBlock;

export interface LessonSection extends BaseSection {
    type: 'lesson';
    objectives?: string[];
    prerequisites?: string[];
    content: string; // Main lesson content (Markdown) - Keeping for backward compatibility/initial load
    examples?: LessonExample[];
    practiceProblems?: { problem: string; hint?: string; solution: string }[];
    keyTakeaways?: string[];

    // The new block-based content
    blocks?: AnyBlock[];
}

export interface ExerciseItem {
    id?: string;
    question: string;
    spaceForWork?: boolean; // Defaults to false
    lines?: number; // Number of dotted lines to render if spaceForWork is true
    answer?: string; // Short answer
    detailedSolution?: string; // Step-by-step solution
    key_concept?: string; // New: หลักการทำ
    common_mistakes?: string; // New: จุดที่มักผิด
    graphic_code?: string; // SVG code for geometry/diagrams
    difficulty?: 'ง่าย' | 'ปานกลาง' | 'ยาก' | 'โจทย์ปัญหา'; // Difficulty level
}

export interface ExerciseSection extends BaseSection {
    type: 'exercise';
    instructions?: string;
    items: ExerciseItem[];
}

export interface ExamQuestion {
    id?: string;
    text: string;
    options: (string | { text: string; graphic_code?: string; id?: string })[];
    correctOption: number; // 0-based index
    explanation?: string;
    key_concept?: string; // New: หลักการทำ
    common_mistakes?: string; // New: จุดที่มักผิด
    graphic_code?: string; // SVG code for geometry/diagrams
    difficulty?: 'ง่าย' | 'ปานกลาง' | 'ยาก' | 'โจทย์ปัญหา';
}

export interface ExamSection extends BaseSection {
    type: 'exam';
    instructions?: string;
    questions: ExamQuestion[];
}

export type Section = LectureSection | ExerciseSection | ExamSection | LessonSection;

export interface CourseDocument {
    documentMetadata: DocumentMetadata;
    sections: Section[];
}

// Header/Footer Configuration
export interface HeaderConfig {
    enabled: boolean;
    schoolName?: string;
    logoUrl?: string;
    showTitle: boolean;
    showDate: boolean;
    showInstructor: boolean;
    customText?: string;
}

export interface FooterConfig {
    enabled: boolean;
    showPageNumber: boolean;
    leftText?: string;
    centerText?: string;
    rightText?: string;
}

export type FontFamily = 'sarabun' | 'mali' | 'chakra' | 'niramit' | 'charm';

export interface HeaderFooterConfig {
    header: HeaderConfig;
    footer: FooterConfig;
    fontFamily?: FontFamily; // Acts as Body Font
    headingFont?: FontFamily; // For H1-H6
    forceStandardFont?: boolean; // If true, Header/Footer always use Sarabun
}

export const DEFAULT_HEADER_FOOTER_CONFIG: HeaderFooterConfig = {
    fontFamily: 'sarabun',
    headingFont: 'sarabun', // Default heading font
    header: {
        enabled: false,
        showTitle: true,
        showDate: true,
        showInstructor: true,
    },
    footer: {
        enabled: false,
        showPageNumber: true,
        centerText: "Teaching Docs Generator",
    },
};
