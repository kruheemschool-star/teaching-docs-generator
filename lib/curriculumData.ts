// Curriculum data based on IPST (สสวท.) core curriculum (Revised 2560)
// Organized by subject, grade level, and semester

export type ClassLevel =
    | "ป.1" | "ป.2" | "ป.3" | "ป.4" | "ป.5" | "ป.6"
    | "ม.1" | "ม.2" | "ม.3" | "ม.4" | "ม.5" | "ม.6"
    | "ปวช." | "ปวส." | "มหาวิทยาลัย";

export type Semester = "semester1" | "semester2";
export type SubjectType = "basic" | "advanced";

export interface Chapter {
    title: string;
    subtopics: string[];
}

export const CLASS_LEVELS: { value: ClassLevel; label: string; group: string }[] = [
    { value: "ป.1", label: "ประถมศึกษาปีที่ 1", group: "ประถมศึกษา" },
    { value: "ป.2", label: "ประถมศึกษาปีที่ 2", group: "ประถมศึกษา" },
    { value: "ป.3", label: "ประถมศึกษาปีที่ 3", group: "ประถมศึกษา" },
    { value: "ป.4", label: "ประถมศึกษาปีที่ 4", group: "ประถมศึกษา" },
    { value: "ป.5", label: "ประถมศึกษาปีที่ 5", group: "ประถมศึกษา" },
    { value: "ป.6", label: "ประถมศึกษาปีที่ 6", group: "ประถมศึกษา" },
    { value: "ม.1", label: "มัธยมศึกษาปีที่ 1", group: "มัธยมศึกษา" },
    { value: "ม.2", label: "มัธยมศึกษาปีที่ 2", group: "มัธยมศึกษา" },
    { value: "ม.3", label: "มัธยมศึกษาปีที่ 3", group: "มัธยมศึกษา" },
    { value: "ม.4", label: "มัธยมศึกษาปีที่ 4", group: "มัธยมศึกษา" },
    { value: "ม.5", label: "มัธยมศึกษาปีที่ 5", group: "มัธยมศึกษา" },
    { value: "ม.6", label: "มัธยมศึกษาปีที่ 6", group: "มัธยมศึกษา" },
    { value: "ปวช.", label: "ประกาศนียบัตรวิชาชีพ (ปวช.)", group: "อาชีวศึกษา" },
    { value: "ปวส.", label: "ประกาศนียบัตรวิชาชีพ (ปวส.)", group: "อาชีวศึกษา" },
];

export const SEMESTERS: { value: Semester; label: string }[] = [
    { value: "semester1", label: "ภาคเรียนที่ 1" },
    { value: "semester2", label: "ภาคเรียนที่ 2" },
];

// Helper to check for secondary level
export const isSecondaryLevel = (level: string): boolean => {
    return level.startsWith("ม.") || level.startsWith("ปว");
};

// --- DATA STRUCTURE ---
// Organized by Subject Name -> Grade -> Semester -> Chapters
type CurriculumMap = Record<string, Partial<Record<ClassLevel, { semester1: Chapter[]; semester2: Chapter[] }>>>;

