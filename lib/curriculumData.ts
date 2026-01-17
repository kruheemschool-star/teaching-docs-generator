// Curriculum data based on IPST (สสวท.) mathematics curriculum
// Organized by grade level and semester

export type ClassLevel =
    | "ม.1" | "ม.2" | "ม.3" | "ม.4" | "ม.5" | "ม.6";

export type Semester = "semester1" | "semester2";
export type SubjectType = "basic" | "advanced";

export const CLASS_LEVELS: { value: ClassLevel; label: string; group: string }[] = [
    { value: "ม.1", label: "มัธยมศึกษาปีที่ 1", group: "มัธยมศึกษา" },
    { value: "ม.2", label: "มัธยมศึกษาปีที่ 2", group: "มัธยมศึกษา" },
    { value: "ม.3", label: "มัธยมศึกษาปีที่ 3", group: "มัธยมศึกษา" },
    { value: "ม.4", label: "มัธยมศึกษาปีที่ 4", group: "มัธยมศึกษา" },
    { value: "ม.5", label: "มัธยมศึกษาปีที่ 5", group: "มัธยมศึกษา" },
    { value: "ม.6", label: "มัธยมศึกษาปีที่ 6", group: "มัธยมศึกษา" },
];

export const SEMESTERS: { value: Semester; label: string }[] = [
    { value: "semester1", label: "ภาคเรียนที่ 1" },
    { value: "semester2", label: "ภาคเรียนที่ 2" },
];

export const SUBJECT_TYPES: { value: SubjectType; label: string }[] = [
    { value: "basic", label: "คณิตศาสตร์พื้นฐาน" },
    { value: "advanced", label: "คณิตศาสตร์เพิ่มเติม" },
];

// Check if a class level is secondary (มัธยม) - shows subject type selector
export const isSecondaryLevel = (level: ClassLevel): boolean => {
    return level.startsWith("ม.");
};

// Curriculum topics by grade level and semester
// Based on IPST (สสวท.) curriculum standards
export const CURRICULUM_TOPICS: Record<ClassLevel, { semester1: string[]; semester2: string[] }> = {
    // มัธยมศึกษาตอนต้น
    "ม.1": {
        semester1: [
            "ระบบจำนวนเต็ม",
            "การสร้างทางเรขาคณิต",
            "เลขยกกำลัง",
            "ทศนิยมและเศษส่วน",
        ],
        semester2: [
            "อัตราส่วนและร้อยละ",
            "สมการเชิงเส้นตัวแปรเดียว",
            "คู่อันดับและกราฟ",
            "ความสัมพันธ์ระหว่างรูปเรขาคณิตสองมิติและสามมิติ",
        ],
    },
    "ม.2": {
        semester1: [
            "อัตราส่วนและร้อยละ",
            "การวัด",
            "แผนภูมิรูปวงกลม",
            "การแปลงทางเรขาคณิต",
        ],
        semester2: [
            "ความเท่ากันทุกประการ",
            "เส้นขนาน",
            "ทฤษฎีบทพีทาโกรัส",
            "ความน่าจะเป็น",
        ],
    },
    "ม.3": {
        semester1: [
            "พื้นที่ผิวและปริมาตร",
            "กราฟและความสัมพันธ์เชิงเส้น",
            "ระบบสมการเชิงเส้นสองตัวแปร",
            "อสมการเชิงเส้นตัวแปรเดียว",
        ],
        semester2: [
            "ความคล้าย",
            "อัตราส่วนตรีโกณมิติ",
            "วงกลม",
            "สถิติ",
            "ความน่าจะเป็น",
        ],
    },
    // มัธยมศึกษาตอนปลาย
    "ม.4": {
        semester1: [
            "เซต",
            "ตรรกศาสตร์เบื้องต้น",
            "จำนวนจริง",
            "ทฤษฎีจำนวนเบื้องต้น",
        ],
        semester2: [
            "ความสัมพันธ์และฟังก์ชัน",
            "ฟังก์ชันเชิงเส้นและฟังก์ชันกำลังสอง",
            "เรขาคณิตวิเคราะห์",
            "ภาคตัดกรวย",
        ],
    },
    "ม.5": {
        semester1: [
            "ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม",
            "ฟังก์ชันตรีโกณมิติ",
            "เวกเตอร์ในสองมิติและสามมิติ",
        ],
        semester2: [
            "ลำดับและอนุกรม",
            "แคลคูลัสเบื้องต้น",
            "สถิติ",
        ],
    },
    "ม.6": {
        semester1: [
            "การนับเบื้องต้น",
            "ความน่าจะเป็น",
            "การแจกแจงความน่าจะเป็น",
            "เมทริกซ์",
        ],
        semester2: [
            "กำหนดการเชิงเส้น",
            "จำนวนเชิงซ้อน",
            "ทฤษฎีกราฟเบื้องต้น",
        ],
    },
};

// Advanced topics for secondary level (คณิตศาสตร์เพิ่มเติม)
export const ADVANCED_CURRICULUM_TOPICS: Partial<Record<ClassLevel, { semester1: string[]; semester2: string[] }>> = {
    "ม.1": {
        semester1: [
            "การให้เหตุผลทางคณิตศาสตร์",
            "จำนวนและพีชคณิต",
        ],
        semester2: [
            "การวัดและเรขาคณิต",
            "สถิติและความน่าจะเป็น",
        ],
    },
    "ม.2": {
        semester1: [
            "พหุนาม",
            "การแยกตัวประกอบของพหุนาม",
        ],
        semester2: [
            "ทฤษฎีบทสามเหลี่ยมและทฤษฎีบทปีทาโกรัส",
            "ระบบสมการเชิงเส้น",
        ],
    },
    "ม.3": {
        semester1: [
            "อสมการ",
            "สมบัติของเลขยกกำลัง",
        ],
        semester2: [
            "พหุนามและเศษส่วนของพหุนาม",
            "กรณฑ์ที่สอง",
        ],
    },
    "ม.4": {
        semester1: [
            "เซตและการดำเนินการ",
            "ตรรกศาสตร์",
            "การให้เหตุผลและการพิสูจน์",
        ],
        semester2: [
            "จำนวนจริงและพหุนาม",
            "สมการพหุนาม",
            "อสมการพหุนาม",
        ],
    },
    "ม.5": {
        semester1: [
            "ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม",
            "ฟังก์ชันตรีโกณมิติและการประยุกต์",
            "จำนวนเชิงซ้อน",
        ],
        semester2: [
            "เมทริกซ์",
            "เวกเตอร์",
            "ภาคตัดกรวย",
        ],
    },
    "ม.6": {
        semester1: [
            "ลำดับและอนุกรม",
            "แคลคูลัส",
            "ลิมิตและความต่อเนื่อง",
        ],
        semester2: [
            "อนุพันธ์ของฟังก์ชัน",
            "ปริพันธ์",
            "การประยุกต์แคลคูลัส",
        ],
    },
};

// Get topics based on class level, semester, and subject type
export function getTopics(
    classLevel: ClassLevel,
    semester: Semester,
    subjectType: SubjectType = "basic"
): string[] {
    if (subjectType === "advanced" && isSecondaryLevel(classLevel)) {
        const advancedTopics = ADVANCED_CURRICULUM_TOPICS[classLevel];
        if (advancedTopics) {
            return advancedTopics[semester] || [];
        }
    }
    return CURRICULUM_TOPICS[classLevel]?.[semester] || [];
}
