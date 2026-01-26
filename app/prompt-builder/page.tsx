"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    BookOpen, FileText, GraduationCap, Video, Youtube,
    Layout, Type, List, CheckSquare, Shapes, Calculator,
    ArrowLeft, Sparkles, AlertCircle, HelpCircle,
    Check, Copy, Terminal, RotateCcw, X
} from 'lucide-react';
import Link from 'next/link';

// --- Constants & Data ---

const SUBJECTS = [
    "คณิตศาสตร์", "วิทยาศาสตร์", "ภาษาไทย", "ภาษาอังกฤษ", "สังคมศึกษา", "ประวัติศาสตร์", "สุขศึกษา", "ศิลปะ", "การงานอาชีพ", "คอมพิวเตอร์"
];

const GRADES = [
    "ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6",
    "ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6",
    "ปวช.", "ปวส.", "มหาวิทยาลัย"
];

// Content Types with Icons
const CONTENT_TYPES = [
    {
        id: "exam",
        label: "ออกข้อสอบ",
        icon: GraduationCap,
        desc: "สร้างชุดข้อสอบ ตัวเลือก พร้อมเฉลยละเอียด"
    },
    {
        id: "exercise",
        label: "แบบฝึกหัด",
        icon: CheckSquare,
        desc: "โจทย์ปัญหา เน้นการฝึกฝนและวิธีทำ"
    },
    {
        id: "lesson",
        label: "เนื้อหาบทเรียน",
        icon: BookOpen,
        desc: "สรุปเนื้อหาสำคัญ อธิบายตามหัวข้อ"
    },
    {
        id: "video-summary",
        label: "สรุปจากวิดีโอ",
        icon: Video,
        desc: "สรุปประเด็นสำคัญจาก Transcript หรือ YouTube"
    }
];

const QUESTION_STYLES = [
    { value: "onets", label: "O-NET", description: "เน้นวิเคราะห์ เชื่อมโยงความรู้พื้นฐาน" },
    { value: "pat1", label: "PAT 1", description: "คณิตศาสตร์ขั้นสูง ซับซ้อน ท้าทาย" },
    { value: "sat", label: "SAT Math", description: "ภาษาอังกฤษ เน้น Speed & Logic" },
    { value: "posn", label: "สอวน.", description: "โอลิมปิกวิชาการ วิเคราะห์เชิงลึก" },
    { value: "cloze", label: "Cloze Test", description: "ทดสอบคำศัพท์และไวยากรณ์ในบริบท" },
    { value: "blanks", label: "Fill Blanks", description: "เติมคำตอบสั้นๆ ตรวจสอบความแม่นยำ" }
];

const DIFFICULTIES = [
    { value: "easy", label: "ง่าย", color: "text-green-600" },
    { value: "medium", label: "ปานกลาง", color: "text-yellow-600" },
    { value: "hard", label: "ยาก", color: "text-red-600" },
    { value: "mixed", label: "คละ", color: "text-gray-600" }
];

const WRITING_TONES = [
    { value: "formal", label: "วิชาการ", description: "ภาษาทางการ อ้างอิงทฤษฎี เหมาะสำหรับตำราเรียน" },
    { value: "tutor", label: "ติวเตอร์", description: "สนุกสนาน เข้าใจง่าย มีเทคนิคจำ เหมือนพี่สอนน้อง" },
    { value: "storytelling", label: "เล่าเรื่อง", description: "ใช้การเปรียบเทียบและการเล่าเรื่องให้น่าติดตาม" },
    { value: "step-by-step", label: "Step-by-Step", description: "สอนทีละขั้นตอนอย่างละเอียด ไม่ข้าม step" }
];

const SUMMARY_TONES = [
    { value: "brief", label: "สรุปย่อ", description: "เน้นสั้น กระชับ เอาเฉพาะใจความสำคัญที่สุด" },
    { value: "detailed", label: "ละเอียด", description: "เก็บทุกประเด็นสำคัญ พร้อมตัวอย่างประกอบ" },
    { value: "bullet", label: "Bullet Points", description: "สรุปเป็นข้อย่อยๆ อ่านง่าย สบายตา" }
];

const CONTENT_ELEMENTS = [
    "ตัวอย่างประกอบ",
    "สูตรลัด",
    "แผนภาพ",
    "ตารางเปรียบเทียบ",
    "เกร็ดความรู้",
    "คำศัพท์สำคัญ"
];