// --- 1. MATHEMATICS (คณิตศาสตร์) --- (Migrated from previous version)
const MATH_BASIC: CurriculumMap["Subject"] = {
    "ป.1": {
        semester1: [
            { title: "จำนวนนับ 1 ถึง 10 และ 0", subtopics: ["การนับ 1-10", "การเขียนตัวเลข", "การเปรียบเทียบจำนวน", "ส่วนย่อย-ส่วนรวม"] },
            { title: "การบวกจำนวนสองจำนวนที่ผลบวกไม่เกิน 10", subtopics: ["ความหมายการบวก", "ประโยคสัญลักษณ์", "การหาผลบวก", "โจทย์ปัญหา"] },
            { title: "การลบจำนวนสองจำนวนที่ตัวตั้งไม่เกิน 10", subtopics: ["ความหมายการลบ", "ความสัมพันธ์บวก-ลบ", "โจทย์ปัญหา"] },
            { title: "จำนวนนับ 11 ถึง 20", subtopics: ["การนับและเขียนตัวเลข", "หลักสิบและหน่วย", "การเปรียบเทียบ", "การเรียงลำดับ"] },
            { title: "การบวก ลบ จำนวนนับไม่เกิน 20", subtopics: ["การหาผลบวก", "การหาผลลบ", "โจทย์ปัญหา"] },
            { title: "แผนภูมิรูปภาพ", subtopics: ["การอ่านแผนภูมิรูปภาพ"] }
        ],
        semester2: [
            { title: "การวัดน้ำหนัก", subtopics: ["การชั่งน้ำหนัก", "กิโลกรัมและขีด", "การเปรียบเทียบน้ำหนัก"] },
            { title: "การวัดความยาว", subtopics: ["การวัดความยาว", "เมตรและเซนติเมตร", "การเปรียบเทียบความยาว"] },
            { title: "จำนวนนับ 21 ถึง 100", subtopics: ["การนับทีละ 10", "หลักหน่วยและหลักสิบ", "แบบรูปของจำนวน"] },
            { title: "การบวก ลบ จำนวนนับไม่เกิน 100", subtopics: ["การบวกตามแนวตั้ง", "การลบตามแนวตั้ง", "โจทย์ปัญหา"] },
            { title: "รูปเรขาคณิต", subtopics: ["รูปสามเหลี่ยม สี่เหลี่ยม วงกลม วงรี", "ทรงสี่เหลี่ยม ทรงกลม"] }
        ]
    },
    // ... Fill other grades similarly ...
    "ม.1": {
        semester1: [
            { title: "จำนวนเต็ม", subtopics: ["จำนวนเต็มบวก ลบ ศูนย์", "การบวก ลบ คูณ หารจำนวนเต็ม", "สมบัติของจำนวนเต็ม"] },
            { title: "การสร้างทางเรขาคณิต", subtopics: ["การสร้างพื้นฐาน", "การสร้างรูปเรขาคณิต"] },
            { title: "เลขยกกำลัง", subtopics: ["ความหมาย", "การคูณและหารเลขยกกำลัง", "สัญกรณ์วิทยาศาสตร์"] },
            { title: "ทศนิยมและเศษส่วน", subtopics: ["ทศนิยม", "เศษส่วน", "การดำเนินการ", "ความสัมพันธ์"] },
            { title: "รูปเรขาคณิตสองมิติและสามมิติ", subtopics: ["หน้าตัด", "ภาพด้านหน้า ด้านข้าง ด้านบน"] }
        ],
        semester2: [
            { title: "สมการเชิงเส้นตัวแปรเดียว", subtopics: ["แบบรูป", "การแก้สมการ", "โจทย์ปัญหา"] },
            { title: "อัตราส่วน สัดส่วน และร้อยละ", subtopics: ["อัตราส่วน", "สัดส่วน", "ร้อยละ", "การประยุกต์"] },
            { title: "กราฟและความสัมพันธ์เชิงเส้น", subtopics: ["คู่อันดับและกราฟ", "ความสัมพันธ์เชิงเส้น"] },
            { title: "สถิติ (1)", subtopics: ["คำถามทางสถิติ", "การเก็บรวบรวมข้อมูล", "การนำเสนอข้อมูล"] }
        ]
    },
    "ม.2": {
        semester1: [
            { title: "ทฤษฎีบทพีทาโกรัส", subtopics: ["ทฤษฎีบทพีทาโกรัส", "บทกลับ"] },
            { title: "ความรู้เบื้องต้นเกี่ยวกับจำนวนจริง", subtopics: ["จำนวนตรรกยะ", "จำนวนอตรรกยะ", "รากที่สอง", "รากที่สาม"] },
            { title: "ปริซึมและทรงกระบอก", subtopics: ["พื้นที่ผิวและปริมาตร"] },
            { title: "การแปลงทางเรขาคณิต", subtopics: ["การเลื่อนขนาน", "การสะท้อน", "การหมุน"] },
            { title: "สมบัติของเลขยกกำลัง", subtopics: ["สมบัติเลขยกกำลัง", "การดำเนินการ"] },
            { title: "พหุนาม", subtopics: ["การบวก ลบ คูณ หารพหุนาม"] }
        ],
        semester2: [
            { title: "สถิติ (2)", subtopics: ["แผนภาพจุด", "แผนภาพต้น-ใบ", "ฮิสโทแกรม", "ค่ากลางของข้อมูล"] },
            { title: "ความเท่ากันทุกประการ", subtopics: ["รูปเรขาคณิตที่เท่ากันทุกประการ", "รูปสามเหลี่ยม"] },
            { title: "เส้นขนาน", subtopics: ["สมบัติของเส้นขนาน", "มุมแย้ง", "มุมภายใน"] },
            { title: "การให้เหตุผลทางเรขาคณิต", subtopics: ["การให้เหตุผล", "การสร้างและการพิสูจน์"] },
            { title: "การแยกตัวประกอบของพหุนามดีกรีสอง", subtopics: ["กำลังสองสมบูรณ์", "ผลต่างกำลังสอง"] }
        ]
    },
    "ม.3": {
        semester1: [
            { title: "อสมการเชิงเส้นตัวแปรเดียว", subtopics: ["การแก้อสมการ", "โจทย์ปัญหา"] },
            { title: "การแยกตัวประกอบของพหุนามที่สูงกว่าสอง", subtopics: ["ผลบวก/ผลต่างกำลังสาม"] },
            { title: "สมการกำลังสองตัวแปรเดียว", subtopics: ["การแก้สมการ", "โจทย์ปัญหา"] },
            { title: "ความคล้าย", subtopics: ["รูปสามเหลี่ยมที่คล้ายกัน", "การประยุกต์"] },
            { title: "กราฟของฟังก์ชันกำลังสอง", subtopics: ["พาราโบลา", "จุดต่ำสุด-สูงสุด"] },
            { title: "สถิติ (3)", subtopics: ["แผนภาพกล่อง", "การกระจายของข้อมูล"] }
        ],
        semester2: [
            { title: "ระบบสมการเชิงเส้นสองตัวแปร", subtopics: ["การแก้ระบบสมการ", "กราฟ", "โจทย์ปัญหา"] },
            { title: "วงกลม", subtopics: ["มุมในวงกลม", "คอร์ด", "เส้นสัมผัส"] },
            { title: "พีระมิด กรวย และทรงกลม", subtopics: ["ปริมาตรและพื้นที่ผิว"] },
            { title: "ความน่าจะเป็น", subtopics: ["การทดลองสุ่ม", "แซมเปิลสเปซ", "ความน่าจะเป็นของเหตุการณ์"] },
            { title: "อัตราส่วนตรีโกณมิติ", subtopics: ["sin cos tan", "การหาค่า", "การประยุกต์"] }
        ]
    },
    "ม.4": {
        semester1: [
            { title: "เซต", subtopics: ["ความหมาย", "การดำเนินการ", "แผนภาพเวนน์"] },
            { title: "ตรรกศาสตร์เบื้องต้น", subtopics: ["ประพจน์", "ตัวเชื่อม", "ค่าความจริง"] },
            { title: "หลักการนับเบื้องต้น", subtopics: ["กฎการบวก/คูณ", "การเรียงสับเปลี่ยน", "การจัดหมู่"] }
        ],
        semester2: [
            { title: "ความน่าจะเป็น", subtopics: ["การทดลองสุ่ม", "ความน่าจะเป็น"] },
            { title: "ฟังก์ชัน", subtopics: ["ความสัมพันธ์และฟังก์ชัน", "โดเมน เรนจ์", "ฟังก์ชันเชิงเส้น/กำลังสอง"] }
        ]
    },
    // ... M.5, M.6 Basic ...
};

