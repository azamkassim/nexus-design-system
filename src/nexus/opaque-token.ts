import { asOpaqueActionToken, type OpaqueActionToken } from './action-protocol'

export interface OpaqueTokenOptions {
  prefix?: string
  randomBytes?: number
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

export function generateOpaqueActionToken(
  options: OpaqueTokenOptions = {},
): OpaqueActionToken {
  const prefix = options.prefix ?? 'n'
  const randomBytes = options.randomBytes ?? 18

  if (!/^[A-Za-z][A-Za-z0-9]{0,11}$/.test(prefix)) {
    throw new Error('Opaque token prefix must be 1-12 alphanumeric characters')
  }

  if (randomBytes < 12 || randomBytes > 36) {
    throw new Error('Opaque token entropy must use 12-36 random bytes')
  }

  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Secure random generator is unavailable')
  }

  const bytes = new Uint8Array(randomBytes)
  globalThis.crypto.getRandomValues(bytes)

  return asOpaqueActionToken(`${prefix}_${toBase64Url(bytes)}`)
}

export function redactOpaqueToken(token: OpaqueActionToken): string {
  if (token.length <= 12) {
    return '[redacted]'
  }

  return `${token.slice(0, 5)}…${token.slice(-4)}`
}
