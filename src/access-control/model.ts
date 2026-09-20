export type AccountClass =
  | 'ORGANISATION'
  | 'EXTERNAL'
  | 'PERSONAL'
  | 'SERVICE'

export type AdministrativeRole =
  | 'USER_ADMIN'
  | 'ACCESS_ADMIN'
  | 'POLICY_ADMIN'
  | 'AUDIT_ADMIN'
  | 'SYSTEM_ADMIN'
  | 'SUPER_ADMIN'

export type BusinessRole =
  | 'RM'
  | 'TEAM_LEAD'
  | 'CREDIT'
  | 'RISK'
  | 'POLICY_OWNER'
  | 'APPROVER'
  | 'MONITORING'
  | 'READ_ONLY'

export type Action =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'COMMENT'
  | 'SUBMIT'
  | 'VERIFY'
  | 'ENDORSE'
  | 'APPROVE'
  | 'RETURN'
  | 'OVERRIDE'
  | 'EXPORT'
  | 'SHARE'
  | 'ADMINISTER'

export type Sensitivity =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED_CUSTOMER'

export type WorkflowStage =
  | 'DRAFT'
  | 'REVIEW'
  | 'CREDIT_REVIEW'
  | 'RISK_REVIEW'
  | 'APPROVAL'
  | 'MONITORING'
  | 'CLOSED'

export type ResourceType =
  | 'IDENTITY'
  | 'TEAM'
  | 'ROLE'
  | 'ADMIN_DIRECTORY'
  | 'SYSTEM'
  | 'WORKSPACE'
  | 'CUSTOMER'
  | 'APPLICATION'
  | 'FACILITY'
  | 'SECURITY'
  | 'CONTRACT'
  | 'EVIDENCE'
  | 'KNOWLEDGE'
  | 'POLICY'
  | 'AUDIT'

export interface DelegatedAuthority {
  authorityId: string
  action: Action
  product?: string
  maxAmount?: number
  currency?: string
  validFrom: string
  validUntil?: string
}

export interface WorkspaceMembership {
  workspaceId: string
  teamId?: string
  validFrom: string
  validUntil?: string
}

export interface Identity {
  userId: string
  organisationId?: string
  accountClass: AccountClass
  ownerUserId?: string
  active: boolean
  administrativeRoles: AdministrativeRole[]
  businessRoles: BusinessRole[]
  teamIds: string[]
  workspaceMemberships: WorkspaceMembership[]
  delegatedAuthorities: DelegatedAuthority[]
}

export interface Resource {
  resourceId: string
  resourceType: ResourceType
  organisationId: string
  workspaceId?: string
  sensitivity: Sensitivity
  workflowStage?: WorkflowStage
  amount?: number
  currency?: string
  product?: string
}

export interface AccessRequest {
  subject: Identity
  action: Action
  resource: Resource
  now: string
  policyVersion: string
  breakGlass?: boolean
}

export type DecisionCode =
  | 'ALLOW'
  | 'DENY_INACTIVE_IDENTITY'
  | 'DENY_ORGANISATION_MISMATCH'
  | 'DENY_PERSONAL_ACCOUNT'
  | 'DENY_SERVICE_IDENTITY'
  | 'DENY_WORKSPACE_MEMBERSHIP'
  | 'DENY_ROLE'
  | 'DENY_WORKFLOW_STAGE'
  | 'DENY_AUTHORITY'
  | 'DENY_SENSITIVITY'
  | 'DENY_BREAK_GLASS'
  | 'DENY_MISSING_CONTEXT'

export interface AccessDecision {
  allowed: boolean
  code: DecisionCode
  reasons: string[]
  policyVersion: string
}
