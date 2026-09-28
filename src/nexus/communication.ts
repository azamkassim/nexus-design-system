import type { OpaqueActionToken } from './action-protocol'

export type CommunicationChannel =
  | 'whatsapp'
  | 'outlook'
  | 'telegram'

export type DataClassification =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED'

export interface CommunicationIntent {
  intentId: string
  workspaceToken: OpaqueActionToken
  purpose: string
  recipientRef: string
  classification: DataClassification
  preferredChannel?: CommunicationChannel
  attachmentRefs?: readonly string[]
}

export interface CommunicationPreview {
  channel: CommunicationChannel
  recipientLabel: string
  bodyPreview: string
  attachmentCount: number
}

export interface DispatchContext {
  humanApproved: boolean
  actorRef: string
}

export interface DispatchResult {
  status: 'sent' | 'blocked' | 'failed'
  channel: CommunicationChannel
  providerReference?: string
  reason?: string
}

export interface CommunicationAdapter {
  readonly channel: CommunicationChannel
  preview(intent: CommunicationIntent): Promise<CommunicationPreview>
  dispatch(
    intent: CommunicationIntent,
    context: DispatchContext,
  ): Promise<DispatchResult>
}

export interface ChannelPolicy {
  canUse(
    channel: CommunicationChannel,
    classification: DataClassification,
  ): boolean
  explain?(
    channel: CommunicationChannel,
    classification: DataClassification,
  ): string
}

export async function dispatchCommunication(
  intent: CommunicationIntent,
  adapter: CommunicationAdapter,
  policy: ChannelPolicy,
  context: DispatchContext,
): Promise<DispatchResult> {
  if (!context.humanApproved) {
    return {
      status: 'blocked',
      channel: adapter.channel,
      reason: 'Human approval is required before dispatch',
    }
  }

  if (!policy.canUse(adapter.channel, intent.classification)) {
    return {
      status: 'blocked',
      channel: adapter.channel,
      reason:
        policy.explain?.(
          adapter.channel,
          intent.classification,
        ) ?? 'Channel is not permitted for this data classification',
    }
  }

  return adapter.dispatch(intent, context)
}
