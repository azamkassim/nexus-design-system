# NEXUS Design System

Operational intelligence command center for evidence-led banking workflows.

**Principle:** Know. Decide. Act.

## Current prototype

The repository now contains a runnable React/Vite command-center prototype demonstrating:

- one customer = one workspace;
- next-best-action routing when a task is blocked;
- stage gates;
- evidence provenance and verification state;
- enter-once / reuse-everywhere workflow;
- synthetic multi-team workspace overview;
- responsive desktop/mobile layout.

All demo entities are synthetic. No confidential customer data should be committed to this public repository.

### Run locally

```bash
npm install
npm run dev
```

### Verify production build

```bash
npm run build
```

Design rationale: [docs/SOURCING-REFERENCE-ARCHITECTURE.md](docs/SOURCING-REFERENCE-ARCHITECTURE.md)

Universal action routing: [docs/NEXUS-UNIVERSAL-ACTION-PROTOCOL.md](docs/NEXUS-UNIVERSAL-ACTION-PROTOCOL.md)
