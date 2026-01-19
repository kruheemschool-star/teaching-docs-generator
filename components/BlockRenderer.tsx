import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import {
    AnyBlock,
    LessonSection,
    LessonExample,
    TextBlock,
    ExampleBlock,
    CalloutBlock,
    SpacerBlock,
    ImageBlock,
    PageBreakBlock,
    GraphBlock,
    PracticeBlock
} from '../types';

// ==========================================
// 1. ADAPTER: Convert legacy data to blocks
// ==========================================
// ... (existing code)

// ==========================================
// 2. BLOCK COMPONENTS
// ==========================================

// ... (existing renderers)

const GraphBlockRenderer = ({ block, editing, onUpdate }: { block: GraphBlock, editing: boolean, onUpdate: (code: string) => void }) => {
    const [previewCode, setPreviewCode] = useState(block.code);

    // Initial sync
    useEffect(() => {
        if (!previewCode && block.code) setPreviewCode(block.code);
    }, []);

    const handleRender = () => {
        setPreviewCode(block.code);
    };

    if (editing) {
        return (
            <div className="p-5 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 space-y-4">
                <div className="font-bold text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <span className="p-1 bg-gray-200 rounded">📊 Graph/SVG Block</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold block text-gray-700">Code (SVG / HTML):</label>
                        <p className="text-xs text-gray-500">วาง Code SVG หรือ HTML Chart ที่นี่ แล้วกด Update เพื่อดูผลลัพธ์</p>
                        <AutoResizeTextarea
                            className="w-full p-4 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                            value={block.code}
                            onChange={(e) => onUpdate(e.target.value)}
                            minHeight="200px"
                            placeholder="<svg ...> ... </svg>"
                        />
                        <button
                            onClick={handleRender}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                        >
                            🔄 Update Preview
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold block text-gray-700">Preview:</label>
                        <div
                            className="border border-gray-200 bg-white rounded-lg p-4 min-h-[200px] flex items-center justify-center overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: previewCode || '<span class="text-gray-300 italic">No code rendered</span>' }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // View Mode
    return (
        <div className="my-6 flex justify-center break-inside-avoid">
            <div dangerouslySetInnerHTML={{ __html: block.code }} />
        </div>
    );
};

export const convertLessonToBlocks = (section: LessonSection): AnyBlock[] => {
    if (section.blocks && section.blocks.length > 0) {
        return section.blocks;
    }

    const newBlocks: AnyBlock[] = [];
    let idCounter = 1;
    const generateId = () => `block-${Date.now()}-${idCounter++}`;

    // 1. Objectives (Callout)
    if (section.objectives && section.objectives.length > 0) {
        const objectivesText = section.objectives.map(o => `- ${o}`).join('\n');
        newBlocks.push({
            id: generateId(),
            type: 'callout',
            title: '🎯 จุดประสงค์การเรียนรู้',
            content: objectivesText,
            color: 'blue',
            icon: '🎯'
        } as CalloutBlock);
    }

    // 2. Prerequisites (Callout)
    if (section.prerequisites && section.prerequisites.length > 0) {
        const prereqText = section.prerequisites.map(p => `- ${p}`).join('\n');
        newBlocks.push({
            id: generateId(),
            type: 'callout',
            title: '📋 ความรู้พื้นฐานที่ต้องมี',
            content: prereqText,
            color: 'yellow',
            icon: '📋'
        } as CalloutBlock);
    }

    // 3. Main Content (Split into text and graph blocks)
    const rawContent = section.content || '';
    // Regex to find SVG tags (including multiline attributes and content)
    // Matches <svg ... > ... </svg>
    const svgRegex = /(<svg[\s\S]*?<\/svg>)/gi;

    // Split content by SVG tags
    const contentParts = rawContent.split(svgRegex);

    contentParts.forEach(part => {
        if (!part.trim()) return; // Skip empty parts

        // Check if this part is an SVG
        if (part.trim().toLowerCase().startsWith('<svg') && part.trim().toLowerCase().endsWith('</svg>')) {
            newBlocks.push({
                id: generateId(),
                type: 'graph',
                code: part.trim()
            } as GraphBlock);
        } else {
            newBlocks.push({
                id: generateId(),
                type: 'text',
                content: part
            } as TextBlock);
        }
    });

    // 4. Examples
    if (section.examples && section.examples.length > 0) {
        newBlocks.push({
            id: generateId(),
            type: 'text',
            content: '### ✏️ ตัวอย่างประกอบ'
        } as TextBlock);

        section.examples.forEach(ex => {
            newBlocks.push({
                id: generateId(),
                type: 'example',
                data: ex
            } as ExampleBlock);
        });
    }

    // 5. Key Takeaways
    if (section.keyTakeaways && section.keyTakeaways.length > 0) {
        const takeawaysText = section.keyTakeaways.map(k => `- ${k}`).join('\n');
        newBlocks.push({
            id: generateId(),
            type: 'callout',
            title: '🔑 สรุปสาระสำคัญ',
            content: takeawaysText,
            color: 'purple',
            icon: '🔑'
        } as CalloutBlock);
    }

    // 6. Practice problems
    if (section.practiceProblems && section.practiceProblems.length > 0) {
        newBlocks.push({
            id: generateId(),
            type: 'text',
            content: '### 📝 ลองทำดูหนูทำได้'
        } as TextBlock);

        section.practiceProblems.forEach(p => {
            // Support both legacy string array and new object array
            const problem = typeof p === 'string' ? p : p.problem;
            const solution = typeof p === 'string' ? '' : p.solution || '';

            newBlocks.push({
                id: generateId(),
                type: 'practice',
                data: { problem, solution, steps: [] }
            } as PracticeBlock);
        });
    }

    return newBlocks;
};

// ==========================================
// 1.5 HELPER COMPONENTS
// ==========================================

const AutoResizeTextarea = ({
    value,
    onChange,
    placeholder,
    className,
    minHeight = '100px'
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
}) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const resize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scrollHeight
        }
    };

    useEffect(() => {
        resize();
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            className={`${className} overflow-hidden resize-none`}
            style={{ minHeight }}
            value={value}
            onChange={(e) => {
                onChange(e);
                resize();
            }}
            placeholder={placeholder}
            rows={1}
        />
    );
};

