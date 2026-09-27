import type {
  CustomerWorkspace,
  Engine,
  Task,
  TeamMember,
} from '../domain/nexus';

export const teamMembers: TeamMember[] = [
  {
    id: 'lead',
    name: 'Team Lead',
    role: 'team_lead',
    capacity: 100,
    activeTasks: 5,
    dueToday: 3,
    blockedTasks: 1,
  },
  {
    id: 'rm-a',
    name: 'RM A',
    role: 'rm',
    capacity: 78,
    activeTasks: 7,
    dueToday: 2,
    blockedTasks: 2,
  },
  {
    id: 'rm-b',
    name: 'RM B',
    role: 'rm',
    capacity: 64,
    activeTasks: 5,
    dueToday: 1,
    blockedTasks: 1,
  },
];

export const engines: Engine[] = [
  { id: 'capture', name: 'Intake & Data Capture', shortName: 'CAPTURE', purpose: 'Capture once, validate, reuse everywhere.', status: 'active', humanGate: false },
  { id: 'document', name: 'Document Intelligence', shortName: 'DOC INTEL', purpose: 'Classify and extract source documents.', status: 'active', humanGate: false },
  { id: 'evidence', name: 'Evidence & Provenance', shortName: 'EVIDENCE', purpose: 'Anchor facts, calculations and decisions to source.', status: 'active', humanGate: false },
  { id: 'knowledge', name: 'Knowledge Hub', shortName: 'KNOWLEDGE', purpose: 'Reusable customer, industry and precedent knowledge.', status: 'active', humanGate: false },
  { id: 'cffs', name: 'CFFS Financial Engine', shortName: 'CFFS', purpose: 'Financial spreading, ratios and projected cash flow.', status: 'active', humanGate: false },
  { id: 'scorecard', name: 'Scorecard Engine', shortName: 'SCORECARD', purpose: 'Structured risk scoring with governed inputs.', status: 'review', humanGate: true },
  { id: 'credit', name: 'Credit Intelligence', shortName: 'CREDIT', purpose: 'Surface strengths, weaknesses, mitigants and gaps.', status: 'active', humanGate: true },
  { id: 'policy', name: 'Policy & Decisioning', shortName: 'POLICY', purpose: 'Evaluate policy clauses, exceptions and conditions.', status: 'active', humanGate: true },
  { id: 'workflow', name: 'Workflow & Approvals', shortName: 'FLOW', purpose: 'Ownership, stage gates, blockers and approvals.', status: 'active', humanGate: true },
  { id: 'reporting', name: 'Reporting & Document Generation', shortName: 'REPORTS', purpose: 'Generate credit papers, executive summaries, memos and approval slides.', status: 'active', humanGate: true },
  { id: 'monitoring', name: 'Monitoring & Alerts', shortName: 'MONITOR', purpose: 'Track due dates, deterioration and handoff conditions.', status: 'idle', humanGate: false },
  { id: 'integration', name: 'Integration & Synchronisation', shortName: 'CONNECT', purpose: 'Move governed data between approved systems.', status: 'review', humanGate: true },
];

export const tasks: Task[] = [
  {
    id: 't1',
    title: 'Resolve projected cash-flow gap',
    ownerId: 'rm-a',
    customerId: 'demo-1',
    workspaceSection: 'Financials & Cash Flow',
    status: 'blocked',
    priority: 'critical',
    due: 'Today 11:00',
    blocker: 'Latest contract schedule not received.',
    nextBestAction: 'Complete security review and policy mapping while waiting.',
    evidenceCount: 8,
  },
  {
    id: 't2',
    title: 'Validate facility structure',
    ownerId: 'rm-b',
    customerId: 'demo-2',
    workspaceSection: 'Facility & Purpose',
    status: 'needs_human_review',
    priority: 'high',
    due: 'Today 14:00',
    nextBestAction: 'Team Lead review pricing assumptions and conditions.',
    evidenceCount: 12,
  },
  {
    id: 't3',
    title: 'Complete management assessment',
    ownerId: 'rm-a',
    customerId: 'demo-1',
    workspaceSection: 'Ownership & Management',
    status: 'in_progress',
    priority: 'normal',
    due: 'Today 15:30',
    evidenceCount: 5,
  },
  {
    id: 't4',
    title: 'Prepare approval committee narrative',
    ownerId: 'lead',
    customerId: 'demo-2',
    workspaceSection: 'Risk, Mitigants & Recommendation',
    status: 'ready',
    priority: 'high',
    due: 'Tomorrow 09:00',
    evidenceCount: 19,
  },
  {
    id: 't5',
    title: 'Confirm outstanding information list',
    ownerId: 'rm-b',
    customerId: 'demo-3',
    workspaceSection: 'Evidence & Information Gaps',
    status: 'waiting_external',
    priority: 'normal',
    due: 'Tomorrow 12:00',
    blocker: 'Awaiting customer documents.',
    nextBestAction: 'Complete industry and policy checks from available evidence.',
    evidenceCount: 6,
  },
];