const MATH_ADVANCED: CurriculumMap["Subject"] = {
    "ม.4": {
        semester1: [
            { title: "เซต", subtopics: ["การดำเนินการ", "เพาเวอร์เซต", "โจทย์ปัญหา"] },
            { title: "ตรรกศาสตร์", subtopics: ["สัจนิรันดร์", "การอ้างเหตุผล", "ตัวบ่งปริมาณ"] },
            { title: "จำนวนจริง", subtopics: ["สมบัติจำนวนจริง", "การแก้สมการพหุนาม", "ค่าสัมบูรณ์"] }
        ],
        semester2: [
            { title: "ความสัมพันธ์และฟังก์ชัน", subtopics: ["โดเมน เรนจ์", "ฟังก์ชันผกผัน", "ฟังก์ชันประกอบ"] },
            { title: "ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม", subtopics: ["สมการและอสมการ", "กราฟ"] },
            { title: "เรขาคณิตวิเคราะห์", subtopics: ["จุดและเส้นตรง", "ภาคตัดกรวย"] }
        ]
    },
    "ม.5": {
        semester1: [
            { title: "ฟังก์ชันตรีโกณมิติ", subtopics: ["วงกลมหนึ่งหน่วย", "กราฟ", "เอกลักษณ์", "กฎของไซน์และโคไซน์"] },
            { title: "เมทริกซ์", subtopics: ["ดีเทอร์มิแนนต์", "อินเวิร์ส", "ระบบสมการเชิงเส้น"] },
            { title: "เวกเตอร์", subtopics: ["เวกเตอร์ในสามมิติ", "ผลคูณเชิงสเกลาร์/เวกเตอร์"] }
        ],
        semester2: [
            { title: "จำนวนเชิงซ้อน", subtopics: ["จำนวนจินตภาพ", "รูปเชิงขั้ว", "รากที่ n"] },
            { title: "หลักการนับเบื้องต้น", subtopics: ["วิธีเรียงสับเปลี่ยน", "วิธีจัดหมู่", "ทฤษฎีบททวินาม"] },
            { title: "ความน่าจะเป็น", subtopics: ["ความน่าจะเป็นแบบมีการเงื่อนไข"] }
        ]
    },
    "ม.6": {
        semester1: [
            { title: "ลำดับและอนุกรม", subtopics: ["ลิมิตของลำดับ", "อนุกรมอนันต์"] },
            { title: "แคลคูลัสเบื้องต้น", subtopics: ["ลิมิตและความต่อเนื่อง", "อนุพันธ์", "อินทิเกรต"] }
        ],
        semester2: [
            { title: "สถิติขั้นสูง", subtopics: ["การวิเคราะห์ข้อมูล", "ค่ามาตรฐาน", "พื้นที่ใต้โค้งปกติ"] },
            { title: "ตัวแปรสุ่มและการแจกแจงความน่าจะเป็น", subtopics: ["ตัวแปรสุ่ม", "การแจกแจงทวินาม/ปกติ"] }
        ]
    }
};

