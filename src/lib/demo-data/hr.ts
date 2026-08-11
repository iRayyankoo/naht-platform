/**
 * بيانات تجريبية - الموارد البشرية
 * Demo Mock Data for Human Resources (General Job Info Only - Neutral Demo Identifiers Only)
 */

export interface EmployeeGeneralInfo {
  id: string;
  fullName: string;
  jobTitle: string;
  department: string;
  workEmail: string;
  workPhone: string;
  hireDate: string;
  status: "نشط" | "في إجازة" | "غير نشط";
  contractType: "دوام كامل" | "عقد محدد" | "استشاري";
  directManager: string;
  workLocation: string;
}

export interface LeaveRequestDemo {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: "سنوية" | "مرضية" | "طارئة" | "مهمة عمل";
  startDate: string;
  endDate: string;
  daysCount: number;
  status: "قيد الانتظار" | "معتمد" | "مرفوض";
  reason: string;
}

export interface ContractDocumentDemo {
  id: string;
  employeeId: string;
  employeeName: string;
  docTitle: string;
  docType: "عقد عمل" | "شهادة تأمين" | "رخصة قيادة سارية" | "اتفاقية عدم إفصاح";
  issueDate: string;
  expiryDate: string;
  status: "ساري" | "ينتهي قريباً" | "منتهي";
}

export const DEMO_EMPLOYEES: EmployeeGeneralInfo[] = [
  {
    id: "emp_101",
    fullName: "موظف تجريبي 101",
    jobTitle: "مدير مشاريع عقارية (تجريبي)",
    department: "التطوير الهندسي",
    workEmail: "emp101@naht-demo.invalid",
    workPhone: "011-000-0101 (تحويلة تجريبية)",
    hireDate: "2023-03-15",
    status: "نشط",
    contractType: "دوام كامل",
    directManager: "إدارة التطوير (تجريبي)",
    workLocation: "الرياض - المقر الرئيسي",
  },
  {
    id: "emp_102",
    fullName: "موظف تجريبي 102",
    jobTitle: "أخصائي تسويق رقمي (تجريبي)",
    department: "التسويق والإعلام",
    workEmail: "emp102@naht-demo.invalid",
    workPhone: "011-000-0102 (تحويلة تجريبية)",
    hireDate: "2024-01-10",
    status: "نشط",
    contractType: "دوام كامل",
    directManager: "إدارة التسويق (تجريبي)",
    workLocation: "الرياض - المقر الرئيسي",
  },
  {
    id: "emp_103",
    fullName: "موظف تجريبي 103",
    jobTitle: "مستشار مبيعات عقارية (تجريبي)",
    department: "المبيعات وحسابات العملاء",
    workEmail: "emp103@naht-demo.invalid",
    workPhone: "011-000-0103 (تحويلة تجريبية)",
    hireDate: "2023-08-01",
    status: "في إجازة",
    contractType: "دوام كامل",
    directManager: "إدارة المبيعات (تجريبي)",
    workLocation: "الرياض - فرع الياسمين",
  },
  {
    id: "emp_104",
    fullName: "موظف تجريبي 104",
    jobTitle: "مهندس تصميم معماري (تجريبي)",
    department: "التصميم والتخطيط",
    workEmail: "emp104@naht-demo.invalid",
    workPhone: "011-000-0104 (تحويلة تجريبية)",
    hireDate: "2024-05-20",
    status: "نشط",
    contractType: "دوام كامل",
    directManager: "إدارة التصميم (تجريبي)",
    workLocation: "الرياض - المقر الرئيسي",
  },
  {
    id: "emp_105",
    fullName: "موظف تجريبي 105",
    jobTitle: "مسؤول علاقات عملاء (تجريبي)",
    department: "المبيعات وحسابات العملاء",
    workEmail: "emp105@naht-demo.invalid",
    workPhone: "011-000-0105 (تحويلة تجريبية)",
    hireDate: "2025-02-01",
    status: "نشط",
    contractType: "عقد محدد",
    directManager: "إدارة المبيعات (تجريبي)",
    workLocation: "الرياض - فرع الياسمين",
  },
];

export const DEMO_LEAVE_REQUESTS: LeaveRequestDemo[] = [
  {
    id: "lv_01",
    employeeId: "emp_103",
    employeeName: "موظف تجريبي 103",
    leaveType: "سنوية",
    startDate: "2026-08-05",
    endDate: "2026-08-16",
    daysCount: 10,
    status: "معتمد",
    reason: "إجازة سنوية اعتيادية (تجريبية)",
  },
  {
    id: "lv_02",
    employeeId: "emp_104",
    employeeName: "موظف تجريبي 104",
    leaveType: "مهمة عمل",
    startDate: "2026-08-20",
    endDate: "2026-08-22",
    daysCount: 3,
    status: "قيد الانتظار",
    reason: "زيارة موقع مشروع تجريبي والمعاينة الميدانية",
  },
  {
    id: "lv_03",
    employeeId: "emp_102",
    employeeName: "موظف تجريبي 102",
    leaveType: "طارئة",
    startDate: "2026-08-12",
    endDate: "2026-08-13",
    daysCount: 1,
    status: "قيد الانتظار",
    reason: "ظرف عائلي طارئ (تجريبي)",
  },
];

export const DEMO_CONTRACTS_DOCUMENTS: ContractDocumentDemo[] = [
  {
    id: "doc_01",
    employeeId: "emp_101",
    employeeName: "موظف تجريبي 101",
    docTitle: "عقد عمل الموظف (تجريبي 101)",
    docType: "عقد عمل",
    issueDate: "2023-03-15",
    expiryDate: "2027-03-14",
    status: "ساري",
  },
  {
    id: "doc_02",
    employeeId: "emp_102",
    employeeName: "موظف تجريبي 102",
    docTitle: "شهادة تأمين طبي شامل (تجريبية)",
    docType: "شهادة تأمين",
    issueDate: "2025-09-01",
    expiryDate: "2026-08-31",
    status: "ينتهي قريباً",
  },
  {
    id: "doc_03",
    employeeId: "emp_105",
    employeeName: "موظف تجريبي 105",
    docTitle: "عقد التوظيف المؤقت (تجريبي 105)",
    docType: "عقد عمل",
    issueDate: "2025-02-01",
    expiryDate: "2026-08-01",
    status: "منتهي",
  },
  {
    id: "doc_04",
    employeeId: "emp_104",
    employeeName: "موظف تجريبي 104",
    docTitle: "اتفاقية عدم إفصاح (تجريبية)",
    docType: "اتفاقية عدم إفصاح",
    issueDate: "2024-05-20",
    expiryDate: "2028-05-19",
    status: "ساري",
  },
];
