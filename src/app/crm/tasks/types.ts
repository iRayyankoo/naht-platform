export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type WorkProjectStatus = 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type WorkProjectMemberRole = 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export interface UserDTO {
  id: string;
  name: string;
  image?: string;
}

export interface TaskCommentDTO {
  id: string;
  content: string;
  createdAt: string;
  author: UserDTO;
}

export interface TaskActivityLogDTO {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  actor: UserDTO;
}

export interface TaskApprovalDTO {
  id: string;
  approverId: string;
  status: ApprovalStatus;
  comment: string | null;
  createdAt: string;
  round: number;
  approver: UserDTO;
}

export interface WorkProjectMemberDTO {
  id: string;
  role: WorkProjectMemberRole;
  user: UserDTO;
}

export interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  taskStatus: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  workProjectId: string | null;

  requiresApproval: boolean;
  approvalStatus: ApprovalStatus | null;
  approvalRound: number;

  assignedToId: string | null;
  designatedApproverId: string | null;

  assignedTo: UserDTO | null;
  createdBy: UserDTO;
  designatedApprover: UserDTO | null;

  comments: TaskCommentDTO[];
  activityLogs: TaskActivityLogDTO[];
  approvals: TaskApprovalDTO[];
}

export interface WorkProjectDTO {
  id: string;
  name: string;
  description: string | null;
  status: WorkProjectStatus;
  createdAt: string;

  totalTasks: number;
  completedTasks: number;
  progress: number;

  members: WorkProjectMemberDTO[];
}

// Permissions injected into the client
export interface ClientPermissions {
  canViewTasks: boolean;
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canApproveTasks: boolean;

  canViewWorkProjects: boolean;
  canCreateWorkProjects: boolean;
  canEditWorkProjects: boolean;
  canDeleteWorkProjects: boolean;

  isSuperAdmin: boolean;
}
