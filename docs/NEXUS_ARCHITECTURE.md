# NEXUS Financing Architecture

## Purpose
NEXUS is a governed operating system for Business Banking work. It is not a collection of disconnected forms.

The core rule is:

> Capture once. Verify once. Reuse everywhere.

## Workspace hierarchy

1. **Customer Workspace** — one canonical customer identity and reusable common information.
2. **Application** — a financing or review request inside the customer workspace.
3. **Contract Workspace** — a standalone contract-level assessment where projected cash flow and contract evidence must remain separable.
4. **Facility** — financing structure, terms, pricing and utilisation.
5. **Security** — security and valuation evidence.
6. **Evidence** — source-backed facts, documents, checks and calculations.
7. **Task** — atomic work item with owner, status, blocker, due date and next action.
8. **Decision** — human or governed decision with rationale and evidence.
9. **Output** — generated CAR, ES, memo, slide or handoff artifact.

## One customer, one workspace

Common customer facts are stored once and reused. A new contract creates a new contract workspace under the same customer. Contract-specific projected cash flow never gets merged into another contract's projection.

## 12 engines

1. Intake & Data Capture
2. Document Intelligence
3. Evidence & Provenance
4. Knowledge Hub
5. CFFS Financial Engine
6. Scorecard Engine
7. Credit Intelligence
8. Policy & Decisioning
9. Workflow & Approvals
10. Reporting & Document Generation
11. Monitoring & Alerts
12. Integration & Synchronisation

Each engine reads governed canonical objects. Engines do not create competing customer masters.

## Data classes

Material information is explicitly typed as one of:

- Fact
- Governed Evidence
- Calculation
- Scorecard Output
- Credit Interpretation
- Policy Evaluation
- Credit Recommendation
- Human Decision
- Assumption
- Information Gap

Generated narrative is never promoted to source evidence.

## Human gates

Human approval is mandatory for material:

- credit recommendation;
- exception or policy interpretation;
- facility structure judgement;
- risk acceptance;
- approval decision;
- external communication;
- handoff completeness where conditions remain outstanding.

## Team flow

**Team 1 — Financing**
Assessment, financial analysis, facility structure, CAR/ES, recommendation and committee preparation.

**Team 2 — LO / Disbursement**
Letter of Offer, acceptance, conditions, security documentation, drawdown readiness and disbursement.

**Team 3 — Monitoring**
Annual review, account conduct, covenant/condition monitoring, collections, exceptions and remediation.

A handoff carries approved facts, evidence links, calculations, unresolved gaps, conditions, owner, due date and next required human action.

## Event model

Prefer:

EVENT → RULE → TASK / ENGINE → EVIDENCE → HUMAN GATE → OUTPUT

Examples:

- document received → classify → extract → verification queue;
- information gap identified → create request → mark waiting external → surface alternative work;
- Team Lead approves section → unlock document generation;
- financing approved → prepare governed handoff to Team 2;
- policy changes → identify impacted workspace rules and outputs.

## No-redundancy rules

- Never retype a verified field simply because another template needs it.
- Never maintain two editable masters of the same fact.
- Never copy calculations without calculation lineage.
- Never create a second task for the same underlying requirement.
- Never mark a draft as completion evidence.
- Never make an engine-specific customer record when the canonical object already exists.

## Security boundary

The public design repository contains no real customer or confidential KT data. Real deployments must use approved private/local data stores, least privilege and explicit integration approval for internal systems.
