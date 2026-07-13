export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type ApprovalStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type WorkProjectStatus = 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';
export type WorkProjectMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface MockUser {
  id: string;
  name: string;
  avatar?: string;
  role: Role;
}

export interface MockWorkProject {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: WorkProjectStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface MockWorkProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: WorkProjectMemberRole;
}

export interface MockAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  date: string;
  url?: string;
}

export interface MockTask {
  id: string;
  workProjectId: string | null;
  workProjectSectionId?: string | null;
  title: string;
  description: string;
  taskStatus: TaskStatus;
  approvalStatus: ApprovalStatus;
  priority: Priority;
  assigneeId: string | null;
  creatorId: string;
  approverId: string | null;
  followersIds: string[];
  commentsCount: number;
  createdAt: string;
  plannedStartAt?: string | null;
  dueDate: string | null;
  requiresApproval: boolean;
  history: { id: string; action: string; by: string; date: string }[];
  comments: { id: string; text: string; by: string; date: string }[];
  attachments: MockAttachment[];
}

export const MOCK_USERS: MockUser[] = [
  { id: 'u1', name: 'أحمد الإداري', role: 'ADMIN' },
  { id: 'u2', name: 'سعد الموظف', role: 'EMPLOYEE' },
  { id: 'u3', name: 'عمر الموظف', role: 'EMPLOYEE' },
  { id: 'u4', name: 'خالد المدير', role: 'SUPER_ADMIN' },
  { id: 'u5', name: 'فهد العضو', role: 'EMPLOYEE' }
];

export const MOCK_WORK_PROJECTS: MockWorkProject[] = [
  {
    id: 'wp1',
    name: 'تطوير النظام المالي',
    description: 'تحديثات الربع الثالث للنظام المالي الداخلي.',
    ownerId: 'u1',
    status: 'ACTIVE',
    startDate: '2026-07-01T00:00:00Z',
    endDate: '2026-08-31T00:00:00Z',
    createdAt: '2026-06-25T00:00:00Z'
  },
  {
    id: 'wp2',
    name: 'حملة التسويق الرقمي',
    description: 'إطلاق حملات السوشيال ميديا للموسم الجديد.',
    ownerId: 'u4',
    status: 'PLANNING',
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-09-30T00:00:00Z',
    createdAt: '2026-07-05T00:00:00Z'
  }
];

export const MOCK_WORK_PROJECT_MEMBERS: MockWorkProjectMember[] = [
  { id: 'm1', projectId: 'wp1', userId: 'u1', role: 'OWNER' },
  { id: 'm2', projectId: 'wp1', userId: 'u2', role: 'MEMBER' },
  { id: 'm3', projectId: 'wp1', userId: 'u4', role: 'ADMIN' },

  { id: 'm4', projectId: 'wp2', userId: 'u4', role: 'OWNER' },
  { id: 'm5', projectId: 'wp2', userId: 'u3', role: 'MEMBER' },
];

export const MOCK_WORK_PROJECT_SECTIONS = [
  { id: 'sec1', workProjectId: 'wp1', name: 'التحليل والمقترحات', status: 'ACTIVE', color: '#3B82F6', managerId: 'u1' },
  { id: 'sec2', workProjectId: 'wp1', name: 'قاعدة البيانات (مؤرشف)', status: 'ARCHIVED', color: '#6B7280', managerId: 'u4' },
  { id: 'sec3', workProjectId: 'wp2', name: 'التصاميم', status: 'ACTIVE', color: '#8B5CF6', managerId: 'u3' }
];

export const MOCK_PROJECT_ATTACHMENTS: Record<string, MockAttachment[]> = {
  'wp1': [
    { id: 'pa1', fileName: 'متطلبات_النظام.pdf', fileSize: 1500000, mimeType: 'application/pdf', uploadedBy: 'أحمد الإداري', date: '2026-07-02T10:00:00Z' }
  ]
};

