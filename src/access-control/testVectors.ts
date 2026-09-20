import { evaluateAccess } from './evaluator'
import type {
  AccessRequest,
  DecisionCode,
  Identity,
  Resource,
} from './model'

const NOW = '2026-09-20T11:00:00Z'
const POLICY_VERSION = 'nexus-identity-v0.1'
const ORG = 'org-demo'
const WORKSPACE_A = 'workspace-a'
const WORKSPACE_B = 'workspace-b'

const baseResource: Resource = {
  resourceId: 'application-a',
  resourceType: 'APPLICATION',
  organisationId: ORG,
  workspaceId: WORKSPACE_A,
  sensitivity: 'RESTRICTED_CUSTOMER',
  workflowStage: 'DRAFT',
  amount: 4_000_000,
  currency: 'MYR',
  product: 'TERM_FINANCING_I',
}

const baseRm: Identity = {
  userId: 'rm-1',
  organisationId: ORG,
  accountClass: 'ORGANISATION',
  active: true,
  administrativeRoles: [],
  businessRoles: ['RM'],
  teamIds: ['team-2'],
  workspaceMemberships: [
    {
      workspaceId: WORKSPACE_A,
      teamId: 'team-2',
      validFrom: '2026-01-01T00:00:00Z',
    },
  ],
  delegatedAuthorities: [],
}

function request(
  subject: Identity,
  action: AccessRequest['action'],
  resource: Resource = baseResource,
): AccessRequest {
  return {
    subject,
    action,
    resource,
    now: NOW,
    policyVersion: POLICY_VERSION,
  }
}

export interface AccessControlTestVector {
  name: string
  request: AccessRequest
  expected: DecisionCode
}

export const ACCESS_CONTROL_TEST_VECTORS: readonly AccessControlTestVector[] = [
  {
    name: 'RM can view assigned workspace',
    request: request(baseRm, 'VIEW'),
    expected: 'ALLOW',
  },
  {
    name: 'RM cannot view another customer workspace',
    request: request(baseRm, 'VIEW', {
      ...baseResource,
      workspaceId: WORKSPACE_B,
    }),
    expected: 'DENY_WORKSPACE_MEMBERSHIP',
  },
  {
    name: 'Suspended identity is denied',
    request: request({ ...baseRm, active: false }, 'VIEW'),
    expected: 'DENY_INACTIVE_IDENTITY',
  },
  {
    name: 'Personal identity is denied organisation access',
    request: request({ ...baseRm, accountClass: 'PERSONAL' }, 'VIEW'),
    expected: 'DENY_PERSONAL_ACCOUNT',
  },
  {
    name: 'RM cannot approve',
    request: request(baseRm, 'APPROVE', {
      ...baseResource,
      workflowStage: 'APPROVAL',
    }),
    expected: 'DENY_ROLE',
  },
  {
    name: 'System admin does not inherit financing approval',
    request: request(
      {
        ...baseRm,
        businessRoles: [],
        administrativeRoles: ['SYSTEM_ADMIN'],
      },
      'APPROVE',
      {
        ...baseResource,
        workflowStage: 'APPROVAL',
      },
    ),
    expected: 'DENY_ROLE',
  },
  {
    name: 'Approver needs delegated authority',
    request: request(
      {
        ...baseRm,
        businessRoles: ['APPROVER'],
      },
      'APPROVE',
      {
        ...baseResource,
        workflowStage: 'APPROVAL',
      },
    ),
    expected: 'DENY_AUTHORITY',
  },
  {
    name: 'Approver with matching authority can approve',
    request: request(
      {
        ...baseRm,
        businessRoles: ['APPROVER'],
        delegatedAuthorities: [
          {
            authorityId: 'doa-1',
            action: 'APPROVE',
            product: 'TERM_FINANCING_I',
            maxAmount: 5_000_000,
            currency: 'MYR',
            validFrom: '2026-01-01T00:00:00Z',
            validUntil: '2026-12-31T23:59:59Z',
          },
        ],
      },
      'APPROVE',
      {
        ...baseResource,
        workflowStage: 'APPROVAL',
      },
    ),
    expected: 'ALLOW',
  },
  {
    name: 'External user can create evidence only in assigned workspace',
    request: request(
      {
        ...baseRm,
        userId: 'external-1',
        accountClass: 'EXTERNAL',
        businessRoles: [],
      },
      'CREATE',
      {
        ...baseResource,
        resourceId: 'evidence-new',
        resourceType: 'EVIDENCE',
      },
    ),
    expected: 'ALLOW',
  },
  {
    name: 'Service identity cannot perform human approval',
    request: request(
      {
        ...baseRm,
        userId: 'service-1',
        accountClass: 'SERVICE',
        ownerUserId: 'rm-1',
        businessRoles: ['APPROVER'],
      },
      'APPROVE',
      {
        ...baseResource,
        workflowStage: 'APPROVAL',
      },
    ),
    expected: 'DENY_SERVICE_IDENTITY',
  },
]

export function runAccessControlSelfCheck(): string[] {
  const failures: string[] = []

  for (const vector of ACCESS_CONTROL_TEST_VECTORS) {
    const actual = evaluateAccess(vector.request).code
    if (actual !== vector.expected) {
      failures.push(
        `${vector.name}: expected ${vector.expected}, received ${actual}`,
      )
    }
  }

  return failures
}