// ==========================================
// 2. BLOCK COMPONENTS
// ==========================================

const TextBlockRenderer = ({ block, editing, onUpdate, fontSizeLevel = 0 }: { block: TextBlock, editing: boolean, onUpdate: (content: string) => void, fontSizeLevel?: number }) => {
    if (editing) {
        return (
            <AutoResizeTextarea
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-base leading-relaxed bg-white shadow-sm"
                value={block.content}
                onChange={(e) => onUpdate(e.target.value)}
                placeholder="เขียนเนื้อหาตรงนี้ (รองรับ Markdown)..."
                minHeight="150px"
            />
        );
    }

    // Dynamic Scaled Classes
    const proseClass = fontSizeLevel === 0 ? 'prose-xl' : fontSizeLevel === 1 ? 'prose-2xl' : 'prose-2xl text-2xl'; // XL -> 2XL -> Custom 2XL+
    const h1Class = fontSizeLevel === 0 ? 'text-4xl' : fontSizeLevel === 1 ? 'text-5xl' : 'text-6xl';
    const h2Class = fontSizeLevel === 0 ? 'text-3xl' : fontSizeLevel === 1 ? 'text-4xl' : 'text-5xl';
    const h3Class = fontSizeLevel === 0 ? 'text-2xl' : fontSizeLevel === 1 ? 'text-3xl' : 'text-4xl';

    return (
        <div className={`prose ${proseClass} max-w-none text-gray-800`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    h1: ({ node, ...props }) => <h1 className={`${h1Class} font-bold mt-8 mb-6 text-black border-b-2 border-black pb-3`} {...props} />,
                    h2: ({ node, ...props }) => <h2 className={`${h2Class} font-bold mt-6 mb-4 text-black flex items-center gap-2`} {...props} />,
                    h3: ({ node, ...props }) => <h3 className={`${h3Class} font-bold mt-5 mb-3 text-gray-800`} {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 text-gray-800 leading-loose" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-2 text-gray-800" {...props} />
                }}
            >
                {block.content}
            </ReactMarkdown>
        </div>
    );
};

