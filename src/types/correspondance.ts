// iCorrespondance Types - Government Document Workflow

export type CaseStatus = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'published';

export type WorkflowStep = 'preparation' | 'validation' | 'approval' | 'publication';

export interface Case {
  id: string;
  tenant_id: string;
  reference: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_by: string;
  created_at: string;
  updated_at: string;
  current_step: WorkflowStep;
  documents: Document[];
  workflow_history: WorkflowEvent[];
  approvals: Approval[];
}

export interface Document {
  id: string;
  case_id: string;
  name: string;
  type: 'courrier' | 'note' | 'rapport' | 'decision' | 'annexe';
  content: string;
  version: number;
  created_by: string;
  created_at: string;
  file_size?: number;
  mime_type?: string;
  preview_url?: string;
}

export interface DocumentVersion {
  version: number;
  created_by: string;
  created_at: string;
  changes?: string;
}

export interface WorkflowEvent {
  id: string;
  case_id: string;
  step: WorkflowStep;
  action: 'start' | 'complete' | 'reject' | 'comment';
  actor_id: string;
  actor_name: string;
  comment?: string;
  created_at: string;
}

export interface Approval {
  id: string;
  case_id: string;
  approver_id: string;
  approver_name: string;
  approver_role: string;
  decision: 'pending' | 'approved' | 'rejected';
  comment?: string;
  decided_at?: string;
}
