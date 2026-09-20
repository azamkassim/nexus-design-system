# NEXUS Identity & Administration v0.1

Status: IMPLEMENTING
Branch: feature/nexus-admin-identity-v0.1
Principle: one identity, many NEXUS capabilities; authentication never implies authorization.

## 0. Why this exists

NEXUS needs an organisation-controlled identity model similar in spirit to managed work/school accounts:
- an organisation account has an administrator;
- administrators control services and access;
- ordinary users cannot grant themselves organisation-wide privileges;
- personal identities are distinct from organisation-managed identities.

NEXUS strengthens this for banking use by making every action depend on role, team, workspace, object, workflow stage, authority and sensitivity.

## 1. Non-negotiable rules

1. No public self-registration for internal NEXUS organisation accounts.
2. Authentication proves identity only. Authorization is evaluated separately.
3. One customer = one workspace.
4. Workspace access is explicit and revocable.
5. Approval authority is formally assigned; it is never earned through posting, reputation or AI confidence.
6. AI cannot grant, expand or override permissions.
7. API/service identity authority must never exceed its owning human/service principal.
8. Customer-specific information must remain in the authorised workspace.
9. Reusable institutional knowledge must be sanitised before promotion outside a customer workspace.
10. Every privileged decision must be auditable.
11. Default is deny when policy context is missing or ambiguous.
12. No paid dependency is required for v0.1.

## 2. Account classes

### ORGANISATION
Managed account for internal staff.
Identity lifecycle: invite/provision -> activate -> role/team assignment -> workspace assignment -> use -> suspend/revoke.

### EXTERNAL
Invitation-only identity for customer, lawyer, valuer, auditor or other external professional.
Default scope: one or more explicitly granted workspaces and specific actions.

### PERSONAL
Local development/demo identity only. It must not be accepted as an internal production staff identity.

## 3. Administrative roles

- USER_ADMIN: provision/suspend users, manage basic profile metadata.
- ACCESS_ADMIN: assign roles, teams and workspace membership.
- POLICY_ADMIN: maintain access policy definitions.
- AUDIT_ADMIN: read audit records; no operational approval rights by default.
- SYSTEM_ADMIN: operate platform configuration; no credit approval rights by default.
- SUPER_ADMIN: break-glass organisation administration. Use must be separately logged and reviewed.

Administrative roles are distinct from business roles.

## 4. Business roles

Initial canonical set:
- RM
- TEAM_LEAD
- CREDIT
- RISK
- POLICY_OWNER
- APPROVER
- MONITORING
- READ_ONLY

Business authority must be attached separately from administrative authority.

## 5. Canonical permission verbs

- VIEW
- CREATE
- EDIT
- COMMENT
- SUBMIT
- VERIFY
- ENDORSE
- APPROVE
- RETURN
- OVERRIDE
- EXPORT
- SHARE
- ADMINISTER

## 6. Authorization decision inputs

Every decision should be expressible as:

subject
+ organisation
+ account class
+ administrative roles
+ business roles
+ team memberships
+ workspace memberships
+ requested action
+ target resource
+ workflow stage
+ sensitivity
+ delegated authority
+ policy version
+ time/effective date
= ALLOW or DENY + reasons

## 7. Decision order

Evaluate in this order:

1. Identity active?
2. Correct organisation?
3. Account class permitted?
4. Explicit deny/break-glass restrictions?
5. Workspace membership valid?
6. Required business/admin role present?
7. Workflow stage permits action?
8. Delegated authority sufficient?
9. Resource sensitivity permits action?
10. Policy effective and not expired?

Any failed mandatory gate -> DENY.

## 8. "Who is my administrator?" inside NEXUS

NEXUS must expose a safe Admin Directory view.

A user can see:
- organisation name;
- support/help contact;
- authorised admin role labels;
- escalation path;
- whether their own account is organisation-managed.

A user must NOT automatically see:
- super-admin secrets;
- private contact details beyond approved directory fields;
- credentials;
- hidden security metadata.

The directory resolver must return only active admins for the user's organisation.

## 9. Free-first implementation

v0.1 requires no paid cloud product.

Core:
- TypeScript: existing project toolchain
- React: existing dependency
- Local policy evaluator: own MIT-licensed code in this repository
- JSON fixtures for policy/testing
- GitHub repository and local Git for source control

Optional later, after license/security review:
- Keycloak (Apache-2.0) for self-hosted SSO/OIDC
- PostgreSQL (PostgreSQL License) for durable identity/policy/audit data
- Casbin (Apache-2.0) if a mature external policy engine becomes useful

No Google Workspace subscription, paid IAM provider, paid API, SaaS database or proprietary auth service is required for the prototype.

## 10. Delivery sequence — do not skip

### Step 0 — Governance boundary
DONE in this document.

### Step 1 — Canonical access-control types
Implement types for identities, roles, workspace membership, resources, actions and decisions.

### Step 2 — Deterministic policy evaluator
Implement fail-closed evaluation with machine-readable reasons.

### Step 3 — Admin directory resolver
Resolve active organisation admins without leaking privileged data.

### Step 4 — Test vectors
Cover ordinary RM, Team Lead, Credit/Risk, external user, suspended user, cross-workspace request, expired authority and break-glass admin.

### Step 5 — Admin Center UI
UI first:
- My Access
- My Administrator
- Users
- Teams
- Roles
- Workspaces
- Access Reviews
- Audit

### Step 6 — Persistence
Add local storage/dev fixtures first. Add PostgreSQL only when backend integration starts.

### Step 7 — Authentication adapter
Start with local dev adapter. Add OIDC adapter later. Keep provider-specific logic outside the authorization core.

### Step 8 — Audit
Record actor, action, resource, decision, policy version, reasons, timestamp and correlation ID.

### Step 9 — Access review workflow
Periodic review of:
- inactive accounts;
- orphaned workspace memberships;
- excessive privileges;
- expired delegations;
- dormant admins.

### Step 10 — Production hardening
MFA/SSO, secret management, session controls, key rotation, incident response, tested backup/restore and IT/security approval.

## 11. Acceptance criteria for v0.1

The first implementation is acceptable only if:
- cross-workspace access is denied by default;
- suspended users are denied;
- reputation/knowledge contribution cannot grant approval authority;
- system-admin alone cannot approve financing;
- external users cannot browse other customers;
- missing policy context causes denial;
- the user can resolve an approved admin/help contact;
- all decisions return explicit reasons;
- zero paid services are required.

## 12. Out of scope for v0.1

- live organisation SSO;
- customer PII;
- production banking data;
- password storage;
- privileged portal/API automation;
- direct integration with internal bank systems;
- automatic approval by AI.