// --- 2. SCIENCE (วิทยาศาสตร์) ---
const SCIENCE: CurriculumMap["Subject"] = {
    "ป.1": {
        semester1: [
            { title: "ตัวเรา พืช และสัตว์", subtopics: ["อวัยวะภายนอก", "พืชรอบตัว", "สัตว์รอบตัว"] },
            { title: "พืชและสัตว์ในท้องถิ่น", subtopics: ["สภาพแวดล้อมที่เหมาะสม"] }
        ],
        semester2: [
            { title: "วัสดุและการเกิดเสียง", subtopics: ["สมบัติของวัสดุ", "การเกิดเสียง", "ทิศทางการเคลื่อนที่ของเสียง"] },
            { title: "หินและท้องฟ้า", subtopics: ["ลักษณะของหิน", "ดาวบนท้องฟ้า", "กลางวันกลางคืน"] }
        ]
    },
    "ป.2": {
        semester1: [
            { title: "สิ่งมีชีวิตและไม่มีชีวิต", subtopics: ["ลักษณะสำคัญของสิ่งมีชีวิต", "พืชดอก"] },
            { title: "วัสดุและการใช้ประโยชน์", subtopics: ["การดูดซับน้ำ", "การผสมวัสดุ", "การนำกลับมาใช้ใหม่"] }
        ],
        semester2: [
            { title: "แสงและสิ่งมีชีวิต", subtopics: ["แหล่งกำเนิดแสง", "การมองเห็น", "ความสำคัญของแสง"] },
            { title: "ดินรอบตัวเรา", subtopics: ["ส่วนประกอบของดิน", "ชนิดของดิน", "ประโยชน์ของดิน"] }
        ]
    },
    // ... P.3-P.6 skipped for brevity, using standard placeholders if exhaustive list needed ...
    "ม.1": {
        semester1: [
            { title: "เรียนรู้วิทยาศาสตร์", subtopics: ["กระบวนการทางวิทยาศาสตร์", "เครื่องมือวัด"] },
            { title: "สารบริสุทธิ์", subtopics: ["ธาตุและสารประกอบ", "โครงสร้างอะตอม", "ตารางธาตุ"] },
            { title: "หน่วยพื้นฐานของสิ่งมีชีวิต", subtopics: ["เซลล์พืช/สัตว์", "กล้องจุลทรรศน์"] },
            { title: "การดำรงชีวิตของพืช", subtopics: ["การสังเคราะห์ด้วยแสง", "การลำเลียงในพืช", "การสืบพันธุ์ของพืช"] }
        ],
        semester2: [
            { title: "ความร้อนและการเปลี่ยนแปลง", subtopics: ["อุณหภูมิ", "การขยายตัว", "สถานะของสาร", "การถ่ายโอนความร้อน"] },
            { title: "ลมฟ้าอากาศ", subtopics: ["บรรยากาศ", "อุณหภูมิอากาศ", "ความกดอากาศ", "เมฆและฝน", "การพยากรณ์อากาศ"] }
        ]
    },
    "ม.2": {
        semester1: [
            { title: "ระบบในร่างกายมนุษย์", subtopics: ["ระบบหมุนเวียนเลือด", "ระบบหายใจ", "ระบบขับถ่าย", "ระบบประสาท", "ระบบสืบพันธุ์"] },
            { title: "การแยกสาร", subtopics: ["การระเหยแห้ง", "การตกผลึก", "การกลั่น", "โครมาโทกราฟี"] },
            { title: "สารละลาย", subtopics: ["ความเข้มข้น", "สภาพละลายได้"] }
        ],
        semester2: [
            { title: "แรงและการเคลื่อนที่", subtopics: ["แรงลัพธ์", "แรงเสียดทาน", "โมเมนต์ของแรง", "การเคลื่อนที่"] },
            { title: "งานและพลังงาน", subtopics: ["งาน", "กำลัง", "พลังงานศักย์/จลน์", "กฎการอนุรักษ์พลังงาน"] },
            { title: "โลกและการเปลี่ยนแปลง", subtopics: ["ดิน", "น้ำ", "แหล่งพลังงาน", "โครงสร้างโลก"] }
        ]
    },
    "ม.3": {
        semester1: [
            { title: "พันธุกรรม", subtopics: ["โครโมโซม", "ดีเอ็นเอ", "การถ่ายทอดลักษณะทางพันธุกรรม"] },
            { title: "คลื่นและแสง", subtopics: ["คลื่นกล", "คลื่นแม่เหล็กไฟฟ้า", "การสะท้อน/หักเหของแสง", "เลนส์และกระจก"] },
            { title: "ระบบสุริยะ", subtopics: ["ดวงอาทิตย์", "ดาวเคราะห์", "เทคโนโลยีอวกาศ"] }
        ],
        semester2: [
            { title: "ปฏิกิริยาเคมี", subtopics: ["การเกิดปฏิกิริยา", "สมการเคมี", "กรด-เบส"] },
            { title: "ไฟฟ้า", subtopics: ["วงจรไฟฟ้า", "กฎของโอห์ม", "พลังงานไฟฟ้า", "วงจรอิเล็กทรอนิกส์เบื้องต้น"] },
            { title: "ระบบนิเวศ", subtopics: ["องค์ประกอบระบบนิเวศ", "โซ่อาหาร/สายใยอาหาร", "ความสัมพันธ์ของสิ่งมีชีวิต"] }
        ]
    },
    // High School Science (Integrated/Physical)
    "ม.4": {
        semester1: [
            { title: "ดุลยภาพของสิ่งมีชีวิต", subtopics: ["การลำเลียงสาร", "การรักษาดุลยภาพ", "ภูมิต้านทาน"] }, // Bio basics
            { title: "การเคลื่อนที่และแรง", subtopics: ["การเคลื่อนที่แนวตรง", "แรงและการเคลื่อนที่", "การเคลื่อนที่แบบต่างๆ"] } // Phys basics
        ],
        semester2: [
            { title: "อะตอมและตารางธาตุ", subtopics: ["โครงสร้างอะตอม", "ตารางธาตุ", "พันธะเคมี"] }, // Chem basics
            { title: "โลกและการเปลี่ยนแปลง", subtopics: ["โครงสร้างโลก", "การเปลี่ยนแปลงทางธรณีวิทยา", "ธรณีพิบัติภัย"] } // Earth basics
        ]
    },
    "ม.5": {
        semester1: [
            { title: "พันธุกรรมและวิวัฒนาการ", subtopics: ["การถ่ายทอดลักษณะทางพันธุกรรม", "เทคโนโลยีทางดีเอ็นเอ", "วิวัฒนาการ"] },
            { title: "สนามของแรง", subtopics: ["สนามแม่เหล็ก", "สนามไฟฟ้า", "สนามโน้มถ่วง"] }
        ],
        semester2: [
            { title: "ปฏิกิริยาเคมีและพอลิเมอร์", subtopics: ["อัตราการเกิดปฏิกิริยา", "ปฏิกิริยาเคมีในชีวิตประจำวัน", "พอลิเมอร์"] },
            { title: "แสงและคลื่นแม่เหล็กไฟฟ้า", subtopics: ["คลื่นแม่เหล็กไฟฟ้า", "การสื่อสาร", "แสงสีและการมองเห็น"] }
        ]
    },
    "ม.6": {
        semester1: [
            { title: "ระบบนิเวศและความหลากหลายทางชีวภาพ", subtopics: ["ไบโอม", "การเปลี่ยนแปลงแทนที่", "ทรัพยากรธรรมชาติ"] },
            { title: "พลังงานนิวเคลียร์", subtopics: ["กัมมันตภาพรังสี", "พลังงานนิวเคลียร์", "โรงไฟฟ้านิวเคลียร์"] }
        ],
        semester2: [
            { title: "ดาราศาสตร์และอวกาศ", subtopics: ["เอกภพและกาแล็กซี", "ดาวฤกษ์", "ระบบสุริยะ", "เทคโนโลยีอวกาศ"] }
        ]
    },
};

