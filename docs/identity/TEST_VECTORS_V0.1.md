# NEXUS Identity v0.1 — Test Vectors

These vectors are mandatory before production integration.

| # | Scenario | Expected |
|---|---|---|
| 1 | Active RM, correct organisation, assigned workspace, VIEW | ALLOW |
| 2 | Active RM, attempts another customer's workspace | DENY_WORKSPACE_MEMBERSHIP |
| 3 | Suspended Team Lead | DENY_INACTIVE_IDENTITY |
| 4 | Personal development account against organisation resource | DENY_PERSONAL_ACCOUNT |
| 5 | User from another organisation | DENY_ORGANISATION_MISMATCH |
| 6 | RM tries APPROVE | DENY_ROLE |
| 7 | SYSTEM_ADMIN with no APPROVER business role tries APPROVE | DENY_ROLE |
| 8 | APPROVER with no active delegated authority | DENY_AUTHORITY |
| 9 | APPROVER authority RM5m, transaction RM6m | DENY_AUTHORITY |
| 10 | APPROVER authority expired | DENY_AUTHORITY |
| 11 | APPROVER with matching active authority, stage APPROVAL | ALLOW |
| 12 | APPROVER attempts approval while stage DRAFT | DENY_WORKFLOW_STAGE |
| 13 | External invited user, correct workspace, VIEW | ALLOW |
| 14 | External invited user, correct workspace, APPROVE | DENY_ROLE |
| 15 | External user requests restricted customer data without workspace boundary | DENY_SENSITIVITY |
| 16 | Non-super-admin requests break-glass | DENY_BREAK_GLASS |
| 17 | SUPER_ADMIN using ADMINISTER on organisation-level resource | ALLOW |
| 18 | SUPER_ADMIN without APPROVER role attempts financing approval | DENY_ROLE |
| 19 | Missing policy version | DENY_MISSING_CONTEXT |
| 20 | Invalid/expired workspace membership | DENY_WORKSPACE_MEMBERSHIP |

## Governance assertions

The following must remain true even if future features are added:

- Reputation, badges, AI confidence, contribution count and forum-like trust level never create delegated authority.
- No AI-generated recommendation changes an access decision by itself.
- An administrator can administer the platform without automatically becoming a credit approver.
- A business approver cannot administer users unless separately assigned an administrative role.
- Customer workspace boundaries apply to humans, external users, automation and service identities.
- Permission expansion must be explicit and auditable.
- Unknown or incomplete context fails closed.
