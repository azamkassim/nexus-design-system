import type {
  AccessDecision,
  AccessRequest,
  Action,
  BusinessRole,
  DelegatedAuthority,
  WorkflowStage,
} from './model'

const BUSINESS_ROLE_ACTIONS: Record<Action, readonly BusinessRole[]> = {
  VIEW: ['RM', 'TEAM_LEAD', 'CREDIT', 'RISK', 'POLICY_OWNER', 'APPROVER', 'MONITORING', 'READ_ONLY'],
  CREATE: ['RM', 'TEAM_LEAD', 'MONITORING'],
  EDIT: ['RM', 'TEAM_LEAD', 'MONITORING'],
  COMMENT: ['RM', 'TEAM_LEAD', 'CREDIT', 'RISK', 'POLICY_OWNER', 'APPROVER', 'MONITORING'],
  SUBMIT: ['RM', 'TEAM_LEAD'],
  VERIFY: ['TEAM_LEAD', 'CREDIT', 'RISK', 'POLICY_OWNER'],
  ENDORSE: ['TEAM_LEAD', 'CREDIT', 'RISK'],
  APPROVE: ['APPROVER'],
  RETURN: ['TEAM_LEAD', 'CREDIT', 'RISK', 'APPROVER'],
  OVERRIDE: ['POLICY_OWNER', 'APPROVER'],
  EXPORT: ['RM', 'TEAM_LEAD', 'CREDIT', 'RISK', 'POLICY_OWNER', 'APPROVER', 'MONITORING'],
  SHARE: ['TEAM_LEAD', 'CREDIT', 'RISK', 'POLICY_OWNER', 'APPROVER'],
  ADMINISTER: [],
}

const WORKFLOW_ACTIONS: Partial<Record<Action, readonly WorkflowStage[]>> = {
  EDIT: ['DRAFT', 'REVIEW', 'MONITORING'],
  SUBMIT: ['DRAFT', 'REVIEW'],
  VERIFY: ['REVIEW', 'CREDIT_REVIEW', 'RISK_REVIEW'],
  ENDORSE: ['REVIEW', 'CREDIT_REVIEW', 'RISK_REVIEW'],
  APPROVE: ['APPROVAL'],
  RETURN: ['REVIEW', 'CREDIT_REVIEW', 'RISK_REVIEW', 'APPROVAL'],
  OVERRIDE: ['APPROVAL', 'MONITORING'],
}

function deny(
  request: AccessRequest,
  code: AccessDecision['code'],
  reason: string,
): AccessDecision {
  return {
    allowed: false,
    code,
    reasons: [reason],
    policyVersion: request.policyVersion,
  }
}

function isDateActive(
  now: string,
  validFrom: string,
  validUntil?: string,
): boolean {
  const current = Date.parse(now)
  const start = Date.parse(validFrom)
  const end = validUntil ? Date.parse(validUntil) : Number.POSITIVE_INFINITY

  if ([current, start, end].some((value) => Number.isNaN(value))) {
    return false
  }

  return current >= start && current <= end
}

function hasActiveWorkspaceMembership(request: AccessRequest): boolean {
  const workspaceId = request.resource.workspaceId
  if (!workspaceId) {
    return true
  }

  return request.subject.workspaceMemberships.some(
    (membership) =>
      membership.workspaceId === workspaceId &&
      isDateActive(request.now, membership.validFrom, membership.validUntil),
  )
}

function roleAllowsAction(request: AccessRequest): boolean {
  if (request.action === 'ADMINISTER') {
    return request.subject.administrativeRoles.length > 0
  }

  if (request.subject.accountClass === 'EXTERNAL') {
    return ['VIEW', 'CREATE', 'COMMENT'].includes(request.action)
  }

  const allowedRoles = BUSINESS_ROLE_ACTIONS[request.action]
  return request.subject.businessRoles.some((role) => allowedRoles.includes(role))
}

function workflowAllowsAction(request: AccessRequest): boolean {
  const allowedStages = WORKFLOW_ACTIONS[request.action]
  if (!allowedStages) {
    return true
  }

  const stage = request.resource.workflowStage
  return Boolean(stage && allowedStages.includes(stage))
}

function authorityMatches(
  authority: DelegatedAuthority,
  request: AccessRequest,
): boolean {
  if (authority.action !== request.action) {
    return false
  }

  if (!isDateActive(request.now, authority.validFrom, authority.validUntil)) {
    return false
  }

  if (authority.product && authority.product !== request.resource.product) {
    return false
  }

  if (
    authority.currency &&
    request.resource.currency &&
    authority.currency !== request.resource.currency
  ) {
    return false
  }

  if (
    authority.maxAmount !== undefined &&
    request.resource.amount !== undefined &&
    request.resource.amount > authority.maxAmount
  ) {
    return false
  }

  return true
}

function requiresDelegatedAuthority(action: Action): boolean {
  return action === 'APPROVE' || action === 'OVERRIDE'
}

export function evaluateAccess(request: AccessRequest): AccessDecision {
  if (!request.policyVersion || !request.now || !request.resource.organisationId) {
    return deny(
      request,
      'DENY_MISSING_CONTEXT',
      'Required authorization context is missing.',
    )
  }

  if (!request.subject.active) {
    return deny(
      request,
      'DENY_INACTIVE_IDENTITY',
      'The identity is suspended or inactive.',
    )
  }

  if (request.subject.accountClass === 'PERSONAL') {
    return deny(
      request,
      'DENY_PERSONAL_ACCOUNT',
      'Personal identities cannot access organisation-managed resources.',
    )
  }

  if (
    !request.subject.organisationId ||
    request.subject.organisationId !== request.resource.organisationId
  ) {
    return deny(
      request,
      'DENY_ORGANISATION_MISMATCH',
      'The identity and resource belong to different organisations.',
    )
  }

  if (
    request.breakGlass &&
    !request.subject.administrativeRoles.includes('SUPER_ADMIN')
  ) {
    return deny(
      request,
      'DENY_BREAK_GLASS',
      'Break-glass mode is restricted to an explicitly assigned super administrator.',
    )
  }

  if (!hasActiveWorkspaceMembership(request)) {
    return deny(
      request,
      'DENY_WORKSPACE_MEMBERSHIP',
      'No active membership exists for this customer workspace.',
    )
  }

  if (!roleAllowsAction(request)) {
    return deny(
      request,
      'DENY_ROLE',
      'The assigned role does not permit the requested action.',
    )
  }

  if (!workflowAllowsAction(request)) {
    return deny(
      request,
      'DENY_WORKFLOW_STAGE',
      'The requested action is not permitted at the current workflow stage.',
    )
  }

  if (
    request.resource.sensitivity === 'RESTRICTED_CUSTOMER' &&
    request.subject.accountClass === 'EXTERNAL' &&
    !request.resource.workspaceId
  ) {
    return deny(
      request,
      'DENY_SENSITIVITY',
      'Restricted customer data requires an explicit workspace boundary.',
    )
  }

  if (
    requiresDelegatedAuthority(request.action) &&
    !request.subject.delegatedAuthorities.some((authority) =>
      authorityMatches(authority, request),
    )
  ) {
    return deny(
      request,
      'DENY_AUTHORITY',
      'No active delegated authority covers the requested action and transaction context.',
    )
  }

  return {
    allowed: true,
    code: 'ALLOW',
    reasons: ['All mandatory authorization gates passed.'],
    policyVersion: request.policyVersion,
  }
}