const SpacerBlockRenderer = ({ block, editing, onUpdate }: { block: SpacerBlock, editing: boolean, onUpdate: (height: number) => void }) => {
    return (
        <div
            className={`w-full transition-all duration-200 ${editing ? 'bg-gray-100 border border-dashed border-gray-300 relative group' : ''}`}
            style={{ height: `${block.height}px` }}
        >
            {editing && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded shadow-sm border">
                        Space: {block.height}px
                    </span>
                    <input
                        type="range"
                        min="10"
                        max="300"
                        value={block.height}
                        onChange={(e) => onUpdate(parseInt(e.target.value))}
                        className="ml-4 w-32"
                    />
                </div>
            )}
        </div>
    );
};

const CalloutBlockRenderer = ({ block, editing, onUpdate, fontSizeLevel = 0 }: { block: CalloutBlock, editing: boolean, onUpdate: (updates: Partial<CalloutBlock>) => void, fontSizeLevel?: number }) => {
    // Notion-style minimalist: All are gray backgrounds, distinguished by icon or subtle left border
    const colorClasses = {
        blue: 'bg-gray-50 border-l-4 border-gray-400 text-gray-800',
        yellow: 'bg-gray-50 border-l-4 border-gray-400 text-gray-800',
        green: 'bg-gray-50 border-l-4 border-gray-400 text-gray-800',
        red: 'bg-gray-50 border-l-4 border-gray-400 text-gray-800',
        purple: 'bg-gray-50 border-l-4 border-gray-400 text-gray-800',
        gray: 'bg-gray-50 border-l-4 border-gray-400 text-gray-800', // Default
    };

    const theme = colorClasses[block.color || 'blue'] || colorClasses['gray'];

    if (editing) {
        return (
            <div className={`p-5 rounded-xl border-2 border-dashed border-gray-300 space-y-4 bg-gray-50/50`}>
                <div className="flex gap-3">
                    <input
                        value={block.icon || ''}
                        onChange={e => onUpdate({ icon: e.target.value })}
                        className="w-14 text-center p-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-lg"
                        placeholder="Icon"
                    />
                    <input
                        value={block.title || ''}
                        onChange={e => onUpdate({ title: e.target.value })}
                        className="flex-1 p-3 border border-gray-200 rounded-lg shadow-sm font-bold focus:ring-2 focus:ring-blue-500 text-base"
                        placeholder="หัวข้อ..."
                    />
                    <select
                        value={block.color}
                        onChange={e => onUpdate({ color: e.target.value as any })}
                        className="p-3 border border-gray-200 rounded-lg shadow-sm bg-white cursor-pointer hover:bg-gray-50 text-sm"
                    >
                        <option value="blue">Blue</option>
                        <option value="yellow">Yellow</option>
                        <option value="green">Green</option>
                        <option value="purple">Purple</option>
                        <option value="red">Red</option>
                    </select>
                </div>
                <AutoResizeTextarea
                    value={block.content}
                    onChange={e => onUpdate({ content: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-base leading-relaxed"
                    placeholder="เนื้อหา..."
                    minHeight="120px"
                />
            </div>
        );
    }

    // Dynamic Size
    const proseClass = fontSizeLevel === 0 ? 'prose-lg' : fontSizeLevel === 1 ? 'prose-xl' : 'prose-2xl';
    const titleClass = fontSizeLevel === 0 ? 'text-lg' : fontSizeLevel === 1 ? 'text-xl' : 'text-2xl';

    return (
        <div className={`pl-4 py-3 pr-4 rounded-r-lg ${theme} my-4 break-inside-avoid print:border transition-all hover:bg-gray-100/50`}>
            {block.title && (
                <h4 className={`font-bold ${titleClass} mb-2 flex items-center gap-3 text-gray-900`}>
                    {block.icon && <span className="text-xl shrink-0">{block.icon}</span>}
                    <span>{block.title}</span>
                </h4>
            )}
            <div className={`prose ${proseClass} max-w-none text-gray-700 leading-relaxed ml-1`}>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {block.content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

const ExampleBlockRenderer = ({ block, editing, onUpdate, showAnswers = false, fontSizeLevel = 0 }: { block: ExampleBlock, editing: boolean, onUpdate: (data: LessonExample) => void, showAnswers?: boolean, fontSizeLevel?: number }) => {
    if (editing) {
        return (
            <div className="p-5 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 space-y-4">
                <div className="font-bold text-sm text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <span className="p-1 bg-gray-200 rounded">✏️ Example Block</span>
                </div>
                <div>
                    <label className="text-sm font-bold block mb-2 text-gray-700">โจทย์ (Problem):</label>
                    <AutoResizeTextarea
                        className="w-full p-4 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-base font-mono"
                        value={block.data.problem}
                        onChange={e => onUpdate({ ...block.data, problem: e.target.value })}
                        minHeight="100px"
                        placeholder="ใส่โจทย์ที่นี่..."
                    />
                </div>
                <div>
                    <label className="text-sm font-bold block mb-2 text-gray-700">วิธีทำ (Solution):</label>
                    <AutoResizeTextarea
                        className="w-full p-4 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-base font-mono"
                        value={block.data.solution}
                        onChange={e => onUpdate({ ...block.data, solution: e.target.value })}
                        minHeight="100px"
                        placeholder="ใส่วิธีทำที่นี่..."
                    />
                </div>
            </div>
        );
    }

    // Dynamic Sizing
    const textClass = fontSizeLevel === 0 ? 'text-xl' : fontSizeLevel === 1 ? 'text-2xl' : 'text-3xl';
    const subTextClass = fontSizeLevel === 0 ? 'text-lg' : fontSizeLevel === 1 ? 'text-xl' : 'text-2xl';

    return (
        <div className="my-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm break-inside-avoid example-item">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-700">📌 ตัวอย่าง</span>
            </div>
            <div className="p-5 bg-white">
                <div className={`font-medium ${textClass} mb-4 text-gray-900`}>
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {block.data.problem}
                    </ReactMarkdown>
                </div>
                <div className={`pl-4 border-l-4 rounded-r-lg p-4 transition-all
                    ${showAnswers
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-transparent text-invisible invisible-box bg-transparent'
                    }`}>
                    <div className={`font-bold ${subTextClass} mb-2 ${showAnswers ? 'text-gray-700' : 'text-invisible'}`}>วิธีทำ</div>
                    <div className={`section-content ${subTextClass} ${showAnswers ? 'text-gray-600' : 'text-invisible'}`}>
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {block.data.solution}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PracticeBlockRenderer = ({ block, editing, onUpdate, showAnswers = false, fontSizeLevel = 0 }: { block: PracticeBlock, editing: boolean, onUpdate: (data: LessonExample) => void, showAnswers?: boolean, fontSizeLevel?: number }) => {
    if (editing) {
        return (
            <div className="p-5 border-2 border-dashed border-purple-300 rounded-xl bg-purple-50/20 space-y-4">
                <div className="font-bold text-sm text-purple-600 uppercase tracking-wider flex items-center gap-2">
                    <span className="p-1 bg-purple-100 rounded">✍️ Practice Block</span>
                </div>
                <div>
                    <label className="text-sm font-bold block mb-2 text-gray-700">โจทย์ (Problem):</label>
                    <AutoResizeTextarea
                        className="w-full p-4 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 text-base font-mono"
                        value={block.data.problem}
                        onChange={e => onUpdate({ ...block.data, problem: e.target.value })}
                        minHeight="100px"
                        placeholder="ใส่โจทย์..."
                    />
                </div>
                <div>
                    <label className="text-sm font-bold block mb-2 text-gray-700">เฉลย (Solution):</label>
                    <AutoResizeTextarea
                        className="w-full p-4 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 text-base font-mono"
                        value={block.data.solution}
                        onChange={e => onUpdate({ ...block.data, solution: e.target.value })}
                        minHeight="100px"
                        placeholder="ใส่เฉลย..."
                    />
                </div>
            </div>
        );
    }

    // Dynamic Size
    const textClass = fontSizeLevel === 0 ? 'text-xl' : fontSizeLevel === 1 ? 'text-2xl' : 'text-3xl';
    const subTextClass = fontSizeLevel === 0 ? 'text-lg' : fontSizeLevel === 1 ? 'text-xl' : 'text-2xl';

    return (
        <div className="my-6 border border-purple-100 rounded-xl overflow-hidden shadow-sm break-inside-avoid practice-item">
            <div className="bg-purple-50 px-5 py-3 border-b border-purple-100 flex justify-between items-center">
                <span className="font-bold text-purple-900">✍️ ลองทำดู</span>
            </div>
            <div className="p-5 bg-white">
                <div className={`font-medium ${textClass} mb-4 text-gray-900`}>
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {block.data.problem}
                    </ReactMarkdown>
                </div>
                <div className={`pl-4 border-l-4 rounded-r-lg p-4 transition-all
                    ${showAnswers
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-transparent text-invisible invisible-box bg-transparent'
                    }`}>
                    <div className={`font-bold ${subTextClass} mb-2 ${showAnswers ? 'text-gray-700' : 'text-invisible'}`}>เฉลย</div>
                    <div className={`section-content ${subTextClass} ${showAnswers ? 'text-gray-600' : 'text-invisible'}`}>
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {block.data.solution}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ImageBlockRenderer ... (unchanged)
const ImageBlockRenderer = ({ block, editing, onUpdate, fontSizeLevel = 0 }: { block: ImageBlock, editing: boolean, onUpdate: (updates: Partial<ImageBlock>) => void, fontSizeLevel?: number }) => {

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('ขนาดไฟล์ใหญ่เกินไป (จำกัด 2MB เพื่อความเร็วในการบันทึก)');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            onUpdate({ url: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    if (editing) {
        return (
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center gap-4">
                {block.url ? (
                    <div className="relative w-full">
                        <img src={block.url} alt="Uploaded" className="max-h-[300px] w-auto mx-auto object-contain rounded border bg-white" />
                        <button
                            onClick={() => onUpdate({ url: '' })}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-600"
                            title="ลบรูป"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-gray-500 mb-2">📸 เพิ่มรูปภาพ</p>
                        <div className="flex gap-2 justify-center">
                            <label className="cursor-pointer bg-white border px-3 py-1 rounded shadow-sm hover:bg-gray-100 text-sm">
                                เลือกไฟล์
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                            </label>
                            <span className="text-gray-400 self-center text-xs">หรือ</span>
                            <input
                                type="text"
                                placeholder="วาง URL ของรูป..."
                                className="border rounded px-2 py-1 text-sm w-48"
                                onChange={(e) => onUpdate({ url: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {block.url && (
                    <div className="w-full flex gap-2">
                        <input
                            type="text"
                            placeholder="คำอธิบายภาพ (Caption)..."
                            className="flex-1 border rounded px-2 py-1 text-sm text-center"
                            value={block.caption || ''}
                            onChange={(e) => onUpdate({ caption: e.target.value })}
                        />
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            Width:
                            <input
                                type="number"
                                className="w-16 border rounded px-1"
                                value={block.width || 100}
                                onChange={(e) => onUpdate({ width: parseInt(e.target.value) })}
                            />%
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (!block.url) return null;

    return (
        <div className="my-4 flex flex-col items-center">
            <img
                src={block.url}
                alt={block.caption || ''}
                className="rounded-lg"
                style={{ width: block.width ? `${block.width}%` : '100%' }}
            />
            {block.caption && (
                <p className={`text-center mt-2 italic text-gray-500 ${fontSizeLevel === 0 ? 'text-sm' : fontSizeLevel === 1 ? 'text-base' : 'text-lg'}`}>{block.caption}</p>
            )}
        </div>
    );
};

// PageBreakBlockRenderer (unchanged)
const PageBreakBlockRenderer = ({ editing }: { editing: boolean }) => {
    if (editing) {
        return (
            <div className="w-full h-8 flex items-center justify-center my-4 relative group cursor-default">
                <div className="w-full border-t-2 border-red-400 border-dashed absolute top-1/2 left-0 right-0"></div>
                <span className="bg-red-50 text-red-500 text-xs font-bold px-2 py-1 rounded relative z-10 border border-red-200 uppercase tracking-wider">
                    ✂️ ขึ้นหน้าใหม่ (Page Break)
                </span>
            </div>
        );
    }
    return <div className="break-after-page h-[1px] w-full" style={{ pageBreakAfter: 'always', breakAfter: 'page' }}></div>;
};

// ==========================================
// 3. MAIN EDITOR COMPONENT
// ==========================================

interface BlockEditorProps {
    blocks: AnyBlock[];
    isEditing: boolean;
    showAnswers?: boolean;
    onChange: (newBlocks: AnyBlock[]) => void;
    fontSizeLevel?: number; // 0=M, 1=L, 2=XL
}export const BlockEditor: React.FC<BlockEditorProps> = ({ blocks: initialBlocks, isEditing, showAnswers = false, onChange, fontSizeLevel = 0 }) => {
    const [blocks, setBlocks] = useState<AnyBlock[]>(initialBlocks);

    useEffect(() => {
        setBlocks(initialBlocks);
    }, [initialBlocks]);

    const updateBlock = (id: string, updates: any) => {
        const newBlocks = blocks.map(b => b.id === id ? { ...b, ...updates } : b);
        setBlocks(newBlocks);
        onChange(newBlocks);
    };

    const updateBlockData = (id: string, dataUpdates: any) => {
        const newBlocks = blocks.map(b => {
            if (b.id !== id) return b;
            if (b.type === 'example') return { ...b, data: dataUpdates };
            if (b.type === 'practice') return { ...b, data: dataUpdates };
            return b;
        });
        setBlocks(newBlocks);
        onChange(newBlocks);
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (index === 0 && direction === 'up') return;
        if (index === blocks.length - 1 && direction === 'down') return;

        const newBlocks = [...blocks];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];

        setBlocks(newBlocks);
        onChange(newBlocks);
    };

    const removeBlock = (index: number) => {
        if (!confirm('ต้องการลบบล็อกนี้ใช่ไหม?')) return;
        const newBlocks = blocks.filter((_, i) => i !== index);
        setBlocks(newBlocks);
        onChange(newBlocks);
    };

    const addBlock = (index: number, type: 'text' | 'spacer' | 'example' | 'callout' | 'image' | 'pageBreak' | 'graph' | 'practice') => {
        const newId = `new-block-${Date.now()}`;
        let newBlock: AnyBlock;

        switch (type) {
            case 'text':
                newBlock = { id: newId, type: 'text', content: '' };
                break;
            case 'spacer':
                newBlock = { id: newId, type: 'spacer', height: 50 };
                break;
            case 'example':
                newBlock = { id: newId, type: 'example', data: { problem: 'โจทย์...', solution: 'วิธีทำ...' } };
                break;
            case 'image':
                newBlock = { id: newId, type: 'image', url: '', width: 100 };
                break;
            case 'pageBreak':
                newBlock = { id: newId, type: 'pageBreak' };
                break;
            case 'graph':
                newBlock = { id: newId, type: 'graph', code: '' };
                break;
            case 'practice':
                newBlock = { id: newId, type: 'practice', data: { problem: 'โจทย์...', solution: 'เฉลย...' } };
                break;
            default:
                return;
        }

        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);

        setBlocks(newBlocks);
        onChange(newBlocks);
    };

    return (
        <div
            className={`space-y-4 ${isEditing ? 'bg-[linear-gradient(to_bottom,transparent_calc(296mm-1px),#fca5a5_calc(296mm-1px),#fca5a5_296mm)]' : ''}`}
            style={isEditing ? { backgroundSize: '100% 297mm' } : {}}
        >
            {blocks.map((block, index) => (
                <div key={block.id} className={`relative group block-item break-inside-avoid ${isEditing ? 'pl-10 pr-4 py-2 hover:bg-gray-50/50 rounded-lg transition-colors border border-transparent hover:border-gray-200' : ''}`}>

                    {/* Editing Controls (Left Side) */}
                    {isEditing && (
                        <div className="absolute left-0 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 items-center w-8 z-10">
                            <button
                                onClick={() => moveBlock(index, 'up')}
                                disabled={index === 0}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30"
                            >
                                ▲
                            </button>
                            <button
                                onClick={() => moveBlock(index, 'down')}
                                disabled={index === blocks.length - 1}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500 disabled:opacity-30"
                            >
                                ▼
                            </button>
                            <button
                                onClick={() => removeBlock(index)}
                                className="p-1 hover:bg-red-100 rounded text-red-500 mt-1"
                                title="ลบ"
                            >
                                🗑️
                            </button>
                        </div>
                    )}

                    {/* Block Content */}
                    <div className="">
                        {block.type === 'text' && (
                            <TextBlockRenderer
                                block={block as TextBlock}
                                editing={isEditing}
                                onUpdate={(content) => updateBlock(block.id, { content })}
                                fontSizeLevel={fontSizeLevel}
                            />
                        )}
                        {block.type === 'spacer' && (
                            <SpacerBlockRenderer
                                block={block as SpacerBlock}
                                editing={isEditing}
                                onUpdate={(height) => updateBlock(block.id, { height })}
                            />
                        )}
                        {block.type === 'callout' && (
                            <CalloutBlockRenderer
                                block={block as CalloutBlock}
                                editing={isEditing}
                                onUpdate={(updates) => updateBlock(block.id, updates)}
                                fontSizeLevel={fontSizeLevel}
                            />
                        )}
                        {block.type === 'example' && (
                            <ExampleBlockRenderer
                                block={block as ExampleBlock}
                                editing={isEditing}
                                showAnswers={showAnswers}
                                onUpdate={(data) => updateBlockData(block.id, data)}
                                fontSizeLevel={fontSizeLevel}
                            />
                        )}
                        {block.type === 'image' && (
                            <ImageBlockRenderer
                                block={block as ImageBlock}
                                editing={isEditing}
                                onUpdate={(updates) => updateBlock(block.id, updates)}
                                fontSizeLevel={fontSizeLevel}
                            />
                        )}
                        {block.type === 'pageBreak' && (
                            <PageBreakBlockRenderer editing={isEditing} />
                        )}
                        {block.type === 'graph' && (
                            <GraphBlockRenderer
                                block={block as GraphBlock}
                                editing={isEditing}
                                onUpdate={(code) => updateBlock(block.id, { code })}
                            />
                        )}
                        {block.type === 'practice' && (
                            <PracticeBlockRenderer
                                block={block as PracticeBlock}
                                editing={isEditing}
                                showAnswers={showAnswers}
                                onUpdate={(data) => updateBlockData(block.id, data)}
                                fontSizeLevel={fontSizeLevel}
                            />
                        )}
                    </div>

                    {/* Add Button (Bottom) */}
                    {isEditing && (
                        <div className="absolute -bottom-5 left-0 right-0 h-10 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex justify-center no-print">
                            <div className="bg-white shadow-lg border border-gray-200 rounded-full flex overflow-hidden text-sm transform hover:scale-105 transition-transform">
                                <button onClick={() => addBlock(index, 'text')} className="px-4 py-2 hover:bg-gray-100 border-r flex items-center gap-1">📝 ข้อความ</button>
                                <button onClick={() => addBlock(index, 'image')} className="px-4 py-2 hover:bg-gray-100 border-r flex items-center gap-1">🖼️ รูปภาพ</button>
                                <button onClick={() => addBlock(index, 'example')} className="px-4 py-2 hover:bg-gray-100 border-r flex items-center gap-1">✏️ ตัวอย่าง</button>
                                <button onClick={() => addBlock(index, 'callout')} className="px-4 py-2 hover:bg-gray-100 border-r flex items-center gap-1">💡 กล่อง</button>
                                <button onClick={() => addBlock(index, 'practice')} className="px-4 py-2 hover:bg-gray-100 border-r flex items-center gap-1 text-purple-700">✍️ โจทย์</button>
                                <button onClick={() => addBlock(index, 'spacer')} className="px-4 py-2 hover:bg-gray-100 border-r flex items-center gap-1">⬜ ช่องว่าง</button>
                                <button onClick={() => addBlock(index, 'graph')} className="px-4 py-2 hover:bg-gray-100 border-r flex items-center gap-1">📊 กราฟ</button>
                                <button onClick={() => addBlock(index, 'pageBreak')} className="px-4 py-2 hover:bg-red-50 text-red-600 font-medium flex items-center gap-1">✂️ ตัดหน้า</button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {isEditing && blocks.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-4">ยังไม่มีเนื้อหา</p>
                    <button onClick={() => addBlock(-1, 'text')} className="bg-black text-white px-4 py-2 rounded-lg">
                        + เริ่มเขียนเนื้อหา
                    </button>
                </div>
            )}
        </div>
    );
};