const INPUT_SOURCES = [
    { id: "topic", label: "หัวข้อ", icon: Type },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "transcript", label: "Transcript", icon: FileText }
];

const QUICK_TEMPLATES = [
    {
        id: "lesson_summary",
        label: "สรุปบทเรียน",
        icon: FileText,
        topic: "[ระบุเรื่องที่ต้องการสรุป]",
        desc: "สร้างเอกสารสรุปเนื้อหาสำหรับทบทวน"
    },
    {
        id: "exam_generator",
        label: "ออกข้อสอบ",
        icon: GraduationCap,
        topic: "[ระบุวิชา/เรื่องที่ต้องการสอบ]",
        desc: "สร้างชุดข้อสอบวัดผลพร้อมเฉลย"
    },
    {
        id: "teaching_plan",
        label: "แผนการสอน",
        icon: BookOpen,
        topic: "[ระบุหัวข้อแผนการสอน]",
        desc: "ร่างแผนการจัดการเรียนรู้รายชั่วโมง"
    }
];

// Simple Toast Component
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
        <Check className="w-5 h-5 text-green-400" />
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:bg-gray-700 p-1 rounded">
            <X className="w-4 h-4 text-gray-400" />
        </button>
    </div>
);

export default function PromptBuilder() {
    // --- State Management ---
    const [contentType, setContentType] = useState("exam");

    // Core Inputs
    const [gradeLevel, setGradeLevel] = useState("ม.1");
    const [subject, setSubject] = useState("คณิตศาสตร์");
    const [customTopic, setCustomTopic] = useState("");
    const [highlightTopic, setHighlightTopic] = useState(false);

    // Exam specific
    const [questionStyle, setQuestionStyle] = useState("onets");
    const [questionType, setQuestionType] = useState("multiple_choice");
    const [difficulty, setDifficulty] = useState("medium");
    const [itemCount, setItemCount] = useState(5);

    // Lesson specific
    const [subTopic, setSubTopic] = useState("");
    const [writingTone, setWritingTone] = useState("tutor");
    const [contentElements, setContentElements] = useState<string[]>(["ตัวอย่างประกอบ", "สูตรลัด"]);

    // Video Summary specific
    const [summaryTone, setSummaryTone] = useState("bullet");
    const [inputSource, setInputSource] = useState("topic");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [transcript, setTranscript] = useState("");

    // General
    const [additionalInstructions, setAdditionalInstructions] = useState("");
    const [generatedPrompt, setGeneratedPrompt] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const customTopicRef = useRef<HTMLInputElement>(null);

    // --- Safety Logic ---
    useEffect(() => {
        if (contentType === "lesson" || contentType === "video-summary") {
            setDifficulty("medium");
            setItemCount(5);
            setQuestionStyle("onets");
        }
        if (contentType !== "video-summary" && inputSource !== "topic") {
            setInputSource("topic");
        }
    }, [contentType]);

    // --- Helper Functions ---
    const getTopicForPrompt = () => {
        if (customTopic.trim()) return customTopic;
        return `${subject} เรื่อง ...`;
    };

    const getDisplayGradeLevel = () => gradeLevel;

    const handleUseTemplate = (templateTopic: string) => {
        setSubject("");
        setCustomTopic(templateTopic);
        setHighlightTopic(true);
    };

    const handleReset = () => {
        if (confirm("ต้องการล้างค่าทั้งหมดและเริ่มใหม่หรือไม่?")) {
            setContentType("exam");
            setGradeLevel("ม.1");
            setSubject("คณิตศาสตร์");
            setCustomTopic("");
            setQuestionStyle("onets");
            setDifficulty("medium");
            setItemCount(5);
            setGeneratedPrompt("");
            setInputSource("topic");
            setYoutubeUrl("");
            setTranscript("");
        }
    };

    // Validation Check
    const isFormValid = useMemo(() => {
        if (inputSource === 'topic') return customTopic.trim().length > 0;
        if (inputSource === 'youtube') return youtubeUrl.trim().length > 0;
        if (inputSource === 'transcript') return transcript.trim().length > 0;
        return false;
    }, [inputSource, customTopic, youtubeUrl, transcript]);


    useEffect(() => {
        if (highlightTopic && customTopicRef.current) {
            customTopicRef.current.focus();
            customTopicRef.current.select();
            setHighlightTopic(false);
        }
    }, [highlightTopic]);


    const generatePrompt = () => {
        // PART 1: SYSTEM PROMPT (Static & Fixed)
        const part1_SystemPrompt = "คุณคือผู้เชี่ยวชาญด้านคณิตศาสตร์ และเป็นครูที่เก่งการอธิบายแบบ NotebookLM สไตล์ คืออธิบายเรื่องยากให้เป็นเรื่องง่าย มีการใช้คำพูดเปรียบเทียบที่เห็นภาพ เป็นเหตุเป็นผล และมีขั้นตอนชัดเจน";

        // PART 2: DYNAMIC INPUTS (User Selection)
        const topicText = getTopicForPrompt();
        const gradeText = getDisplayGradeLevel();
        const subTopicText = subTopic ? `\nหัวข้อย่อย: ${subTopic}` : "";
        const additionalText = additionalInstructions ? `\nคำสั่งเพิ่มเติม: ${additionalInstructions}` : "";

        let dynamicInputs = `จงสร้างเนื้อหาตามรายละเอียดดังต่อไปนี้:
ประเภทเนื้อหา: ${contentType === "exam" ? "ข้อสอบ (Exam)" : contentType === "exercise" ? "แบบฝึกหัด (Exercise)" : contentType === "lesson" ? "เนื้อหา (Lesson)" : contentType === "video-summary" ? "สรุปจากวิดีโอ (Video Summary)" : "เนื้อหา"}
ระดับชั้น: ${gradeText}
หัวข้อเรื่อง: ${topicText}${subTopicText}`;

        // Add optional inputs based on content type
        if (contentType === "exam" || contentType === "exercise") {
            dynamicInputs += `
สไตล์โจทย์: ${QUESTION_STYLES.find(s => s.value === questionStyle)?.label || questionStyle}
ระดับความยาก: ${difficulty === "mixed" ? "คละความยาก" : DIFFICULTIES.find(d => d.value === difficulty)?.label}
จำนวนข้อ: ${itemCount} ข้อ`;
        } else if (contentType === "lesson" || contentType === "lecture") {
            dynamicInputs += `
โทนการเขียน: ${WRITING_TONES.find(t => t.value === writingTone)?.label} (${WRITING_TONES.find(t => t.value === writingTone)?.description})
องค์ประกอบ: ${contentElements.join(", ")}`;
        } else if (contentType === "video-summary") {
            dynamicInputs += `
โทนการสรุป: ${SUMMARY_TONES.find(t => t.value === summaryTone)?.label}`;

            if (inputSource === "youtube" && youtubeUrl) {
                dynamicInputs += `\nลิงก์ YouTube: ${youtubeUrl}`;
            }
            if (inputSource === "transcript" && transcript) {
                dynamicInputs += `\nTranscript:\n"${transcript}"`;
            }
        }

        dynamicInputs += additionalText;


        // PART 3: OUTPUT CONSTRAINTS (JSON Schema)
        let schemaDefinition = "";
        let specificInstructions = "";

        if (contentType === "exam" || contentType === "exercise") {
            const isGeometry = questionType === "geometry";
            schemaDefinition = `{
  "content_type": "${contentType}",
  "topic": "${topicText}",
  "questions": [
    {
      "question_id": 1,
      "question_text": "โจทย์คำถามพร้อมเชื่อมโยงชีวิตจริง... (ใช้ LaTeX สำหรับสมการ)",
      "choices": ["ก. ...", "ข. ...", "ค. ...", "ง. ..."],
      "correct_answer": "ระบุตัวเลือกที่ถูก (เช่น ก.)",
      "step_by_step_solution": [
        "ขั้นที่ 1: วิเคราะห์โจทย์...",
        "ขั้นที่ 2: แสดงวิธีทำ...",
        "ขั้นที่ 3: สรุปคำตอบ..."
      ]${isGeometry ? ',\n      "graphic_code": "<svg>...</svg>"' : ''}
    }
  ]
}`;
            if (isGeometry) {
                specificInstructions = "กรณีเป็นเรขาคณิต: ต้องสร้างโค้ด SVG ที่สมบูรณ์ใส่ในฟิลด์ graphic_code";
            }

        } else if (contentType === "lesson" || contentType === "lecture") {
            schemaDefinition = `{
  "content_type": "lesson",
  "title": "${topicText}",
  "core_concept": "อธิบายหลักการสำคัญให้เข้าใจง่ายที่สุด",
  "analogy": "เปรียบเทียบกับสิ่งที่เห็นภาพชัดเจน",
  "sections": [
    {
      "sub_heading": "หัวข้อย่อย",
      "content": "เนื้อหาอธิบายอย่างละเอียด",
      "formula": "สูตรที่เกี่ยวข้อง (LaTeX)",
      "example": "ตัวอย่างการใช้งาน"
    }
  ],
  "summary": "สรุปเนื้อหาทั้งหมดใน 3 บรรทัด"
}`;
        } else if (contentType === "video-summary") {
            schemaDefinition = `{
  "content_type": "summary",
  "title": "${topicText}",
  "key_takeaways": ["ประเด็นสำคัญ 1", "ประเด็นสำคัญ 2"],
  "common_mistakes": ["สิ่งที่มักเข้าใจผิด 1", "สิ่งที่มักเข้าใจผิด 2"],
  "timestamps": [
    { "time": "00:00", "topic": "หัวข้อช่วงเวลา" }
  ]
}`;
        }

        const part3_Constraints = `คำสั่งสำคัญ: จงส่งคืนผลลัพธ์เป็นโครงสร้าง JSON ตามรูปแบบด้านล่างนี้เท่านั้น ห้ามมีข้อความเกริ่นนำ ห้ามมีคำลงท้าย และห้ามครอบด้วย Markdown code block (\`\`\`json) ใดๆ ทั้งสิ้น

รูปแบบ JSON ที่ต้องการ:
${schemaDefinition}

${specificInstructions}
ข้อควรระวัง: สัญลักษณ์ทางคณิตศาสตร์ทั้งหมดต้องใช้รูปแบบ LaTeX`;

        // MASTER PROMPT CONCATENATION
        const masterPrompt = `${part1_SystemPrompt}\n\n${dynamicInputs}\n\n${part3_Constraints}`;

        setGeneratedPrompt(masterPrompt);
    };

    const copyToClipboard = () => {
        if (!generatedPrompt) return;

        navigator.clipboard.writeText(generatedPrompt);
        setIsCopied(true);
        setShowToast(true);

        // Hide Toast after 3s
        setTimeout(() => setShowToast(false), 3000);

        // Revert button after 2s
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Auto-generate validation visual feedback
    const topicInputClass = isFormValid
        ? "border-gray-200 focus:ring-black"
        : "border-red-200 focus:ring-red-500 bg-red-50";

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#333333] font-sans">
            {showToast && <Toast message="คัดลอกคำสั่งเรียบร้อยแล้ว พร้อมนำไปวางใน Gemini" onClose={() => setShowToast(false)} />}

            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-black">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Prompt Builder</h1>
                            <p className="text-gray-500 text-sm">เครื่องมือสร้างคำสั่งสำหรับ AI เพื่อผลิตสื่อการสอน</p>
                        </div>
                    </div>
                    {/* Reset Button */}
                    <button
                        onClick={handleReset}
                        className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors px-3 py-1.5 rounded hover:bg-red-50"
                    >
                        <RotateCcw className="w-3 h-3" /> ล้างค่า (Reset)
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: Controls (60%) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Card 1: Context (ข้อมูลตั้งต้น) */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs">1</span>
                                ข้อมูลตั้งต้น (Context)
                            </h2>

                            <div className="space-y-8">
                                {/* Quick Start Templates */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Quick Start</label>
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {QUICK_TEMPLATES.map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => handleUseTemplate(t.topic)}
                                                className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded-md transition-all whitespace-nowrap text-sm text-gray-700"
                                            >
                                                <t.icon className="w-4 h-4 text-gray-500" />
                                                <span>{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Content Type */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">ประเภทเนื้อหา</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {CONTENT_TYPES.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setContentType(type.id)}
                                                className={`group relative p-3 rounded-lg border text-left transition-all ${contentType === type.id
                                                        ? "border-black bg-blue-50/50 ring-1 ring-black/5 shadow-sm"
                                                        : "border-gray-200 bg-white hover:border-gray-300"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-md ${contentType === type.id ? "bg-white border border-gray-200 text-black shadow-sm" : "bg-gray-100 text-gray-500"}`}>
                                                        <type.icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm ${contentType === type.id ? "text-black font-bold" : "text-gray-600 font-semibold"}`}>
                                                            {type.label}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Audience & Topic */}
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-1/3">
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">ระดับชั้น</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-black focus:border-transparent outline-none appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                                                    value={gradeLevel}
                                                    onChange={(e) => setGradeLevel(e.target.value)}
                                                >
                                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-2/3">
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                                                {contentType === "video-summary" ? "แหล่งข้อมูล" : "วิชา"}
                                            </label>
                                            {contentType === "video-summary" ? (
                                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                                    {INPUT_SOURCES.map(source => (
                                                        <button
                                                            key={source.id}
                                                            onClick={() => setInputSource(source.id as any)}
                                                            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${inputSource === source.id
                                                                    ? "bg-white shadow-sm text-black ring-1 ring-black/5 font-bold"
                                                                    : "text-gray-500 hover:text-gray-700"
                                                                }`}
                                                        >
                                                            <source.icon className="w-3 h-3" />
                                                            {source.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <select
                                                        className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-black focus:border-transparent outline-none appearance-none cursor-pointer hover:border-gray-400 transition-colors"
                                                        value={subject}
                                                        onChange={(e) => setSubject(e.target.value)}
                                                    >
                                                        <option value="">(ไม่ระบุวิชา)</option>
                                                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Topic Input - Validated */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 flex justify-between">
                                            <span>{inputSource === 'youtube' ? "YouTube URL" : inputSource === 'transcript' ? "Transcript" : "หัวข้อเรื่อง"}</span>
                                            {!isFormValid && <span className="text-red-500">* จำเป็น</span>}
                                        </label>

                                        {inputSource === 'youtube' ? (
                                            <div className="relative">
                                                <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent outline-none text-sm font-mono transition-all ${topicInputClass}`}
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                    value={youtubeUrl}
                                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                                />
                                            </div>
                                        ) : inputSource === 'transcript' ? (
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                                <textarea
                                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:border-transparent outline-none text-sm h-32 resize-none leading-relaxed transition-all ${topicInputClass}`}
                                                    placeholder="วางข้อความ Transcript ยาวๆ ที่นี่..."
                                                    value={transcript}
                                                    onChange={(e) => setTranscript(e.target.value)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    ref={customTopicRef}
                                                    type="text"
                                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:border-transparent outline-none text-sm placeholder:text-gray-300 transition-all ${topicInputClass}`}
                                                    placeholder="ระบุหัวข้อเรื่อง..."
                                                    value={customTopic}
                                                    onChange={(e) => setCustomTopic(e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Configuration (การตั้งค่าผลลัพธ์) */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <span className="bg-black text-white w-6 h-6 rounded flex items-center justify-center text-xs">2</span>
                                การตั้งค่าผลลัพธ์ (Configuration)
                            </h2>

                            {/* Exam / Exercise Settings */}
                            {(contentType === "exam" || contentType === "exercise") && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">ความยาก</label>
                                            <div className="space-y-1">
                                                {DIFFICULTIES.map((diff) => (
                                                    <label key={diff.value} className={`flex items-center gap-3 cursor-pointer group py-2 rounded px-2 -mx-2 transition-all ${difficulty === diff.value ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${difficulty === diff.value ? 'border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                                            {difficulty === diff.value && <div className="w-2 h-2 rounded-full bg-black" />}
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name="difficulty"
                                                            value={diff.value}
                                                            checked={difficulty === diff.value}
                                                            onChange={(e) => setDifficulty(e.target.value)}
                                                            className="hidden"
                                                        />
                                                        <span className={`text-sm ${difficulty === diff.value ? 'text-black font-bold' : 'text-gray-600'}`}>
                                                            {diff.label}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">จำนวนข้อ: {itemCount}</label>
                                            <div className="px-1">
                                                <input
                                                    type="range"
                                                    min="1" max="20"
                                                    value={itemCount}
                                                    onChange={(e) => setItemCount(parseInt(e.target.value))}
                                                    className="w-full accent-black h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-300 mt-1 font-mono">
                                                <span>1</span>
                                                <span className="text-black font-bold">{itemCount}</span>
                                                <span>20</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-50">
                                        <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">รูปแบบโจทย์</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {QUESTION_STYLES.map((style) => (
                                                <button
                                                    key={style.value}
                                                    onClick={() => setQuestionStyle(style.value)}
                                                    className={`group relative px-3 py-2.5 text-left text-sm rounded-lg border transition-all ${questionStyle === style.value
                                                            ? "bg-blue-50/50 border-black text-black font-bold ring-1 ring-black/5 shadow-sm"
                                                            : "bg-white border-gray-200 hover:border-gray-300 text-gray-500"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        {style.label}
                                                        {/* Tooltip Indicator */}
                                                        <HelpCircle className={`w-3.5 h-3.5 group-hover:text-gray-400 ${questionStyle === style.value ? 'text-black' : 'text-gray-300'}`} />
                                                    </div>

                                                    {/* Tooltip */}
                                                    <div className="absolute left-0 bottom-full mb-2 w-56 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none shadow-xl transform translate-y-1 group-hover:translate-y-0">
                                                        <span className="font-bold flex items-center gap-1 mb-1 text-gray-300">
                                                            <HelpCircle className="w-3 h-3" /> Info
                                                        </span>
                                                        {style.description}
                                                        <div className="absolute -bottom-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Lesson / Summary Settings */}
                            {(contentType === "lesson" || contentType === "lecture") && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Tone of Voice</label>
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            {WRITING_TONES.map(tone => (
                                                <button
                                                    key={tone.value}
                                                    onClick={() => setWritingTone(tone.value)}
                                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${writingTone === tone.value
                                                            ? "bg-white shadow-sm text-black ring-1 ring-black/5 font-bold"
                                                            : "text-gray-500 hover:text-gray-700"
                                                        }`}
                                                >
                                                    {tone.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">องค์ประกอบ</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {CONTENT_ELEMENTS.map(elem => (
                                                <label key={elem} className={`flex items-center gap-2 text-sm cursor-pointer py-1.5 px-2 rounded -mx-2 transition-all ${contentElements.includes(elem) ? "bg-blue-50/50 text-black font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${contentElements.includes(elem) ? "bg-black border-black text-white" : "border-gray-300"}`}>
                                                        {contentElements.includes(elem) && <Check className="w-3 h-3" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={contentElements.includes(elem)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setContentElements([...contentElements, elem]);
                                                            else setContentElements(contentElements.filter(el => el !== elem));
                                                        }}
                                                    />
                                                    {elem}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Video Summary Settings */}
                            {contentType === "video-summary" && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">รูปแบบการสรุป</label>
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            {SUMMARY_TONES.map(tone => (
                                                <button
                                                    key={tone.value}
                                                    onClick={() => setSummaryTone(tone.value)}
                                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${summaryTone === tone.value
                                                            ? "bg-white shadow-sm text-black ring-1 ring-black/5 font-bold"
                                                            : "text-gray-500 hover:text-gray-700"
                                                        }`}
                                                >
                                                    {tone.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Output (40%) */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-6">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Terminal className="w-4 h-4" /> Generated Prompt
                                </h2>
                                <button
                                    onClick={generatePrompt}
                                    disabled={!isFormValid}
                                    className={`h-6 text-xs px-2 flex items-center bg-transparent border-none cursor-pointer transition-colors ${!isFormValid ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-black"}`}
                                >
                                    <Sparkles className="w-3 h-3 mr-1" /> Refresh
                                </button>
                            </div>

                            <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col h-[calc(100vh-120px)] transition-all">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-[#1e1e1e]">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center"></div>
                                    </div>
                                    <span className="text-[10px] ml-2 text-gray-500 font-mono">prompt_v1.json</span>
                                </div>
                                <textarea
                                    className="flex-1 bg-[#1e1e1e] text-green-400 p-4 font-mono text-xs resize-none focus:outline-none leading-relaxed selection:bg-green-900"
                                    value={generatedPrompt}
                                    readOnly
                                    placeholder={isFormValid ? "// Click 'Copy Code' to generate and copy the prompt..." : "// Please fill in the Topic/Subject to enable generation..."}
                                />
                                <div className="p-4 bg-[#1e1e1e] border-t border-gray-800">
                                    <button
                                        className={`w-full h-10 text-sm font-medium transition-all rounded-md flex items-center justify-center ${!generatedPrompt || !isFormValid
                                                ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
                                                : isCopied
                                                    ? "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-900/20 transform scale-[1.02]"
                                                    : "bg-white text-black hover:bg-gray-200"
                                            }`}
                                        onClick={copyToClipboard}
                                        disabled={!generatedPrompt || !isFormValid}
                                    >
                                        {isCopied ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2" /> Copied! ✅
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4 mr-2" /> Copy to Clipboard
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex items-start gap-3 p-3 bg-blue-50 rounded-lg text-blue-700 text-xs shadow-sm">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <p>นำ Prompt ที่ได้ไปวางใน Gemini หรือ AI Tools เพื่อสร้างเอกสารตามรูปแบบที่คุณกำหนด</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TargetIcon(props: any) {
    return (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    );
}