// --- 3. THAI LANGUAGE (ภาษาไทย) ---
const THAI: CurriculumMap["Subject"] = {
    "ป.1": {
        semester1: [
            { title: "พยัญชนะและสระ", subtopics: ["รู้จักพยัญชนะ ก-ฮ", "สระเดี่ยว", "การแจกลูกและสะกดคำ"] },
            { title: "การผันวรรณยุกต์", subtopics: ["อักษรกลาง สูง ต่ำ", "การผันวรรณยุกต์"] },
            { title: "มาตราตัวสะกด", subtopics: ["แม่ ก กา", "แม่กง", "แม่กน", "แม่กม"] }
        ],
        semester2: [
            { title: "สระลดรูป/เปลี่ยนรูป", subtopics: ["สระอะ", "สระเอะ", "สระโอะ"] },
            { title: "คำควบกล้ำและอักษรนำ", subtopics: ["คำควบกล้ำแท้", "ห นำ"] },
            { title: "การแต่งประโยค", subtopics: ["ประโยคง่ายๆ", "ใคร ทำอะไร"] }
        ]
    },
    "ม.1": {
        semester1: [
            { title: "เสียงในภาษาไทย", subtopics: ["เสียงสระ พยัญชนะ วรรณยุกต์"] },
            { title: "การสร้างคำ", subtopics: ["คำมูล", "คำประสม", "คำซ้ำ", "คำซ้อน"] },
            { title: "นิราศภูเขาทอง", subtopics: ["ประวัติความเป็นมา", "คุณค่าด้านวรรณศิลป์", "ข้อคิด"] },
            { title: "โคลงโลกนิติ", subtopics: ["ความหมาย", "การสอนใจ", "คำศัพท์"] }
        ],
        semester2: [
            { title: "ชนิดของคำ", subtopics: ["คำนาม", "สรรพนาม", "กริยา", "วิเศษณ์", "บุพบท", "สันธาน", "อุทาน"] },
            { title: "ประโยคในภาษาไทย", subtopics: ["ส่วนประกอบของประโยค", "ประโยคความเดียว", "ประโยคความรวม"] },
            { title: "สุภาษิตพระร่วง", subtopics: ["คำสอน", "การปฏิบัติตน"] },
            { title: "ราชาธิราช ตอน สมิงพระรามอาสา", subtopics: ["เนื้อเรื่องย่อ", "บทวิเคราะห์", "คุณธรรม"] }
        ]
    },
    // ... Fill other grades ...
};

