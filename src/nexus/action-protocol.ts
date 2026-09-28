export const NEXUS_ACTION_PROTOCOL_VERSION = 1 as const

export type NexusResourceKind =
  | 'workspace'
  | 'task'
  | 'document'
  | 'communication'
  | 'approval'

export type NexusActionVerb =
  | 'open'
  | 'continue'
  | 'review'
  | 'approve'

export type OpaqueActionToken = string & {
  readonly __opaqueActionToken: unique symbol
}

const RESOURCE_KINDS: readonly NexusResourceKind[] = [
  'workspace',
  'task',
  'document',
  'communication',
  'approval',
]

const ACTION_VERBS: readonly NexusActionVerb[] = [
  'open',
  'continue',
  'review',
  'approve',
]

const TOKEN_PATTERN = /^(?:[A-Za-z][A-Za-z0-9]{0,11}_)?[A-Za-z0-9_-]{8,64}$/

export interface NexusActionRef {
  version: typeof NEXUS_ACTION_PROTOCOL_VERSION
  resource: NexusResourceKind
  token: OpaqueActionToken
  action: NexusActionVerb
}

function isResourceKind(value: string): value is NexusResourceKind {
  return RESOURCE_KINDS.includes(value as NexusResourceKind)
}

function isActionVerb(value: string): value is NexusActionVerb {
  return ACTION_VERBS.includes(value as NexusActionVerb)
}

export function asOpaqueActionToken(value: string): OpaqueActionToken {
  if (!TOKEN_PATTERN.test(value)) {
    throw new Error('Invalid NEXUS opaque action token')
  }

  return value as OpaqueActionToken
}

export function buildNexusUri(ref: NexusActionRef): string {
  const action = ref.action === 'open' ? '' : `?action=${encodeURIComponent(ref.action)}`
  return `nexus://${ref.resource}/${encodeURIComponent(ref.token)}${action}`
}

export function parseNexusUri(uri: string): NexusActionRef | null {
  let parsed: URL

  try {
    parsed = new URL(uri)
  } catch {
    return null
  }

  if (parsed.protocol !== 'nexus:') {
    return null
  }

  const resource = parsed.hostname
  const tokenValue = parsed.pathname.replace(/^\//, '')
  const actionValue = parsed.searchParams.get('action') ?? 'open'

  if (!isResourceKind(resource) || !isActionVerb(actionValue)) {
    return null
  }

  try {
    return {
      version: NEXUS_ACTION_PROTOCOL_VERSION,
      resource,
      token: asOpaqueActionToken(decodeURIComponent(tokenValue)),
      action: actionValue,
    }
  } catch {
    return null
  }
}
