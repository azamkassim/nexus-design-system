export type WorkStatus =
  | 'ready'
  | 'in_progress'
  | 'blocked'
  | 'waiting_external'
  | 'needs_human_review'
  | 'complete';

export type Priority = 'critical' | 'high' | 'normal' | 'low';

export type TeamMember = {
  id: string;
  name: string;
  role: 'team_lead' | 'rm';
  capacity: number;
  activeTasks: number;
  dueToday: number;
  blockedTasks: number;
};

export type Task = {
  id: string;
  title: string;
  ownerId: string;
  customerId: string;
  workspaceSection: string;
  status: WorkStatus;
  priority: Priority;
  due: string;
  blocker?: string;
  nextBestAction?: string;
  evidenceCount: number;
};

export type Engine = {
  id: string;
  name: string;
  shortName: string;
  purpose: string;
  status: 'active' | 'review' | 'idle';
  humanGate: boolean;
};

export type EvidenceState = 'verified' | 'unverified' | 'derived' | 'gap';

export type WorkspaceField = {
  id: string;
  label: string;
  value: string;
  source: string;
  evidenceState: EvidenceState;
  enteredBy: 'rm' | 'extracted' | 'calculated' | 'governed';
  reusedIn: string[];
};

export type WorkspaceSection = {
  id: string;
  label: string;
  progress: number;
  status: WorkStatus;
  fields: WorkspaceField[];
};

export type CustomerWorkspace = {
  id: string;
  customerName: string;
  contractName: string;
  applicationType: string;
  requestedAmount: string;
  stage: string;
  ownerId: string;
  riskState: 'normal' | 'attention' | 'critical';
  nextDecision: string;
  sections: WorkspaceSection[];
};
