# NEXUS Identity v0.1 — Free-First Stack

Goal: implement the identity/administration foundation without any paid dependency.

## Current v0.1 path

No new runtime dependency is required.

- NEXUS repository code: MIT.
- Existing TypeScript/React toolchain: already present.
- Authorization evaluator: first-party NEXUS TypeScript.
- Policy fixtures: JSON/TypeScript.
- Admin Directory: first-party NEXUS TypeScript.
- Source control: Git/GitHub repository already in use.

Cost to develop and run the local prototype: RM0, excluding hardware, electricity and internet already available to the user.

## Optional later components

These are candidates only after security/dependency review. They are not required by v0.1.

| Component | Purpose | License gate | Cost gate | v0.1 |
|---|---|---|---|---|
| Keycloak | Self-hosted OIDC/SSO/MFA identity provider | Apache-2.0 / GREEN candidate | Self-hostable without licence fee | NOT REQUIRED |
| PostgreSQL | Durable identity, policy and audit store | PostgreSQL License / GREEN candidate | Self-hostable without licence fee | NOT REQUIRED |
| Apache Casbin | Mature RBAC/ABAC policy library | Apache-2.0 / GREEN candidate | No licence fee | NOT REQUIRED |

## Explicit exclusions

Do not require:
- paid Google Workspace;
- paid Microsoft Entra tier;
- Auth0 paid plan;
- paid database/SaaS;
- paid API;
- mandatory cloud hosting;
- proprietary identity SDK.

## Adoption rule

A future dependency may enter NEXUS only after:
1. licence verification;
2. dependency/transitive-licence review;
3. security review;
4. data-flow review;
5. proof that an existing NEXUS component cannot satisfy the need;
6. confirmation that no paid service is compulsory for the intended deployment.

Free-to-access is not enough. The default GREEN gate requires reuse-safe licensing and no compulsory paid service.
