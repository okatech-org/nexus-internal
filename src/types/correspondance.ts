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
  signature?: ElectronicSignature;
}

// Electronic Signature Types
export type SignatureStatus = 'pending' | 'signed' | 'declined' | 'expired';

export interface ElectronicSignature {
  id: string;
  document_id: string;
  signer_id: string;
  signer_name: string;
  signer_role: string;
  status: SignatureStatus;
  signature_hash?: string;
  ip_address?: string;
  user_agent?: string;
  signed_at?: string;
  expires_at: string;
  certificate_info?: {
    issuer: string;
    serial_number: string;
    valid_from: string;
    valid_to: string;
  };
}

export interface SignatureRequest {
  id: string;
  case_id: string;
  document_ids: string[];
  requested_by: string;
  signers: SignerInfo[];
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  created_at: string;
  expires_at: string;
  completed_at?: string;
}

export interface SignerInfo {
  id: string;
  signer_id: string;
  signer_name: string;
  signer_email: string;
  signer_role: string;
  order: number;
  status: SignatureStatus;
  signed_at?: string;
}

export interface AuditLogEntry {
  id: string;
  case_id: string;
  action: AuditAction;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  details: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  timestamp: string;
}

export type AuditAction = 
  | 'document_created'
  | 'document_viewed'
  | 'document_updated'
  | 'signature_requested'
  | 'signature_signed'
  | 'signature_declined'
  | 'signature_expired'
  | 'approval_granted'
  | 'approval_rejected'
  | 'case_status_changed'
  | 'case_published';