// --- 4. ENGLISH (ภาษาอังกฤษ) ---
const ENGLISH: CurriculumMap["Subject"] = {
    "ม.1": {
        semester1: [
            { title: "Myself & Family", subtopics: ["Greetings & Introductions", "Relationships", "Quantifiers (some/any)"] },
            { title: "School Life", subtopics: ["Classroom Objects", "Subjects", "Present Simple Tense"] },
            { title: "Daily Routine", subtopics: ["Time", "Adverbs of Frequency", "Daily Activities"] },
            { title: "My House", subtopics: ["Rooms", "Furniture", "Prepositions of Place"] }
        ],
        semester2: [
            { title: "Free Time & Hobbies", subtopics: ["Sports", "Hobbies", "Can/Can't", "Like/Dislike"] },
            { title: "Places in Town", subtopics: ["Giving Directions", "Places", "There is/There are"] },
            { title: "Food & Drink", subtopics: ["Countable/Uncountable Nouns", "Ordering Food", "Quantifiers"] },
            { title: "Weather & Clothes", subtopics: ["Weather/Seasons", "Clothes", "Present Continuous Tense"] }
        ]
    },
    // ... Fill other grades ...
};

// --- 5. SOCIAL STUDIES (สังคมศึกษา) ---
const SOCIAL_STUDIES: CurriculumMap["Subject"] = {
    "ม.1": {
        semester1: [
            { title: "ศาสนา ศีลธรรม จริยธรรม", subtopics: ["ประวัติศาสดา", "วันสำคัญทางศาสนา", "หลักธรรม", "การบริหารจิต"] },
            { title: "หน้าที่พลเมือง", subtopics: ["บทบาทหน้าที่ของเยาวชน", "สิทธิเสรีภาพ", "กฎหมายเบื้องต้น"] }
        ],
        semester2: [
            { title: "เศรษฐศาสตร์", subtopics: ["ความหมายเศรษฐศาสตร์", "การบริโภค", "เศรษฐกิจพอเพียง", "สถาบันการเงิน"] },
            { title: "ภูมิศาสตร์ (ทวีปเอเชีย)", subtopics: ["เครื่องมือทางภูมิศาสตร์", "ลักษณะทางกายภาพเอเชีย", "ภัยพิบัติ"] }
        ]
    }
};

