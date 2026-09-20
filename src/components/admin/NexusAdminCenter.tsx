import { useMemo, useState } from 'react'
import {
  resolveMyAdministrators,
  type AdminDirectoryRecord,
  type Identity,
} from '../../access-control'

type AdminView = 'MY_ACCESS' | 'MY_ADMIN' | 'USERS' | 'ROLES' | 'WORKSPACES' | 'AUDIT'

export interface NexusAdminCenterProps {
  currentUser: Identity
  organisationName: string
  adminDirectory: readonly AdminDirectoryRecord[]
}

const NAV_ITEMS: readonly { id: AdminView; label: string }[] = [
  { id: 'MY_ACCESS', label: 'My Access' },
  { id: 'MY_ADMIN', label: 'My Administrator' },
  { id: 'USERS', label: 'Users' },
  { id: 'ROLES', label: 'Roles' },
  { id: 'WORKSPACES', label: 'Workspaces' },
  { id: 'AUDIT', label: 'Audit' },
]

function accountClassLabel(accountClass: Identity['accountClass']): string {
  switch (accountClass) {
    case 'ORGANISATION':
      return 'Organisation managed'
    case 'EXTERNAL':
      return 'External invitation'
    case 'PERSONAL':
      return 'Personal development'
    case 'SERVICE':
      return 'Service identity'
  }
}

function MyAccess({
  currentUser,
  organisationName,
}: Pick<NexusAdminCenterProps, 'currentUser' | 'organisationName'>) {
  return (
    <section className="space-y-md" aria-labelledby="my-access-heading">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-graphite-500">
          Identity
        </p>
        <h2 id="my-access-heading" className="mt-xs">
          My Access
        </h2>
      </div>

      <div className="nexus-panel divide-y divide-graphite-100">
        <dl className="grid gap-md p-md sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-graphite-500">
              Organisation
            </dt>
            <dd className="mt-xs text-sm font-semibold text-navy-950">
              {organisationName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-graphite-500">
              Account
            </dt>
            <dd className="mt-xs text-sm text-graphite-900">
              {accountClassLabel(currentUser.accountClass)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-graphite-500">
              Business roles
            </dt>
            <dd className="mt-xs text-sm text-graphite-900">
              {currentUser.businessRoles.length
                ? currentUser.businessRoles.join(', ')
                : 'None'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-graphite-500">
              Administrative roles
            </dt>
            <dd className="mt-xs text-sm text-graphite-900">
              {currentUser.administrativeRoles.length
                ? currentUser.administrativeRoles.join(', ')
                : 'None'}
            </dd>
          </div>
        </dl>

        <div className="p-md">
          <p className="text-sm font-semibold text-navy-950">Workspace access</p>
          {currentUser.workspaceMemberships.length ? (
            <ul className="mt-sm space-y-sm">
              {currentUser.workspaceMemberships.map((membership) => (
                <li
                  className="flex items-center justify-between gap-md rounded-md border border-graphite-100 p-sm"
                  key={membership.workspaceId}
                >
                  <span className="text-sm text-graphite-900">
                    {membership.workspaceId}
                  </span>
                  <span className="nexus-status-success">Assigned</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-sm text-sm text-graphite-500">
              No customer workspace is assigned.
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-graphite-500">
        Authentication identifies you. Roles, workspace membership, workflow
        stage and delegated authority determine what you may do.
      </p>
    </section>
  )
}

function MyAdministrator({
  currentUser,
  adminDirectory,
}: Pick<NexusAdminCenterProps, 'currentUser' | 'adminDirectory'>) {
  const admins = useMemo(
    () => resolveMyAdministrators(currentUser, adminDirectory),
    [currentUser, adminDirectory],
  )

  return (
    <section className="space-y-md" aria-labelledby="my-admin-heading">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-graphite-500">
          Help & governance
        </p>
        <h2 id="my-admin-heading" className="mt-xs">
          My Administrator
        </h2>
      </div>

      <div className="nexus-panel">
        {admins.length ? (
          <ul className="divide-y divide-graphite-100">
            {admins.map((admin) => (
              <li className="p-md" key={admin.userId}>
                <div className="flex flex-wrap items-start justify-between gap-sm">
                  <div>
                    <p className="font-semibold text-navy-950">
                      {admin.displayLabel}
                    </p>
                    <p className="mt-xs text-xs text-graphite-500">
                      {admin.roles.join(', ')}
                    </p>
                  </div>
                  <span className="nexus-status-info">Active admin</span>
                </div>
                {admin.supportChannel ? (
                  <p className="mt-sm text-sm text-graphite-700">
                    Support: {admin.supportChannel}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-md">
            <p className="font-semibold text-navy-950">
              No approved administrator is visible.
            </p>
            <p className="mt-sm text-sm text-graphite-700">
              Use the organisation support channel. NEXUS will not guess or
              expose hidden administrator details.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <section className="space-y-md">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-graphite-500">
          Administration
        </p>
        <h2 className="mt-xs">{title}</h2>
      </div>
      <div className="nexus-panel p-md">
        <p className="text-sm text-graphite-700">
          This surface is reserved for governed administration. Access controls
          will be applied before any mutation action is exposed.
        </p>
      </div>
    </section>
  )
}

export function NexusAdminCenter({
  currentUser,
  organisationName,
  adminDirectory,
}: NexusAdminCenterProps) {
  const [view, setView] = useState<AdminView>('MY_ACCESS')

  const content = (() => {
    switch (view) {
      case 'MY_ACCESS':
        return (
          <MyAccess
            currentUser={currentUser}
            organisationName={organisationName}
          />
        )
      case 'MY_ADMIN':
        return (
          <MyAdministrator
            currentUser={currentUser}
            adminDirectory={adminDirectory}
          />
        )
      case 'USERS':
        return <Placeholder title="Users" />
      case 'ROLES':
        return <Placeholder title="Roles" />
      case 'WORKSPACES':
        return <Placeholder title="Workspaces" />
      case 'AUDIT':
        return <Placeholder title="Audit" />
    }
  })()

  return (
    <div className="min-h-screen bg-white text-graphite-950">
      <header className="border-b border-graphite-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-md px-md py-md">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-graphite-500">
              NEXUS
            </p>
            <h1>Admin Center</h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-navy-950">
              {organisationName}
            </p>
            <p className="text-xs text-graphite-500">
              {currentUser.active ? 'Identity active' : 'Identity suspended'}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-lg px-md py-lg md:grid-cols-[220px_1fr]">
        <nav className="nexus-panel h-fit p-sm" aria-label="Admin Center">
          <ul className="space-y-xs">
            {NAV_ITEMS.map((item) => {
              const selected = view === item.id
              return (
                <li key={item.id}>
                  <button
                    className={[
                      'w-full rounded-md px-sm py-sm text-left text-sm font-medium transition-colors',
                      selected
                        ? 'bg-graphite-100 text-navy-950'
                        : 'text-graphite-700 hover:bg-graphite-100',
                    ].join(' ')}
                    onClick={() => setView(item.id)}
                    type="button"
                  >
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <main>{content}</main>
      </div>
    </div>
  )
}
