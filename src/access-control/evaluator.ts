import type {
  AccessDecision,
  AccessRequest,
  Action,
  AdministrativeRole,
  BusinessRole,
  DelegatedAuthority,
  ResourceType,
  WorkflowStage,
} from './model'

const BUSINESS_ROLE_ACTIONS: Record<Action, readonly BusinessRole[]> = {
  VIEW: [
    'RM',
    'TEAM_LEAD',
    'CREDIT',
    'RISK',
    'POLICY_OWNER',
    'APPROVER',
    'MONITORING',
    'READ_ONLY',
  ],
  CREATE: ['RM', 'TEAM_LEAD', 'MONITORING'],
  EDIT: ['RM', 'TEAM_LEAD', 'MONITORING'],
  COMMENT: [
    'RM',
    'TEAM_LEAD',
    'CREDIT',
    'RISK',
    'POLICY_OWNER',
    'APPROVER',
    'MONITORING',
  ],
  SUBMIT: ['RM', 'TEAM_LEAD'],
  VERIFY: ['TEAM_LEAD', 'CREDIT', 'RISK', 'POLICY_OWNER'],
  ENDORSE: ['TEAM_LEAD', 'CREDIT', 'RISK'],
  APPROVE: ['APPROVER'],
  RETURN: ['TEAM_LEAD', 'CREDIT', 'RISK', 'APPROVER'],
  OVERRIDE: ['POLICY_OWNER', 'APPROVER'],
  EXPORT: [
    'RM',
    'TEAM_LEAD',
    'CREDIT',
    'RISK',
    'POLICY_OWNER',
    'APPROVER',
    'MONITORING',
  ],
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

const SERVICE_FORBIDDEN_ACTIONS: readonly Action[] = [
  'VERIFY',
  'ENDORSE',
  'APPROVE',
  'RETURN',
  'OVERRIDE',
  'ADMINISTER',
]

const ADMINISTER_ROLES: Partial<
  Record<ResourceType, readonly AdministrativeRole[]>
> = {
  IDENTITY: ['USER_ADMIN', 'ACCESS_ADMIN', 'SUPER_ADMIN'],
  TEAM: ['ACCESS_ADMIN', 'SUPER_ADMIN'],
  ROLE: ['ACCESS_ADMIN', 'POLICY_ADMIN', 'SUPER_ADMIN'],
  ADMIN_DIRECTORY: ['USER_ADMIN', 'ACCESS_ADMIN', 'SUPER_ADMIN'],
  SYSTEM: ['SYSTEM_ADMIN', 'SUPER_ADMIN'],
  WORKSPACE: ['ACCESS_ADMIN', 'SUPER_ADMIN'],
  POLICY: ['POLICY_ADMIN', 'SUPER_ADMIN'],
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

function hasAnyAdministrativeRole(
  request: AccessRequest,
  allowedRoles: readonly AdministrativeRole[],
): boolean {
  return request.subject.administrativeRoles.some((role) =>
    allowedRoles.includes(role),
  )
}

function administrativeAccessDecision(
  request: AccessRequest,
): boolean | undefined {
  const { action, resource, subject } = request

  if (action === 'ADMINISTER') {
    const allowedRoles = ADMINISTER_ROLES[resource.resourceType]
    return Boolean(allowedRoles && hasAnyAdministrativeRole(request, allowedRoles))
  }

  if (resource.resourceType === 'ADMIN_DIRECTORY') {
    return action === 'VIEW' && subject.accountClass !== 'SERVICE'
  }

  if (resource.resourceType === 'IDENTITY') {
    if (action === 'VIEW' && resource.resourceId === subject.userId) {
      return true
    }

    if (action === 'VIEW') {
      return hasAnyAdministrativeRole(request, [
        'USER_ADMIN',
        'ACCESS_ADMIN',
        'SUPER_ADMIN',
      ])
    }

    return false
  }

  if (resource.resourceType === 'TEAM' || resource.resourceType === 'ROLE') {
    if (action === 'VIEW') {
      return subject.accountClass === 'ORGANISATION'
    }

    return undefined
  }

  if (resource.resourceType === 'SYSTEM') {
    if (action === 'VIEW') {
      return hasAnyAdministrativeRole(request, ['SYSTEM_ADMIN', 'SUPER_ADMIN'])
    }

    return false
  }

  if (resource.resourceType === 'AUDIT') {
    if (action === 'VIEW' || action === 'EXPORT') {
      return hasAnyAdministrativeRole(request, ['AUDIT_ADMIN', 'SUPER_ADMIN'])
    }

    return false
  }

  if (resource.resourceType === 'POLICY' && action === 'ADMINISTER') {
    return hasAnyAdministrativeRole(request, ['POLICY_ADMIN', 'SUPER_ADMIN'])
  }

  return undefined
}

function roleAllowsAction(request: AccessRequest): boolean {
  const administrativeDecision = administrativeAccessDecision(request)
  if (administrativeDecision !== undefined) {
    return administrativeDecision
  }

  if (request.subject.accountClass === 'EXTERNAL') {
    if (request.action === 'CREATE') {
      return request.resource.resourceType === 'EVIDENCE'
    }

    return request.action === 'VIEW' || request.action === 'COMMENT'
  }

  const allowedRoles = BUSINESS_ROLE_ACTIONS[request.action]
  return request.subject.businessRoles.some((role) =>
    allowedRoles.includes(role),
  )
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
    authority.currency !== request.resource.currency
  ) {
    return false
  }

  if (
    authority.maxAmount !== undefined &&
    (request.resource.amount === undefined ||
      request.resource.amount > authority.maxAmount)
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

  if (Number.isNaN(Date.parse(request.now))) {
    return deny(
      request,
      'DENY_MISSING_CONTEXT',
      'Authorization time is invalid.',
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
    request.subject.accountClass === 'SERVICE' &&
    (!request.subject.ownerUserId ||
      SERVICE_FORBIDDEN_ACTIONS.includes(request.action))
  ) {
    return deny(
      request,
      'DENY_SERVICE_IDENTITY',
      'Service identities require an accountable owner and cannot perform human decision actions.',
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