export const INITIAL_TASKS: MockTask[] = [
  {
    id: 't1',
    workProjectId: 'wp1',
    workProjectSectionId: 'sec1',
    title: 'مراجعة الميزانية التشغيلية',
    description: 'يرجى مراجعة وتدقيق ميزانية المشروع.',
    taskStatus: 'TODO',
    approvalStatus: 'NONE',
    priority: 'HIGH',
    assigneeId: 'u2',
    creatorId: 'u1',
    approverId: null,
    followersIds: [],
    commentsCount: 2,
    createdAt: '2026-07-10T10:00:00Z',
    plannedStartAt: '2026-07-02T00:00:00Z',
    dueDate: '2026-07-05T00:00:00Z', // Overdue
    requiresApproval: false,
    history: [{ id: 'h1', action: 'أنشأ المهمة', by: 'أحمد الإداري', date: '2026-07-10T10:00:00Z' }],
    comments: [{ id: 'c1', text: 'تم استلام الملف وجاري التدقيق.', by: 'سعد الموظف', date: '2026-07-11T09:00:00Z' }],
    attachments: [{ id: 'ta1', fileName: 'نسخة_الميزانية.pdf', fileSize: 1200000, mimeType: 'application/pdf', uploadedBy: 'أحمد الإداري', date: '2026-07-10T10:00:00Z' }]
  },
  {
    id: 't2',
    workProjectId: 'wp1',
    workProjectSectionId: 'sec2',
    title: 'تحديث قواعد البيانات',
    description: '',
    taskStatus: 'IN_PROGRESS',
    approvalStatus: 'NONE',
    priority: 'MEDIUM',
    assigneeId: 'u4',
    creatorId: 'u2',
    approverId: null,
    followersIds: ['u1'],
    commentsCount: 0,
    createdAt: '2026-07-11T12:00:00Z',
    plannedStartAt: null,
    dueDate: '2026-07-20T00:00:00Z', // Only dueDate -> Milestone
    requiresApproval: false,
    history: [], comments: [], attachments: []
  },
  {
    id: 't3',
    workProjectId: 'wp2',
    workProjectSectionId: 'sec3',
    title: 'اعتماد تصاميم الحملة',
    description: 'الرجاء اعتماد التصاميم قبل الإطلاق.',
    taskStatus: 'IN_PROGRESS',
    approvalStatus: 'PENDING',
    priority: 'HIGH',
    assigneeId: 'u3',
    approverId: 'u4',
    creatorId: 'u3',
    followersIds: ['u4'],
    commentsCount: 5,
    createdAt: '2026-07-12T09:00:00Z',
    plannedStartAt: '2026-07-15T00:00:00Z',
    dueDate: '2026-07-15T00:00:00Z', // Same dates -> Milestone
    requiresApproval: true,
    history: [
      { id: 'h1', action: 'أنشأ المهمة', by: 'عمر الموظف', date: '2026-07-12T09:00:00Z' },
      { id: 'h2', action: 'أرسل المهمة للاعتماد', by: 'عمر الموظف', date: '2026-07-12T10:30:00Z' },
    ],
    comments: [], attachments: []
  },
  {
    id: 't4',
    workProjectId: null, // General Task
    workProjectSectionId: null,
    title: 'تجديد رخص البرمجيات',
    description: 'مهمة عامة غير تابعة لمشروع عمل محدد.',
    taskStatus: 'TODO',
    approvalStatus: 'NONE',
    priority: 'MEDIUM',
    assigneeId: 'u1',
    approverId: null,
    creatorId: 'u4',
    followersIds: [],
    commentsCount: 0,
    createdAt: '2026-07-12T10:00:00Z',
    plannedStartAt: '2026-07-15T00:00:00Z',
    dueDate: '2026-07-25T00:00:00Z', // Bar
    requiresApproval: false,
    history: [], comments: [], attachments: []
  }
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'قيد الانتظار',
  IN_PROGRESS: 'جاري التنفيذ',
  DONE: 'مكتملة',
  CANCELLED: 'ملغاة'
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'منخفضة',
  MEDIUM: 'متوسطة',
  HIGH: 'عالية'
};

export const APPROVAL_LABELS: Record<ApprovalStatus, string> = {
  NONE: 'لا تتطلب',
  PENDING: 'بانتظار الاعتماد',
  APPROVED: 'معتمدة',
  REJECTED: 'مرفوضة'
};

export const WORK_PROJECT_STATUS_LABELS: Record<WorkProjectStatus, string> = {
  PLANNING: 'تخطيط',
  ACTIVE: 'نشط',
  PAUSED: 'متوقف مؤقتاً',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى'
};
