import {
  buildNexusUri,
  type NexusActionRef,
} from './action-protocol'

export type NexusLinkChannel = 'nexus' | 'web' | 'telegram'

export interface TelegramMiniAppConfig {
  botUsername: string
  miniAppShortName?: string
  mode?: 'compact' | 'fullscreen'
}

export interface NexusLinkRouterConfig {
  webBaseUrl: string
  telegram?: TelegramMiniAppConfig
}

function normaliseBaseUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

function normaliseTelegramName(value: string, label: string): string {
  const cleaned = value.replace(/^@/, '')

  if (!/^[A-Za-z0-9_]{3,64}$/.test(cleaned)) {
    throw new Error(`Invalid Telegram ${label}`)
  }

  return cleaned
}

export function buildWebActionLink(
  ref: NexusActionRef,
  config: NexusLinkRouterConfig,
): string {
  const base = normaliseBaseUrl(config.webBaseUrl)
  return `${base}/a/${encodeURIComponent(ref.token)}`
}

export function buildTelegramActionLink(
  ref: NexusActionRef,
  config: NexusLinkRouterConfig,
): string {
  if (!config.telegram) {
    throw new Error('Telegram link routing is not configured')
  }

  const botUsername = normaliseTelegramName(
    config.telegram.botUsername,
    'bot username',
  )
  const miniAppShortName = config.telegram.miniAppShortName
    ? normaliseTelegramName(
        config.telegram.miniAppShortName,
        'Mini App short name',
      )
    : undefined

  const appPath = miniAppShortName
    ? `/${miniAppShortName}`
    : ''

  const mode = config.telegram.mode ?? 'fullscreen'

  return (
    `https://t.me/${botUsername}${appPath}` +
    `?startapp=${encodeURIComponent(ref.token)}` +
    `&mode=${mode}`
  )
}

export function routeActionLink(
  ref: NexusActionRef,
  channel: NexusLinkChannel,
  config: NexusLinkRouterConfig,
): string {
  if (channel === 'nexus') {
    return buildNexusUri(ref)
  }

  if (channel === 'web') {
    return buildWebActionLink(ref, config)
  }

  return buildTelegramActionLink(ref, config)
}