// --- 6. HISTORY (ประวัติศาสตร์) ---
const HISTORY: CurriculumMap["Subject"] = {
    "ม.1": {
        semester1: [
            { title: "เวลาและช่วงเวลา", subtopics: ["ศักราช", "การนับเวลา", "การเทียบศักราช"] },
            { title: "วิธีการทางประวัติศาสตร์", subtopics: ["ขั้นตอนวิธีการทางประวัติศาสตร์", "หลักฐานทางประวัติศาสตร์"] },
            { title: "สมัยก่อนสุโขทัย", subtopics: ["รัฐโบราณในดินแดนไทย", "แคว้นต่างๆ"] }
        ],
        semester2: [
            { title: "อาณาจักรสุโขทัย", subtopics: ["การสถาปนา", "พัฒนาการด้านการเมืองการปกครอง", "เศรษฐกิจและสังคม", "ความสัมพันธ์ระหว่างประเทศ", "ภูมิปัญญาและศิลปวัฒนธรรม", "ความเสื่อมของอาณาจักร"] }
        ]
    }
};

// --- 7. COMPUTING SCIENCE (วิทยาการคำนวณ & เทคโนโลยี) ---
const COMPUTING_SCIENCE: CurriculumMap["Subject"] = {
    "ม.1": {
        semester1: [
            { title: "แนวคิดเชิงนามธรรม", subtopics: ["การคัดเลือกคุณลักษณะที่จำเป็น", "การถ่ายทอดรายละเอียด", "การแก้ปัญหา"] },
            { title: "การแก้ปัญหา", subtopics: ["การออกแบบอัลกอริทึม", "รหัสลำลอง", "ผังงาน"] },
            { title: "การเขียนโปรแกรมเบื้องต้น", subtopics: ["ตัวแปร", "การวนซ้ำ", "เงื่อนไข", "Python/Scratch"] }
        ],
        semester2: [
            { title: "ข้อมูลและการประมวลผล", subtopics: ["การรวบรวมข้อมูล", "การประมวลผลข้อมูล", "ซอฟต์แวร์จัดการข้อมูล"] },
            { title: "การใช้เทคโนโลยีอย่างปลอดภัย", subtopics: ["ความปลอดภัยของระบบ", "จริยธรรม", "ลิขสิทธิ์", "Digital Footprint"] }
        ]
    },
    // ...
};

