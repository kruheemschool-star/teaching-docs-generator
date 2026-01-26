import { Section, SectionType, ExamQuestion } from '@/types';

/**
 * Intelligent JSON Adapter
 * Attempts to convert ANY JSON input into a valid Section[] array.
 * Handles loose objects, missing fields, alternative keys, and nested structures.
 */
export const smartAdaptJson = (data: any): Section[] => {
    if (!data) return [];

    // --- 1. Normalize to Array ---
    let items: any[] = [];

    // Case: Wrapped in top-level keys
    if (data.sections && Array.isArray(data.sections)) items = data.sections;
    else if (data.data && Array.isArray(data.data)) items = data.data;
    else if (data.questions && Array.isArray(data.questions)) return adoptExamOrExercise(data); // Special case for pure exam object
    else if (Array.isArray(data)) items = data;
    else items = [data]; // Treat single object as item

    const result: Section[] = [];

    // --- 2. Process Items ---
    for (const item of items) {
        // Skip null/undefined
        if (!item) continue;

        // Strategy A: Already valid Section
        if (isValidSection(item)) {
            result.push({
                ...item,
                id: item.id || crypto.randomUUID()
            });
            continue;
        }

        // Strategy B: Detect Specific Content Types
        const adapted = tryAdaptItem(item);
        if (adapted) {
            result.push(adapted);
        }
    }

    return result;
};

/**
 * Sanitizes a raw input string to ensure it's valid JSON, specifically fixing
 * LaTeX backslashes that aren't properly escaped (e.g., \neq -> \\neq).
 */
