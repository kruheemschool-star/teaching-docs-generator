"use client";

import { useState, useEffect, useMemo } from "react";
import { Copy, Check, ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import {
    ClassLevel,
    Semester,
    SubjectType,
    CLASS_LEVELS,
    SEMESTERS,
    SUBJECT_TYPES,
    isSecondaryLevel,
    getTopics,
} from "@/lib/curriculumData";

type ContentType = "lesson" | "lecture" | "exercise" | "exam";
type Difficulty = "basic" | "intermediate" | "advanced" | "word-problem" | "mixed";
type TeachingStyle = "standard" | "real-world" | "gamification" | "step-by-step";
type WritingTone = "friendly" | "formal" | "professional" | "mentor";
type ContentElement = "theory" | "techniques" | "formulas" | "examples" | "practice";
type TeachingApproach = "visual" | "conceptual" | "procedural" | "discovery";
type LessonDepth = "introduction" | "standard" | "deep-dive";
type ExampleStyle = "instant" | "funny" | "real-world" | "game" | "gradual";

const DIFFICULTIES: { value: Difficulty; label: string; icon: string; description: string }[] = [
    { value: "basic", label: "ง่าย", icon: "🟢", description: "เน้นความจำ ความเข้าใจพื้นฐาน" },
    { value: "intermediate", label: "ปานกลาง", icon: "🟡", description: "เน้นการประยุกต์ใช้" },
    { value: "advanced", label: "ยาก", icon: "🔴", description: "โจทย์แข่งขัน พลิกแพลง" },
    { value: "word-problem", label: "โจทย์ปัญหา", icon: "🔥", description: "เน้นการตีความ" },
    { value: "mixed", label: "คละความยาก (กำหนดเอง)", icon: "⚖️", description: "ปรับสัดส่วนเอง" },
];

const TEACHING_STYLES: { value: TeachingStyle; label: string; icon: string; description: string }[] = [
    { value: "standard", label: "มาตรฐาน", icon: "📋", description: "โจทย์แบบปกติ" },
    { value: "real-world", label: "สถานการณ์จริง", icon: "🌍", description: "ยกตัวอย่างจากชีวิตจริง" },
    { value: "gamification", label: "เกมมิฟิเคชัน", icon: "🎮", description: "ผูกเรื่องราวเป็นเกม" },
    { value: "step-by-step", label: "เฉลยละเอียด", icon: "📖", description: "อธิบายทุกขั้นตอน" },
];

const WRITING_TONES: { value: WritingTone; label: string; icon: string; description: string }[] = [
    { value: "friendly", label: "เป็นกันเอง", icon: "😊", description: "ครูใจดีสอนศิษย์ เข้าใจง่าย เปรียบเทียบเห็นภาพ" },
    { value: "formal", label: "ทางการ", icon: "📄", description: "ภาษาทางการ สุภาพ ถูกต้องตามหลักวิชาการ" },
    { value: "professional", label: "จริงจัง", icon: "🎓", description: "เน้นความถูกต้อง" },
    { value: "mentor", label: "พี่สอนน้อง", icon: "👨‍🏫", description: "อบอุ่น ให้กำลังใจ" },
];

const CONTENT_ELEMENTS: { value: ContentElement; label: string; icon: string }[] = [
    { value: "theory", label: "ทฤษฎี/เนื้อหา", icon: "📚" },
    { value: "techniques", label: "เทคนิค/วิธีคิด", icon: "💡" },
    { value: "formulas", label: "สูตร", icon: "📐" },
    { value: "examples", label: "ตัวอย่าง", icon: "✏️" },
    { value: "practice", label: "แบบฝึกหัดท้ายบท", icon: "📝" },
];

// Options specific to "lesson" (เนื้อหา) type
const TEACHING_APPROACHES: { value: TeachingApproach; label: string; icon: string; description: string }[] = [
    { value: "visual", label: "เน้นภาพ", icon: "🎨", description: "ใช้รูปภาพ แผนภาพ กราฟประกอบ" },
    { value: "conceptual", label: "เน้นแนวคิด", icon: "🧠", description: "อธิบาย Why ก่อน How" },
    { value: "procedural", label: "เน้นขั้นตอน", icon: "📊", description: "สอนทีละขั้น 1-2-3" },
    { value: "discovery", label: "เรียนรู้ด้วยตัวเอง", icon: "🔍", description: "ชวนคิด ค้นพบคำตอบเอง" },
];

const LESSON_DEPTHS: { value: LessonDepth; label: string; icon: string; description: string }[] = [
    { value: "introduction", label: "แนะนำเบื้องต้น", icon: "🌱", description: "สำหรับเริ่มเรียนเรื่องใหม่" },
    { value: "standard", label: "มาตรฐาน", icon: "📖", description: "ตามหลักสูตร ครบถ้วน" },
    { value: "deep-dive", label: "เจาะลึก", icon: "🌊", description: "ลงรายละเอียด เข้าใจถ่องแท้" },
];

const EXAMPLE_STYLES: { value: ExampleStyle; label: string; icon: string; description: string }[] = [
    { value: "gradual", label: "ค่อยๆ ยาก (Gradual)", icon: "📈", description: "เริ่มจากพื้นฐาน -> ยากขึ้นเรื่อยๆ" },
    { value: "real-world", label: "จุดที่มักผิดบ่อย (Common Mistakes)", icon: "⚠️", description: "เน้นโจทย์ที่นักเรียนมักทำผิด พร้อมวิธีแก้ไข" },
    { value: "instant", label: "เข้าใจทันที", icon: "🎯", description: "ตัวอย่างง่ายๆ ตรงไปตรงมา" },
    { value: "funny", label: "ตลกขบขัน", icon: "😂", description: "ใช้สถานการณ์ตลก จำง่าย" },
    { value: "game", label: "เกม/การ์ตูน", icon: "🎮", description: "เชื่อมโยงกับเกม/การ์ตูน" },
];

export default function PromptBuilder() {
    // Form state
    const [classLevel, setClassLevel] = useState<ClassLevel>("ม.1");
    const [semester, setSemester] = useState<Semester>("semester1");
    const [subjectType, setSubjectType] = useState<SubjectType>("basic");
    const [topic, setTopic] = useState("");
    const [customTopic, setCustomTopic] = useState("");
    const [contentType, setContentType] = useState<ContentType>("exam");
    const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
    const [teachingStyle, setTeachingStyle] = useState<TeachingStyle>("standard");
    const [itemCount, setItemCount] = useState(10);

    // Lecture-specific options
    const [writingTone, setWritingTone] = useState<WritingTone>("friendly");
    const [contentElements, setContentElements] = useState<ContentElement[]>(["theory", "examples"]);

    // Lesson-specific options
    const [teachingApproach, setTeachingApproach] = useState<TeachingApproach>("procedural");
    const [lessonDepth, setLessonDepth] = useState<LessonDepth>("standard");
    const [includeExamples, setIncludeExamples] = useState(true);
    const [exampleCount, setExampleCount] = useState(3);
    const [includePractice, setIncludePractice] = useState(false); // Default false as requested to remove
    const [practiceCount, setPracticeCount] = useState(5);
    const [exampleStyle, setExampleStyle] = useState<ExampleStyle>("gradual");

    const [subTopic, setSubTopic] = useState("");

    // Creation Method
    type CreationMethod = "freestyle" | "reference";
    const [creationMethod, setCreationMethod] = useState<CreationMethod>("freestyle");

    // Additional Instructions
    const [additionalInstructions, setAdditionalInstructions] = useState("");

    // Mixed Difficulty Distribution
    const [difficultyDistribution, setDifficultyDistribution] = useState({
        basic: 3,
        intermediate: 4,
        advanced: 3,
        wordProblem: 0
    });

    // Update itemCount when mixed distribution changes
    useEffect(() => {
        if (difficulty === 'mixed') {
            const total = difficultyDistribution.basic + difficultyDistribution.intermediate + difficultyDistribution.advanced + difficultyDistribution.wordProblem;
            setItemCount(total);
        }
    }, [difficulty, difficultyDistribution]);

    // UI state
    const [generatedPrompt, setGeneratedPrompt] = useState("");
    const [copied, setCopied] = useState(false);

    // Get available topics based on current selection
    const availableTopics = useMemo(() => {
        return getTopics(classLevel, semester, subjectType);
    }, [classLevel, semester, subjectType]);

    // Reset topic when curriculum options change
    useEffect(() => {
        setTopic("");
        setCustomTopic("");
    }, [classLevel, semester, subjectType]);

    // Generate prompt when any relevant state changes
    useEffect(() => {
        generatePrompt();
    }, [topic, customTopic, classLevel, semester, subjectType, contentType, difficulty, teachingStyle, itemCount, writingTone, contentElements, teachingApproach, lessonDepth, includeExamples, includePractice, subTopic, exampleStyle, creationMethod, additionalInstructions, difficultyDistribution, exampleCount, practiceCount]);

    const getDisplayGradeLevel = () => {
        const levelInfo = CLASS_LEVELS.find(l => l.value === classLevel);
        const semesterInfo = SEMESTERS.find(s => s.value === semester);
        const subjectInfo = isSecondaryLevel(classLevel)
            ? ` (${SUBJECT_TYPES.find(s => s.value === subjectType)?.label})`
            : "";
        return `${levelInfo?.label} ${semesterInfo?.label}${subjectInfo}`;
    };

    const getTopicForPrompt = () => {
        return customTopic || topic || "[TOPIC]";
    };

    const getDifficultyInstruction = () => {
        switch (difficulty) {
            case "basic":
                return "DIFFICULTY: BASIC (ง่าย). Create questions that focus on BASIC RECALL and fundamental understanding.\nIMPORTANT: ALL questions must be 'ง่าย' (Basic) level only. Do NOT include harder questions.";
            case "intermediate":
                return "DIFFICULTY: INTERMEDIATE (ปานกลาง). Create questions that require APPLICATION of concepts.\nIMPORTANT: ALL questions must be 'ปานกลาง' (Intermediate) level only. Do NOT include advanced questions.";
            case "advanced":
                return "DIFFICULTY: ADVANCED (ยาก). Create CHALLENGING questions that require ANALYSIS and PROBLEM-SOLVING.\nIMPORTANT: ALL questions must be 'ยาก' (Advanced) level only. Focus on complex calculations and logic. Do NOT include 'Word Problems' (โจทย์ปัญหา).";
            case "word-problem":
                return "DIFFICULTY: WORD PROBLEMS (โจทย์ปัญหา). Create questions that require reading comprehension and interpretation of real situations.\nIMPORTANT: ALL questions must be 'โจทย์ปัญหา' (Word Problem) level only. Do NOT include pure calculation questions without story/context.";
            case "mixed":
                return `DIFFICULTY: MIXED. Create exactly ${itemCount} questions with the following difficulty breakdown:
- Basic (ง่าย): ${difficultyDistribution.basic} questions
- Intermediate (ปานกลาง): ${difficultyDistribution.intermediate} questions
- Advanced (ยาก): ${difficultyDistribution.advanced} questions
- Word Problems (โจทย์ปัญหา): ${difficultyDistribution.wordProblem} questions

IMPORTANT: Strictly follow these counts.`;
        }
    };

    const getTeachingStyleInstruction = () => {
        switch (teachingStyle) {
            case "standard":
                return "";
            case "real-world":
                return "\nIMPORTANT: Frame all questions using REAL-WORLD SCENARIOS and practical examples from daily life (e.g., shopping, cooking, sports, online business, travel).";
            case "gamification":
                return "\nIMPORTANT: Frame all questions as part of an ADVENTURE GAME STORY. Include characters, quests, and game-like narratives (e.g., heroes, treasure hunting, solving mysteries).";
            case "step-by-step":
                return "\nIMPORTANT: Provide EXTREMELY DETAILED step-by-step explanations for EVERY answer. Show all work, formulas used, and reasoning process clearly.";
        }
    };

    const getWritingToneInstruction = () => {
        switch (writingTone) {
            case "friendly":
                return "Use a 'FRIENDLY TEACHER' tone (ครูใจดีสอนศิษย์). Write as if you are a kind teacher explaining to a student one-on-one.\nIMPORTANT: Explain concepts using ANALOGIES/COMPARISONS to simple, clearly visible everyday things (เปรียบเทียบกับสิ่งง่ายๆ ที่เห็นภาพชัดเจน).\nIMPORTANT: Use SHORT but SHARP/PUNCHY words that have deep meaning (คำสั้นๆ แต่คม ลึกซึ้ง).\nMake it feel warm, encouraging, and immediately understandable.";
            case "formal":
                return "Use a FORMAL and ACADEMIC tone. Write professionally with proper Thai academic language. Avoid colloquialisms. Focus on accuracy and correctness.";
            case "professional":
                return "Use a SERIOUS and PRECISE tone. Focus on accuracy and clarity. Be thorough and systematic in explanations.";
            case "mentor":
                return "Use a WARM and ENCOURAGING tone like an older sibling teaching a younger one. Give motivation, use phrases like 'ง่ายมากเลย', 'พี่เชื่อว่าน้องทำได้', and be patient in explanations.";
        }
    };

    const getExampleStyleInstruction = () => {
        switch (exampleStyle) {
            case "gradual":
                return "Use 'PROGRESSIVE' examples. Start with a very easy one (basic concept), then a medium one (application), then a hard one (complex/twist). Scaffold the learning.";
            case "real-world": // Utilizing 'real-world' key for 'Common Mistakes' to avoid changing type significantly if not needed, or better yet updating the type. Let's stick to valid keys or update type? Type is string.
                return "Use examples that focus on 'COMMON STUDENT MISTAKES'. Show a problem, show the WRONG way students usually do it, explain WHY it is wrong, and then show the CORRECT method.";
            case "instant": // Fallback
                return "Use simple examples.";
            case "funny":
                return "Use funny examples.";
            case "game":
                return "Use game examples.";
        }
    };

    const getContentElementsInstruction = () => {
        const elements: string[] = [];
        if (contentElements.includes("theory")) elements.push("Theoretical explanations and core concepts");
        if (contentElements.includes("techniques")) elements.push("Problem-solving techniques and thinking methods");
        if (contentElements.includes("formulas")) elements.push("Important formulas with clear explanations of each variable");
        if (contentElements.includes("examples")) elements.push("Worked examples with step-by-step solutions");
        if (contentElements.includes("practice")) elements.push("Practice problems at the end for students to try");

        if (elements.length === 0) return "";
        return "\n\nINCLUDE THE FOLLOWING ELEMENTS:\n- " + elements.join("\n- ");
    };

    const toggleContentElement = (element: ContentElement) => {
        setContentElements(prev =>
            prev.includes(element)
                ? prev.filter(e => e !== element)
                : [...prev, element]
        );
    };

    const getLessonDepthInstruction = () => {
        switch (lessonDepth) {
            case "introduction":
                return "Create an INTRODUCTORY level lesson. Keep it simple, focus on basic concepts only. Avoid complex details. Suitable for students meeting this topic for the first time.";
            case "standard":
                return "Create a STANDARD level lesson. Cover all essential curriculum content thoroughly but concisely. Include common examples and typical problem types.";
            case "deep-dive":
                return "Create a DEEP-DIVE level lesson. Go beyond the basics. Include advanced concepts, edge cases, common misconceptions, and why certain approaches work.";
        }
    };

    const generatePrompt = () => {
        const topicText = getTopicForPrompt();
        const gradeText = getDisplayGradeLevel();
        const subTopicText = subTopic ? `\n\nSPECIFIC SUB-TOPIC: Focus specifically on "${subTopic}" within the broader topic. Make the content detailed and targeted to this specific sub-topic only.` : '';

        const methodInstruction = creationMethod === 'reference'
            ? "\nREFERENCE DOCUMENT: I have attached a document/file. Please analyze it and create the content strictly following its style, format, and scope. Use it as the primary source of truth."
            : "";

        const additionalText = additionalInstructions ? `\n\nADDITIONAL INSTRUCTIONS: ${additionalInstructions}` : "";

        // Core instruction
        const baseInstruction = `You are an expert Thai mathematics teacher assistant. Create a JSON file for a teaching document about "${topicText}" for ${gradeText} students.${subTopicText}${methodInstruction}${additionalText}

${contentType === "lesson" || contentType === "lecture" ? `WRITING TONE: ${getWritingToneInstruction()}` : `${getDifficultyInstruction()}${getTeachingStyleInstruction()}`}

Strictly output ONLY valid JSON code inside a markdown code block (\`\`\`json ... \`\`\`) for easy copying. Do not include any additional text outside the code block.
The JSON must follow this exact typescript interface structure:

interface CourseDocument {
  documentMetadata: {
    title: string;
    subtitle: string;
    instructor: string;
    date: string;
  };
  sections: Section[];
}

`;

        let typeSpecificInstruction = "";

        if (contentType === "exam") {
            typeSpecificInstruction = `
type Section = {
  type: "exam";
  id: string;
  title: string;
  questions: {
    text: string;
    options: string[]; // Array of 4 strings
    correctOption: number; // 0-3
    explanation: string; // Detailed explanation for the answer
    difficulty: 'ง่าย' | 'ปานกลาง' | 'ยาก' | 'โจทย์ปัญหา'; // Difficulty level
  }[];
};

Make sure to create exactly ${itemCount} multiple-choice questions with 4 options each.
IMPORTANT: The 'explanation' field MUST be EXTREMELY DETAILED and EASY TO UNDERSTAND.
   - Explain every single step of the calculation/logic clearly.
   - MUST include a "Caution" (ข้อควรระวัง) or "Common Mistake" point in the explanation to warn students.
   - Do not just say "A is correct". Show the full work.
IMPORTANT: For EVERY question, clearly specify the 'difficulty' level ('ง่าย', 'ปานกลาง', 'ยาก', or 'โจทย์ปัญหา').
`;
        } else if (contentType === "exercise") {
            typeSpecificInstruction = `
type Section = {
  type: "exercise";
  id: string;
  title: string;
  items: {
    question: string;
    answer: string; // The correct answer
    detailedSolution: string; // Full step-by-step solution method
    difficulty: 'ง่าย' | 'ปานกลาง' | 'ยาก' | 'โจทย์ปัญหา'; // Difficulty level
  }[];
};

Make sure to create exactly ${itemCount} practice questions.
IMPORTANT: The 'detailedSolution' MUST be EXTREMELY DETAILED and EASY TO UNDERSTAND.
   - Show the full STEP-BY-STEP calculation method.
   - MUST include a "Caution" (ข้อควรระวัง) or "Key Trick" to help students solve it faster or avoid mistakes.
IMPORTANT: For EVERY item, clearly specify the 'difficulty' level ('ง่าย', 'ปานกลาง', 'ยาก', or 'โจทย์ปัญหา').
IMPORTANT: Do NOT include 'spaceForWork' or 'lines'.
`;
        } else if (contentType === "lecture") {
            typeSpecificInstruction = `
type Section = {
  type: "lecture";
  id: string;
  title: string;
  content: string; // Markdown supported content with LaTeX math support
  keyPoints: string[]; // Summary list
  difficulty?: string;
};

WRITING TONE: ${getWritingToneInstruction()}
${getContentElementsInstruction()}

Create a comprehensive lecture content with good structure (Headings, bullet points).
Use LaTeX notation for mathematical formulas (e.g., $x^2$ for inline, $$\\frac{a}{b}$$ for display).
`;
        } else if (contentType === "lesson") {
            typeSpecificInstruction = `
type Section = {
  type: "lesson";
  id: string;
  title: string;
  // objectives removed as requested
  prerequisites: string[]; // What students should know before this lesson
  content: string; // Detailed markdown content with step-by-step explanations
  examples: { problem: string; solution: string; }[]; // Worked examples
  practiceProblems?: { problem: string; hint?: string; solution: string; }[]; // Practice at end with solution
  keyTakeaways: string[]; // Main points to remember
};



LESSON DEPTH: ${getLessonDepthInstruction()}

${includeExamples
                    ? `IMPORTANT: Include exactly ${exampleCount} WORKED EXAMPLES.
    STYLE: ${getExampleStyleInstruction()}
    Format: Show the "Problem" followed by a "Solution" with detailed steps.`
                    : ""}
${includePractice ? `IMPORTANT: Include exactly ${practiceCount} PRACTICE PROBLEMS at the end.
CRITICAL: These questions must be derived from COMMON STUDENT MISTAKES (analyze where students fail and turn that into a question).
CRITICAL: You MUST provide a 'solution' for EVERY SINGLE problem. The solution must be DETAILED, showing the STEP-BY-STEP calculation method, not just the final answer.` : ""}

Structure the lesson as follows:
1. List any PREREQUISITES students need (Skip formal objectives)
2. Build the CONTENT gradually from simple to complex
3. Use plenty of EXAMPLES throughout
4. End with KEY TAKEAWAYS

IMPORTANT: Start the lecture immediately with the core content. Do not use any "Hook" or "Slogan" options.


`;
        }

        const prompt = `${baseInstruction}${typeSpecificInstruction}
Example JSON Structure:
        {
            "documentMetadata": {
                "title": "${topicText}",
                    "subtitle": "${gradeText}",
                        "instructor": "AI Teacher",
                            "date": "2024"
            },
            "sections": [
                {
                    "type": "${contentType}",
                    "id": "1",
                    "title": "${topicText} ${contentType === 'exam' ? 'Test' : contentType === 'exercise' ? 'Exercise' : contentType === 'lesson' ? 'บทเรียน' : 'สรุป'}",
                    ${contentType === 'exam' ? '"questions": [...]' : contentType === 'exercise' ? '"items": [...]' : contentType === 'lesson' ? '"objectives": [...], "prerequisites": [...], "content": "...", "examples": [...], "keyTakeaways": []' : '"content": "...", "keyPoints": [...]'}
    }
  ]
} `;

        setGeneratedPrompt(prompt);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openGemini = () => {
        navigator.clipboard.writeText(generatedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        window.open("https://gemini.google.com/", "_blank");
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#37352f] p-8 font-sarabun font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/" className="p-2 hover:bg-[#efefed] rounded transition text-gray-600 hover:text-black">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-black">สร้างคำสั่ง AI (Prompt Generator)</h1>
                        <p className="text-gray-600 mt-1 font-medium">สร้างชุดคำสั่งเพื่อนำไปให้ AI ช่วยเขียนเนื้อหาการสอน</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Form */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Section: Grade Selection */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
                            <h3 className="font-bold text-black text-lg flex items-center gap-2">
                                📚 ระดับชั้นและภาคเรียน
                            </h3>

                            {/* Class Level */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">ระดับชั้น</label>
                                <select
                                    value={classLevel}
                                    onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-black font-medium appearance-none focus:ring-2 focus:ring-black cursor-pointer"
                                >
                                    <optgroup label="ประถมศึกษา">
                                        {CLASS_LEVELS.filter(l => l.group === "ประถมศึกษา").map(level => (
                                            <option key={level.value} value={level.value}>{level.label}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="มัธยมศึกษา">
                                        {CLASS_LEVELS.filter(l => l.group === "มัธยมศึกษา").map(level => (
                                            <option key={level.value} value={level.value}>{level.label}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            {/* Semester */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">ภาคเรียน</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SEMESTERS.map(sem => (
                                        <button
                                            key={sem.value}
                                            onClick={() => setSemester(sem.value)}
                                            className={`p-3 rounded-lg text-center transition border font-medium ${semester === sem.value
                                                ? "bg-black text-white border-black"
                                                : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                                                } `}
                                        >
                                            {sem.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Subject Type - Only for secondary levels */}
                            {isSecondaryLevel(classLevel) && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">ประเภทวิชา</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {SUBJECT_TYPES.map(subject => (
                                            <button
                                                key={subject.value}
                                                onClick={() => setSubjectType(subject.value)}
                                                className={`p-3 rounded-lg text-center transition-all border-2 font-medium ${subjectType === subject.value
                                                    ? "bg-purple-50 text-purple-700 border-purple-500"
                                                    : "bg-white hover:bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-200"
                                                    } `}
                                            >
                                                {subject.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section: Topic */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-black text-lg flex items-center gap-2">
                                🧠 หัวข้อเรื่อง (Topic)
                            </h3>

                            {/* Suggested Topics */}
                            {availableTopics.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">เลือกจากหลักสูตร สสวท.</label>
                                    <select
                                        value={topic}
                                        onChange={(e) => {
                                            setTopic(e.target.value);
                                            setCustomTopic("");
                                        }}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-black font-medium appearance-none focus:ring-2 focus:ring-black cursor-pointer"
                                    >
                                        <option value="">-- เลือกหัวข้อ --</option>
                                        {availableTopics.map((t, idx) => (
                                            <option key={idx} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Custom Topic */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">
                                    {availableTopics.length > 0 ? "หรือพิมพ์หัวข้อเอง" : "พิมพ์หัวข้อ"}
                                </label>
                                <input
                                    type="text"
                                    value={customTopic}
                                    onChange={(e) => {
                                        setCustomTopic(e.target.value);
                                        if (e.target.value) setTopic("");
                                    }}
                                    placeholder="เช่น การบวกเลขสองหลัก, พื้นที่สี่เหลี่ยม"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 font-medium focus:ring-2 focus:ring-black placeholder-gray-400 text-black"
                                />
                            </div>

                            {/* Sub-Topic - For ALL content types */}
                            {(topic || customTopic) && (
                                <div className="space-y-2 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-bold text-gray-700">
                                            📌 หัวข้อย่อย (เจาะจงเนื้อหาที่ต้องการ)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const mainTopic = customTopic || topic;
                                                const promptText = `สำหรับวิชาคณิตศาสตร์ ${getDisplayGradeLevel()} เรื่อง "${mainTopic}"

ช่วยแนะนำหัวข้อย่อยที่ควรสอน(แบ่งเป็นบทย่อยๆ) โดยเรียงลำดับจากง่ายไปยาก

ตอบเป็นรายการ 8 - 12 หัวข้อ เช่น:
1. ความหมายของ...
2. การ...
3. ...`;
                                                navigator.clipboard.writeText(promptText);
                                                alert('📋 คัดลอก prompt แล้ว!\n\nไปวางใน Gemini/ChatGPT เพื่อให้ AI แนะนำหัวข้อย่อย แล้วนำมาใส่ในช่องด้านล่าง');
                                            }}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition font-bold flex items-center gap-1"
                                        >
                                            🤖 AI แนะนำหัวข้อย่อย
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={subTopic}
                                        onChange={(e) => setSubTopic(e.target.value)}
                                        placeholder="เช่น 'ความหมายของอัตราส่วน' หรือ 'การหาค่าที่หายไปในสัดส่วน'"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 font-medium focus:ring-2 focus:ring-purple-500 placeholder-gray-400 text-black"
                                    />
                                    <p className="text-xs text-gray-500">
                                        💡 ระบุหัวข้อย่อยเพื่อให้ AI สร้างเนื้อหาที่เจาะจงและกระชับมากขึ้น
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Section: Creation Method (Reference vs Freestyle) */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-black text-lg flex items-center gap-2">
                                📎 แหล่งข้อมูลอ้างอิง
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setCreationMethod("freestyle")}
                                    className={`p-4 rounded-xl text-left transition-all border-2 relative group ${creationMethod === "freestyle"
                                        ? "bg-purple-50 border-purple-500 text-purple-900 shadow-sm"
                                        : "bg-white hover:bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-200"
                                        } `}
                                >
                                    <div className="flex items-center gap-2 font-bold mb-1 text-base">
                                        <span className="text-xl">✨</span>
                                        <span>ออกแบบอิสระ</span>
                                    </div>
                                    <p className={`text-sm ${creationMethod === "freestyle" ? "text-purple-700" : "text-gray-400"} `}>
                                        ให้ AI ออกแบบเนื้อหาเองตามความเหมาะสม
                                    </p>
                                    {creationMethod === "freestyle" && (
                                        <div className="absolute top-3 right-3 text-purple-500"><Check className="w-5 h-5" /></div>
                                    )}
                                </button>

                                <button
                                    onClick={() => setCreationMethod("reference")}
                                    className={`p-4 rounded-xl text-left transition-all border-2 relative group ${creationMethod === "reference"
                                        ? "bg-purple-50 border-purple-500 text-purple-900 shadow-sm"
                                        : "bg-white hover:bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-200"
                                        } `}
                                >
                                    <div className="flex items-center gap-2 font-bold mb-1 text-base">
                                        <span className="text-xl">📄</span>
                                        <span>อิงจากเอกสาร</span>
                                    </div>
                                    <p className={`text-sm ${creationMethod === "reference" ? "text-purple-700" : "text-gray-400"} `}>
                                        สร้างโดยยึดตามไฟล์/เอกสารที่แนบ
                                    </p>
                                    {creationMethod === "reference" && (
                                        <div className="absolute top-3 right-3 text-purple-500"><Check className="w-5 h-5" /></div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Section: Content Type */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="font-bold text-black text-lg flex items-center gap-2">
                                📝 ประเภทเนื้อหา
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'lesson', label: 'เนื้อหา (Lesson)', icon: '📖', desc: 'ปูพื้นฐาน อธิบายละเอียด' },
                                    { id: 'exercise', label: 'แบบฝึกหัด (Exercise)', icon: '✏️', desc: 'ข้อสอบเติมคำตอบ' },
                                    { id: 'exam', label: 'ข้อสอบ (Exam)', icon: '📝', desc: 'แบบปรนัย 4 ตัวเลือก' },
                                    { id: 'lecture', label: 'สรุปเนื้อหา (Summary)', icon: '📚', desc: 'ทบทวน รวบรัด' }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setContentType(type.id as ContentType)}
                                        className={`p-4 rounded-xl text-left transition-all flex items-center gap-4 border-2 ${contentType === type.id
                                            ? "bg-purple-50 border-purple-500 text-purple-900 shadow-sm"
                                            : "bg-white hover:bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-200"
                                            } `}
                                    >
                                        <div className={`p-3 rounded-full ${contentType === type.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <span className="text-xl">{type.icon}</span>
                                        </div>
                                        <div>
                                            <span className="block font-bold text-base">{type.label}</span>
                                            <span className={`text-sm ${contentType === type.id ? "text-purple-700" : "text-gray-400"} `}>{type.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section: Writing Tone - For lesson and lecture */}
                        {(contentType === "lesson" || contentType === "lecture") && (
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <h3 className="font-bold text-black text-lg flex items-center gap-2">
                                    ✍️ โทนการเขียน
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {WRITING_TONES.map(tone => (
                                        <button
                                            key={tone.value}
                                            onClick={() => setWritingTone(tone.value)}
                                            className={`p-3 rounded-xl text-left transition-all border-2 ${writingTone === tone.value
                                                ? "bg-purple-50 border-purple-500 shadow-sm"
                                                : "bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200"
                                                } `}
                                        >
                                            <div className="flex items-center gap-2 font-bold text-gray-800">
                                                <span>{tone.icon}</span>
                                                <span>{tone.label}</span>
                                            </div>
                                            <p className={`text-xs mt-1 ${writingTone === tone.value ? "text-purple-700" : "text-gray-400"} `}>
                                                {tone.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section: Teaching Approach - Only for lesson */}
                        {contentType === "lesson" && (
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <h3 className="font-bold text-black text-lg flex items-center gap-2">
                                    🎯 วิธีการสอน
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {TEACHING_APPROACHES.map(approach => (
                                        <button
                                            key={approach.value}
                                            onClick={() => setTeachingApproach(approach.value)}
                                            className={`p-3 rounded-xl text-left transition-all border-2 ${teachingApproach === approach.value
                                                ? "bg-purple-50 border-purple-500 shadow-sm"
                                                : "bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200"
                                                } `}
                                        >
                                            <div className="flex items-center gap-2 font-bold text-gray-800">
                                                <span>{approach.icon}</span>
                                                <span>{approach.label}</span>
                                            </div>
                                            <p className={`text-xs mt-1 ${teachingApproach === approach.value ? "text-purple-700" : "text-gray-400"} `}>
                                                {approach.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section: Lesson Depth - Only for lesson */}
                        {contentType === "lesson" && (
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <h3 className="font-bold text-black text-lg flex items-center gap-2">
                                    📊 ความลึกของเนื้อหา
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {LESSON_DEPTHS.map(depth => (
                                        <button
                                            key={depth.value}
                                            onClick={() => setLessonDepth(depth.value)}
                                            className={`p-3 rounded-xl text-center transition-all border-2 ${lessonDepth === depth.value
                                                ? "bg-purple-50 border-purple-500 shadow-sm"
                                                : "bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200"
                                                } `}
                                        >
                                            <div className="text-2xl mb-1">{depth.icon}</div>
                                            <div className="font-bold text-sm text-gray-800">{depth.label}</div>
                                            <p className={`text-xs mt-1 ${lessonDepth === depth.value ? "text-purple-700" : "text-gray-400"} `}>
                                                {depth.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section: Lesson Options - Only for lesson */}
                        {contentType === "lesson" && (
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <h3 className="font-bold text-black text-lg flex items-center gap-2">
                                    ⚙️ ตัวเลือกเพิ่มเติม
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
                                        <label className="flex items-center gap-3 cursor-pointer mb-2">
                                            <input
                                                type="checkbox"
                                                checked={includeExamples}
                                                onChange={(e) => setIncludeExamples(e.target.checked)}
                                                className="w-5 h-5 accent-purple-600 rounded bg-white border-gray-300"
                                            />
                                            <div>
                                                <span className="font-bold text-gray-800">✏️ ใส่ตัวอย่างพร้อมเฉลย</span>
                                                <p className="text-xs text-gray-500">แสดงวิธีทำโจทย์ทีละขั้นตอน</p>
                                            </div>
                                        </label>
                                        {includeExamples && (
                                            <div className="ml-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <span className="text-sm font-bold text-gray-600">จำนวน:</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={exampleCount}
                                                    onChange={(e) => setExampleCount(parseInt(e.target.value) || 1)}
                                                    className="w-16 border border-gray-300 rounded px-2 py-1 text-center font-bold text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                                />
                                                <span className="text-sm text-gray-500">ข้อ</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Practice Problems Section Removed */}
                                </div>

                                {/* Example Style Selector */}
                                {includeExamples && (
                                    <div className="pt-4 border-t border-gray-300 space-y-3">
                                        <label className="block text-sm font-bold text-gray-700">
                                            🎓 รูปแบบตัวอย่างประกอบเนื้อหา (Worked Examples)
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {EXAMPLE_STYLES.map(style => (
                                                <button
                                                    key={style.value}
                                                    onClick={() => setExampleStyle(style.value)}
                                                    className={`p-3 rounded-lg text-left transition border ${exampleStyle === style.value
                                                        ? "bg-purple-600 text-white border-purple-600"
                                                        : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                                                        } `}
                                                >
                                                    <div className="flex items-center gap-2 font-bold">
                                                        <span>{style.icon}</span>
                                                        <span>{style.label}</span>
                                                    </div>
                                                    <p className={`text-xs mt-1 ${exampleStyle === style.value ? "text-purple-200" : "text-gray-500"} `}>
                                                        {style.description}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Section: Content Elements - Only for lecture */}
                        {contentType === "lecture" && (
                            <div className="bg-[#F7F7F5] p-5 rounded-xl border border-gray-200 space-y-4">
                                <h3 className="font-bold text-black text-lg flex items-center gap-2">
                                    📦 องค์ประกอบเนื้อหา
                                </h3>
                                <p className="text-sm text-gray-600">เลือกสิ่งที่ต้องการให้ AI ใส่ในเนื้อหา</p>
                                <div className="flex flex-wrap gap-2">
                                    {CONTENT_ELEMENTS.map(element => (
                                        <button
                                            key={element.value}
                                            onClick={() => toggleContentElement(element.value)}
                                            className={`px-4 py-2 rounded-full text-sm transition border flex items-center gap-2 ${contentElements.includes(element.value)
                                                ? "bg-black text-white border-black font-bold"
                                                : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 font-medium"
                                                } `}
                                        >
                                            <span>{element.icon}</span>
                                            <span>{element.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section: Difficulty - Only for exam/exercise */}
                        {(contentType === "exam" || contentType === "exercise") && (
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <h3 className="font-bold text-black text-lg flex items-center gap-2">
                                    🎚️ ระดับความยาก
                                </h3>
                                <div className="space-y-3">
                                    {DIFFICULTIES.map(diff => (
                                        <button
                                            key={diff.value}
                                            onClick={() => setDifficulty(diff.value)}
                                            className={`w-full p-4 rounded-xl text-left transition-all border-2 flex items-center gap-4 group ${difficulty === diff.value
                                                ? "bg-purple-50 border-purple-500 shadow-md ring-1 ring-purple-500/20"
                                                : "bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200"
                                                } `}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 transition-colors ${difficulty === diff.value ? 'bg-white' : 'bg-gray-100 group-hover:bg-white'}`}>
                                                {diff.icon}
                                            </div>
                                            <div>
                                                <div className={`font-bold text-base mb-0.5 ${difficulty === diff.value ? "text-purple-900" : "text-gray-800"}`}>
                                                    {diff.label}
                                                </div>
                                                <p className={`text-sm ${difficulty === diff.value ? "text-purple-700" : "text-gray-500"} `}>
                                                    {diff.description}
                                                </p>
                                            </div>
                                            {difficulty === diff.value && (
                                                <div className="ml-auto text-purple-600">
                                                    <Check className="w-6 h-6" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Mixed Difficulty Controls */}
                                {difficulty === "mixed" && (
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="font-bold text-gray-800 flex items-center gap-2">
                                                <span className="text-xl">⚖️</span>
                                                กำหนดจำนวนข้อแต่ละระดับ
                                            </p>
                                            <div className="bg-white px-3 py-1 rounded-full border border-gray-200 text-sm font-mono">
                                                รวม: <span className="font-bold text-black">{itemCount}</span> ข้อ
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                { id: 'basic', label: 'ง่าย', icon: '🟢', desc: 'เน้นความจำ', color: 'bg-green-100 text-green-800 border-green-200' },
                                                { id: 'intermediate', label: 'ปานกลาง', icon: '🟡', desc: 'เน้นการประยุกต์', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                                                { id: 'advanced', label: 'ยาก', icon: '🔴', desc: 'วิเคราะห์/ซับซ้อน', color: 'bg-red-100 text-red-800 border-red-200' },
                                                { id: 'wordProblem', label: 'โจทย์ปัญหา', icon: '🔥', desc: 'สถานการณ์จริง', color: 'bg-orange-100 text-orange-800 border-orange-200' }
                                            ].map((type) => (
                                                <div key={type.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${type.color}`}>
                                                            {type.icon}
                                                        </span>
                                                        <div>
                                                            <div className="font-bold text-gray-800">{type.label}</div>
                                                            <div className="text-xs text-gray-400">{type.desc}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                                        <button
                                                            onClick={() => setDifficultyDistribution(prev => ({ ...prev, [type.id]: Math.max(0, (prev as Record<string, number>)[type.id] - 1) }))}
                                                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-gray-600 transition shadow-sm active:scale-95"
                                                        >
                                                            <span className="text-lg font-bold mb-0.5">-</span>
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-lg text-black font-mono">
                                                            {(difficultyDistribution as Record<string, number>)[type.id]}
                                                        </span>
                                                        <button
                                                            onClick={() => setDifficultyDistribution(prev => ({ ...prev, [type.id]: (prev as Record<string, number>)[type.id] + 1 }))}
                                                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-black transition shadow-sm active:scale-95"
                                                        >
                                                            <span className="text-lg font-bold mb-0.5">+</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}




                        {/* Section: Quantity - Only for exam/exercise */}
                        {(contentType === "exam" || contentType === "exercise") && (
                            <div className="bg-[#F7F7F5] p-5 rounded-xl border border-gray-200 space-y-4">
                                <h3 className="font-bold text-black text-lg flex items-center gap-2">
                                    🔢 จำนวนข้อ
                                </h3>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={itemCount}
                                        onChange={(e) => setItemCount(parseInt(e.target.value) || 0)}
                                        disabled={difficulty === 'mixed'}
                                        className={`flex-1 h-3 bg-gray-200 rounded-lg appearance-none accent-black ${difficulty === 'mixed' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} `}
                                    />
                                    <span className="w-16 text-right font-mono text-2xl font-bold text-black">{itemCount}</span>
                                </div>
                            </div>
                        )}

                        {/* Section: Additional Instructions (Free Text) */}
                        <div className="bg-[#F7F7F5] p-5 rounded-xl border border-gray-200 space-y-4">
                            <h3 className="font-bold text-black text-lg flex items-center gap-2">
                                💬 คำสั่งเพิ่มเติม (Optional)
                            </h3>
                            <div className="space-y-2">
                                <label className="block text-sm text-gray-600">
                                    ระบุความต้องการพิเศษ เช่น 'อิงตามแนว สสวท.', 'ขอโจทย์คล้ายๆ กับแนวข้อสอบเตรียมอุดม'
                                </label>
                                <textarea
                                    value={additionalInstructions}
                                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                                    placeholder="พิมพ์คำสั่งเพิ่มเติมที่นี่..."
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 font-medium focus:ring-2 focus:ring-black placeholder-gray-400 text-black min-h-[100px]"
                                />
                            </div>
                        </div>

                        {/* How to use */}
                        <div className="flex gap-3 text-gray-700 text-sm items-start bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <ExternalLink className="w-5 h-5 shrink-0 mt-0.5 text-black" />
                            <div>
                                <p className="font-bold text-black mb-2">วิธีใช้งาน</p>
                                <ol className="list-decimal list-inside space-y-1 text-gray-800">
                                    <li>เลือกระดับชั้น ภาคเรียน และหัวข้อ</li>
                                    <li>ตั้งค่าความยากและสไตล์ตามต้องการ</li>
                                    <li>กดปุ่ม <strong>Copy Prompt</strong> แล้วกด <strong>Open Gemini</strong></li>
                                    <li>วาง Prompt ใน Gemini แล้วนำ JSON มาใช้งาน</li>
                                </ol>
                            </div>
                        </div>

                    </div>

                    {/* Result */}
                    <div className="lg:col-span-7 flex flex-col h-full">
                        <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 text-sm font-mono text-gray-300 leading-relaxed overflow-hidden flex flex-col h-full relative shadow-2xl">
                            {/* Decorative Header */}
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xl shadow-lg animate-pulse">
                                        🤖
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg tracking-tight flex items-center gap-2">
                                            AI Command Center
                                            <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full uppercase tracking-wider">Generated Code</span>
                                        </h3>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                                            Ready to Copy
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={copyToClipboard}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all transform active:scale-95 border backdrop-blur-sm ${copied
                                            ? "bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20"
                                            }`}
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? "คัดลอกแล้ว" : "Copy Code"}
                                    </button>
                                    <button
                                        onClick={openGemini}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm text-sm font-bold transition transform active:scale-95 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Open Gemini
                                    </button>
                                </div>
                            </div>

                            <div className="relative flex-1 overflow-hidden rounded-lg bg-[#2d2d2d] border border-gray-700">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-50"></div>
                                <textarea
                                    readOnly
                                    value={generatedPrompt}
                                    className="w-full h-full bg-transparent resize-none outline-none text-green-400 font-mono p-4 text-xs leading-loose custom-scrollbar"
                                    style={{ fontFamily: "'Fira Code', monospace" }}
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] text-gray-500 bg-[#2d2d2d]/80 px-2 py-1 rounded backdrop-blur-sm border border-gray-700">
                                    Generated by Teaching Docs AI 🚀
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