const commonSections = [
  ['executive', 'Executive View'],
  ['eligibility', 'Eligibility & Compliance'],
  ['facility', 'Facility Structure'],
  ['security', 'Security & Coverage'],
  ['purpose', 'Purpose & Rationale'],
  ['customer', 'Customer & Group'],
  ['financials', 'Financial Analysis'],
  ['contract', 'Contract / Revenue Base'],
  ['payment-capacity', 'Payment Capacity'],
  ['industry', 'Industry & Market'],
  ['exposure', 'Exposure'],
  ['risk', 'Risk, Mitigants & Monitoring'],
  ['policy', 'Policy & Conditions'],
  ['recommendation', 'Recommendation'],
  ['evidence-pack', 'Attachments & Evidence'],
  ['handoff', 'Downstream Handoff'],
] as const;

const makeSections = (seed: number) =>
  commonSections.map(([id, label], index) => ({
    id,
    label,
    progress: Math.min(100, 42 + seed * 8 + index * 4),
    status:
      index < seed + 3
        ? ('complete' as const)
        : index === seed + 3
          ? ('in_progress' as const)
          : ('ready' as const),
    fields:
      id === 'facility'
        ? [
            {
              id: id + '-1',
              label: 'Requested Amount',
              value: seed === 1 ? 'RM 18.0m' : seed === 2 ? 'RM 7.5m' : 'RM 12.0m',
              source: 'Customer request / term sheet',
              evidenceState: 'verified' as const,
              enteredBy: 'extracted' as const,
              reusedIn: ['Credit Paper', 'Executive Summary', 'Slides', 'Approval Memo'],
            },
            {
              id: id + '-2',
              label: 'Financing Purpose',
              value: 'Contract execution and working capital',
              source: 'Application documents',
              evidenceState: 'verified' as const,
              enteredBy: 'rm' as const,
              reusedIn: ['Credit Paper', 'Executive Summary', 'Slides'],
            },
          ]
        : id === 'financials'
          ? [
              {
                id: id + '-1',
                label: 'Cash-flow Coverage',
                value: seed === 1 ? '1.31x' : seed === 2 ? '1.18x' : 'Pending',
                source: 'CFFS calculation',
                evidenceState: seed === 3 ? ('gap' as const) : ('derived' as const),
                enteredBy: 'calculated' as const,
                reusedIn: ['Credit Paper', 'Executive Summary', 'Scorecard', 'Slides'],
              },
            ]
          : [],
  }));

export const workspaces: CustomerWorkspace[] = [
  {
    id: 'demo-1',
    customerName: 'Apex Marine Services Sdn Bhd',
    contractName: 'Contract Financing 2026',
    applicationType: 'Existing + Additional Financing',
    requestedAmount: 'RM 18.0m',
    stage: 'Credit Assessment',
    ownerId: 'rm-a',
    riskState: 'attention',
    nextDecision: 'Resolve cash-flow evidence gap',
    sections: makeSections(1),
  },
  {
    id: 'demo-2',
    customerName: 'Northstar Engineering Sdn Bhd',
    contractName: 'Project Facility 2026',
    applicationType: 'New Financing',
    requestedAmount: 'RM 7.5m',
    stage: 'Team Lead Review',
    ownerId: 'rm-b',
    riskState: 'normal',
    nextDecision: 'Approve facility structure for paper generation',
    sections: makeSections(2),
  },
  {
    id: 'demo-3',
    customerName: 'Meridian Logistics Sdn Bhd',
    contractName: 'Annual Review 2026',
    applicationType: 'Annual Review + Additional',
    requestedAmount: 'RM 12.0m',
    stage: 'Information Gathering',
    ownerId: 'rm-b',
    riskState: 'critical',
    nextDecision: 'Obtain missing customer evidence',
    sections: makeSections(0),
  },
];
