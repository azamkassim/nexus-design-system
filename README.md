# nexus-design-system

NEXUS Design System: command-center interface tokens, components and governed interaction patterns for operational intelligence dashboards.

**Know. Decide. Act.**

## Identity & Admin Center v0.1

The first governed identity/admin foundation is under development in `feature/nexus-admin-identity-v0.1`.

It includes:
- organisation-managed, external, personal-development and service identity classes;
- separate administrative roles and business roles;
- one-customer/one-workspace authorization boundaries;
- fail-closed role/workspace/workflow/delegated-authority evaluation;
- safe "My Administrator" discovery;
- a NEXUS Admin Center UI foundation;
- explicit free-first architecture with no required paid service.

See:
- `docs/identity/ADMIN_MODEL_V0.1.md`
- `docs/identity/FREE_STACK_V0.1.md`
- `docs/identity/TEST_VECTORS_V0.1.md`

### Local verification

```bash
npm run typecheck
npm run storybook
```

The prototype must not contain production banking data, customer PII or credentials.