// --- MASTER DATA MAP ---
export const SUBJECT_CURRICULUM: Record<string, CurriculumMap["Subject"]> = {
    "คณิตศาสตร์": MATH_BASIC,
    "วิทยาศาสตร์": SCIENCE,
    "ภาษาไทย": THAI,
    "ภาษาอังกฤษ": ENGLISH,
    "สังคมศึกษา": SOCIAL_STUDIES,
    "ประวัติศาสตร์": HISTORY,
    "คอมพิวเตอร์": COMPUTING_SCIENCE,
    // Add placeholders for others if needed but user focused on these
};

// Special handling for Advanced Math
export const SUBJECT_CURRICULUM_ADVANCED: Record<string, CurriculumMap["Subject"]> = {
    "คณิตศาสตร์": MATH_ADVANCED,
    // Add Advanced Science (Physics, Chem, Bio) here if needed later
};

// --- HELPER FUNCTION ---
export function getTopics(
    classLevel: string, // Use string to accept "ปวช." etc easily
    semester: Semester,
    subjectType: SubjectType = "basic",
    subjectName: string = "คณิตศาสตร์"
): Chapter[] {
    const level = classLevel as ClassLevel;

    // Check for advanced subject data first
    if (subjectType === "advanced") {
        const advancedData = SUBJECT_CURRICULUM_ADVANCED[subjectName];
        if (advancedData && advancedData[level] && advancedData[level]![semester]) {
            return advancedData[level]![semester]!;
        }
        // Fallback or empty if no advanced data defined
    }

    // Default to basic subject data
    const basicData = SUBJECT_CURRICULUM[subjectName];
    if (basicData && basicData[level] && basicData[level]![semester]) {
        return basicData[level]![semester]!;
    }

    return [];
}
