import type { AdministrativeRole, Identity } from './model'

export interface AdminDirectoryEntry {
  userId: string
  organisationId: string
  roles: AdministrativeRole[]
  displayLabel: string
  supportChannel?: string
}

export interface AdminDirectoryRecord extends AdminDirectoryEntry {
  active: boolean
}

const VISIBLE_ADMIN_ROLES: readonly AdministrativeRole[] = [
  'USER_ADMIN',
  'ACCESS_ADMIN',
  'POLICY_ADMIN',
  'AUDIT_ADMIN',
  'SYSTEM_ADMIN',
  'SUPER_ADMIN',
]

export function resolveMyAdministrators(
  subject: Identity,
  directory: readonly AdminDirectoryRecord[],
): AdminDirectoryEntry[] {
  if (
    !subject.active ||
    subject.accountClass === 'PERSONAL' ||
    !subject.organisationId
  ) {
    return []
  }

  return directory
    .filter(
      (entry) =>
        entry.active &&
        entry.organisationId === subject.organisationId &&
        entry.roles.some((role) => VISIBLE_ADMIN_ROLES.includes(role)),
    )
    .map(({ active: _active, ...entry }) => entry)
}
