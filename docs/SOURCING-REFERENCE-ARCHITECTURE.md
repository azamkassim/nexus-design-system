# Sourcing patterns adapted into NEXUS

Status: design reference, v0.1

## Purpose

This document captures the useful mechanics observed in mature B2B sourcing platforms and adapts them into a privacy-minimised banking workflow. It does **not** copy marketplace branding or proprietary implementation.

## Patterns adopted

| Sourcing pattern | NEXUS adaptation |
|---|---|
| Request once, multiple responses | Enter customer requirement once; reuse governed fields across engines and outputs |
| Supplier verification | Evidence register with source, scope, date/freshness and verification state |
| Quote comparison | Structured comparison of facilities, scenarios, risks and mitigants |
| Virtual office | One customer = one workspace containing tasks, evidence, documents, outputs and timeline |
| AI sourcing assistant | Next-best-action engine that clarifies missing inputs and proposes productive alternatives |
| Escrow / protected progression | Stage gates: no required governed evidence, no completion of the gated stage |
| Inspection | Independent verification only when risk or policy requires it |
| Transaction history | Immutable activity timeline and decision provenance |

## Core workflow

Need → clarify → collect → verify → compare/analyse → gate → decide → generate → monitor

A blocked dependency must not stop unrelated work. The task engine should continuously classify work as:

- READY — can be executed now.
- BLOCKED — cannot proceed until a named dependency is satisfied.
- DONE — completed with evidence.
- ALTERNATIVE — productive work that becomes the next-best action when the primary path is blocked.

## Evidence model

Each important fact should be traceable to:

- evidence class;
- source document/system;
- source date and effective date;
- extraction or human-entry origin;
- verification state;
- confidence where AI is involved;
- conflicts or superseded values;
- downstream outputs that consume the fact.

A badge such as "verified" must never imply more than its actual verification scope.

## Privacy and security constraints

This repository and public demos must contain synthetic data only.

Production design principles:

1. Data minimisation by default.
2. Local/private processing where practical.
3. No credentials in source code.
4. No confidential customer documents in public repositories.
5. External AI receives only approved/redacted data.
6. Human approval remains authoritative for credit and policy decisions.
7. Internal-system integrations require explicit authorisation and least privilege.
8. Every generated recommendation must be distinguishable from source facts and human decisions.

## UX principles

The command center optimises for action, not information volume.

The first screen should answer:

1. What stage is this case in?
2. What is blocked?
3. What can I do now?
4. What evidence is missing or stale?
5. What decision is needed next?
6. Which output will change if I update a fact?

The interface must avoid alert flooding. Prefer one ranked next-best action with transparent reasons and alternatives.

## Future implementation milestones

1. Replace synthetic arrays with typed canonical entities.
2. Add persistent workspace storage behind an adapter.
3. Add evidence provenance graph.
4. Add stage-gate policy engine with effective-dated rules.
5. Add document ingestion and fact-conflict detection.
6. Add generated-output templates from governed facts.
7. Add team-lead queue and workload balancing.
8. Add audit log and role-based access controls.