export const sanitizeJsonString = (input: string): string => {
    if (!input) return "";
    let fixed = input;

    // 1. Fix "Bad Unicode escape" (\uXXXX)
    // Regex matches \u NOT followed by 4 hex digits.
    // Use negative lookbehind (?<!\\) to ensure it's not already escaped (\\u)
    fixed = fixed.replace(/(?<!\\)\\u(?![0-9a-fA-F]{4})/g, '\\\\u');

    // 2. Fix Common LaTeX Command prefixes that use valid escape chars but shouldn't be interpreted as such
    // E.g. \times -> \t (tab) + imes -> BAD. 
    // We want \\times.
    // List of problematic start chars: t (tab), n (newline), r (return), f (formfeed), b (backspace)

    // Explicit Whitelist of common Math commands starting with these chars
    const latexCommands = [
        'times', 'text', 'theta', 'tau', 'tan', 'top',
        'neq', 'not', 'nu', 'notin', 'nsubseteq',
        'frac', 'forall', 'phi',
        'beta', 'bar', 'big', 'bot',
        'rho', 'right', 'rightarrow',
        'le', 'left', 'lambda', 'lim', 'log'
    ];

    // Replace \command with \\command ONLY IF it's not already escaped
    // regex: (?<!\\)\\(command)
    latexCommands.forEach(cmd => {
        const regex = new RegExp(`(?<!\\\\)\\\\${cmd}`, 'g');
        fixed = fixed.replace(regex, `\\\\${cmd}`);
    });

    // 3. Catch-all for other non-standard escapes (like \s, \a, \x, etc.)
    // These are invalid in JSON strings anyway, so we escape them.
    // Excludes: " \ / b f n r t u (standard JSON escapes)
    fixed = fixed.replace(/(?<!\\)\\([^"\\/bfnrtu])/g, '\\\\$1');

    return fixed;
};

// --- Helpers ---

const isValidSection = (item: any): boolean => {
    return item.type && (item.content || item.questions || item.items);
};

const tryAdaptItem = (item: any): Section | null => {
    const id = crypto.randomUUID();

    // 1. Exam/Exercise Detection (Key indicators: question_text, choices, options, correct_answer)
    if (isExamItem(item)) {
        // If it's a SINGLE question object, wrap it in a section
        return {
            id,
            type: 'exercise',
            title: item.topic || item.title || 'แบบฝึกหัด (Imported)',
            items: [adaptQuestionToExerciseItem(item)]
        };
    }

    // 2. Exam Section (Group of questions)
    if (item.questions && Array.isArray(item.questions)) {
        return adoptExamOrExercise(item)[0];
    }

    // 3. Lecture/Content Detection
    // Check for "content" or common content keys
    if (item.content || item.sub_heading || item.summary || item.body) {
        return {
            id,
            type: 'lecture',
            title: item.title || item.sub_heading || item.heading || 'เนื้อหา (Imported)',
            content: constructLectureContent(item)
        };
    }

    // 4. Fallback: Treat as generic object -> Stringify or use description
    if (typeof item === 'object') {
        const title = item.title || item.name || 'ข้อมูล';
        return {
            id,
            type: 'lecture',
            title,
            content: constructLectureContent(item)
        };
    }

    return null;
};

const isExamItem = (item: any): boolean => {
    return !!(item.question_text || item.question || (item.choices && item.correct_answer));
};

const adaptQuestionToExerciseItem = (q: any) => {
    const options = (q.choices || q.options || []);
    let answer = q.correct_answer || q.answer || '';

    // If answer is index, convert to text
    if (typeof answer === 'number' && options[answer]) {
        answer = options[answer];
    }

    return {
        question: q.question_text || q.question || '',
        answer: answer,
        detailedSolution: Array.isArray(q.step_by_step_solution)
            ? q.step_by_step_solution.join('\n\n')
            : (q.step_by_step_solution || q.detailedSolution || ''),
        graphic_code: q.graphic_code
    };
};

const adoptExamOrExercise = (data: any): Section[] => {
    const id = crypto.randomUUID();
    const title = data.topic || data.title || 'แบบทดสอบ';
    // Use heuristic: if it has "step_by_step_solution", prefer exercise. If choices and correct_answer, favor exam?
    // User often wants "Exam" format if possible.
    const type: SectionType = data.type || (data.content_type === 'exercise' ? 'exercise' : 'exam');

    // Helper to convert "ก." or "A." to index
    const getCorrectIndex = (ans: any, choices: string[]) => {
        if (ans === undefined || ans === null) return 0;
        if (typeof ans === 'number') return ans;

        // Try direct match first
        const idx = choices.findIndex(c => c === ans || c.startsWith(ans));
        if (idx !== -1) return idx;

        // Fallback: Parsing "ก", "ข", "A", "B", "1", "2"
        const cleanAns = String(ans).replace(/[.()]/g, '').trim().toLowerCase();
        const map: Record<string, number> = { 'ก': 0, 'ข': 1, 'ค': 2, 'ง': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
        if (map[cleanAns] !== undefined) return map[cleanAns];
        return 0;
    };

    const questions = (data.questions || []).map((q: any) => ({
        id: crypto.randomUUID(),
        text: q.question_text || q.question || '',
        options: q.choices || q.options || [],
        correctOption: getCorrectIndex(q.correct_answer || q.answer, q.choices || q.options || []),
        explanation: Array.isArray(q.step_by_step_solution)
            ? q.step_by_step_solution.join('\n\n')
            : (q.step_by_step_solution || q.detailedSolution || ''),
        graphic_code: q.graphic_code
    }));

    if (type === 'exercise') {
        return [{
            id,
            type: 'exercise',
            title,
            items: questions.map((q: any) => ({
                question: q.text,
                answer: q.options[q.correctOption] || '',
                detailedSolution: q.explanation,
                graphic_code: q.graphic_code
            }))
        }];
    } else {
        return [{
            id,
            type: 'exam',
            title,
            questions
        }];
    }
};

const constructLectureContent = (item: any): string => {
    if (typeof item.content === 'string') return item.content;

    // Construct content from partial fields
    let result = '';

    if (item.sub_heading) result += `### ${item.sub_heading}\n\n`;
    if (item.content) result += `${item.content}\n\n`;

    if (item.formula) {
        // Ensure formula is wrapped in $$ if likely block math
        const formula = item.formula.trim();
        if ((formula.includes('\\frac') || formula.includes('\\sqrt')) && !formula.startsWith('$$')) {
            result += `$$ ${formula} $$\n\n`;
        } else {
            result += `> **สูตร:** ${formula}\n\n`;
        }
    }

    if (item.example) {
        result += `**ยกตัวอย่าง:** ${item.example}\n\n`;
    }

    if (item.key_takeaways && Array.isArray(item.key_takeaways)) {
        result += `**ประเด็นสำคัญ:**\n${item.key_takeaways.map((k: string) => `- ${k}`).join('\n')}\n\n`;
    }

    // Fallback: JSON dump if mostly empty
    if (!result.trim()) {
        const { id, type, title, ...rest } = item;
        return JSON.stringify(rest, null, 2);
    }

    return result;
};
