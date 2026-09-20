import type { Meta, StoryObj } from '@storybook/react'
import { NexusAdminCenter } from './NexusAdminCenter'
import type { AdminDirectoryRecord, Identity } from '../../access-control'

const currentUser: Identity = {
  userId: 'team-lead-2',
  organisationId: 'org-demo',
  accountClass: 'ORGANISATION',
  active: true,
  administrativeRoles: [],
  businessRoles: ['TEAM_LEAD'],
  teamIds: ['team-2'],
  workspaceMemberships: [
    {
      workspaceId: 'customer-workspace-001',
      teamId: 'team-2',
      validFrom: '2026-01-01T00:00:00Z',
    },
    {
      workspaceId: 'customer-workspace-002',
      teamId: 'team-2',
      validFrom: '2026-01-01T00:00:00Z',
    },
  ],
  delegatedAuthorities: [],
}

const adminDirectory: readonly AdminDirectoryRecord[] = [
  {
    userId: 'access-admin-1',
    organisationId: 'org-demo',
    active: true,
    roles: ['ACCESS_ADMIN'],
    displayLabel: 'Access Administration',
    supportChannel: 'Internal IT / Access Help',
  },
  {
    userId: 'system-admin-1',
    organisationId: 'org-demo',
    active: true,
    roles: ['SYSTEM_ADMIN'],
    displayLabel: 'NEXUS System Administration',
    supportChannel: 'Internal IT / Platform Help',
  },
]

const meta = {
  title: 'NEXUS/Admin Center',
  component: NexusAdminCenter,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof NexusAdminCenter>

export default meta

type Story = StoryObj<typeof meta>

export const TeamLead: Story = {
  args: {
    currentUser,
    organisationName: 'Demo Organisation',
    adminDirectory,
  },
}
