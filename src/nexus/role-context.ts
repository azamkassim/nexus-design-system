export type NexusRoleContext = {
  roleId: string
  roleLabel: string
  businessUnit: string
  primaryTeam: string
  segment: string
  subTeam: string
  disambiguation: string
  defaultNeeds: string[]
  defaultQuestions: string[]
}

export const preApprovalCorporateSmeTeamLead: NexusRoleContext = {
  roleId: 'pre-approval-corporate-sme-team-2-lead',
  roleLabel: 'AM / Team Leader BRM',
  businessUnit: 'Business Banking Unit',
  primaryTeam: 'Team 1 · Pre Approval',
  segment: 'Corporate / SME',
  subTeam: 'Team 2',
  disambiguation:
    'This Team 2 is the Corporate/SME sub-team under Team 1 Pre Approval. It is not the separate top-level Team 2 Post Approval.',
  defaultNeeds: [
    'Current pre-approval pipeline and case stage',
    'Cases requiring Team Lead review or decision',
    'Cashflow and repayment-capacity readiness',
    'CAR and credit-submission readiness',
    'Financial, bank-statement and ageing review',
    'Site-visit readiness and findings',
    'Missing evidence and customer follow-up',
    'Team workload, overdue work and blockers',
    'Upcoming approval or committee deadlines',
    'Monthly and quarterly performance visibility',
  ],
  defaultQuestions: [
    'What needs attention now?',
    'What is the team working on?',
    'What is blocked, overdue or becoming risky?',
    'What requires the Team Lead decision?',
    'What is the next best action?',
  ],
}

export function describeRoleScope(context: NexusRoleContext): string {
  return `${context.businessUnit} / ${context.primaryTeam} / ${context.segment} / ${context.subTeam}`
}
