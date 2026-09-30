# NEXUS Cashflow Intelligence

## Purpose

Cashflow is a core pre-approval decision engine in NEXUS, not a supporting spreadsheet only. It must help the Team Lead understand whether the proposed financing structure is supported by real cash generation, timing and repayment capacity.

## Operating principles

1. Historical and projected cashflow must be kept distinct.
2. Each contract or repayment source must be independently traceable before consolidation.
3. Source documents remain read-only governed evidence.
4. Every material cashflow assumption must be attributable to evidence, calculation or explicit assumption.
5. NEXUS must not hard-code universal credit thresholds. Thresholds must come from governed policy, approved credit parameters or explicit human inputs.
6. Cashflow analytics support human credit judgement; they do not automatically approve or decline a customer unless an applicable governed rule explicitly requires it.

## Cashflow views

### Historical cashflow

Use bank statements, audited accounts and management accounts to identify:

- actual inflows and outflows
- cash conversion behaviour
- recurring versus exceptional flows
- related-party movements
- circular or unusual fund transfers
- collection patterns
- debt servicing behaviour
- liquidity pressure

### Projected cashflow

Maintain projected cashflow at contract/facility level with:

- opening cash
- customer collections
- other inflows
- operating outflows
- capex
- scheduled debt service
- financing drawdown
- financing repayment
- closing cash

### Stress scenarios

Support at minimum:

- Base
- Downside
- Severe
- Custom

Typical sensitivities include:

- revenue or collection reduction
- 30/60/90-day collection delay
- operating cost increase
- contract delay
- lower margin
- higher financing cost where relevant

## Decision metrics

NEXUS should surface:

- minimum cash balance and period
- peak pre-financing funding gap and period
- debt-service coverage and weakest period
- collection-delay tolerance
- requested facility versus actual timing gap
- source of repayment
- stressed shortfall

## Cashflow decision view

The Team Lead view should remain compact:

- Gate: PASS / REVIEW / BLOCKED
- Minimum cash balance
- Peak funding gap
- Debt-service coverage
- Collection delay
- Key reasons
- Next actions
- Human decision required

## Readiness gate

Cashflow becomes a formal readiness gate before final credit recommendation / CAR submission.

A case should move to REVIEW or BLOCKED when governed cashflow thresholds are breached or when evidence is insufficient. NEXUS must state why, show the supporting calculation/evidence, and surface the next action.

Examples of next actions:

- resize facility
- amend drawdown timing
- restructure repayment profile
- validate debtor ageing
- obtain contract/collection evidence
- request additional liquidity support
- perform downside sensitivity
- escalate an information gap for Team Lead decision

## Integration points

Cashflow Intelligence connects to:

- Case Workspace
- Financial Engine
- Bank Statement Review
- Debtor/Creditor Ageing Review
- Credit Intelligence
- Scorecard population where applicable
- CAR preparation
- Credit Committee readiness
- Next Best Action

## Evidence classes

Every output must be classified as one of:

- Fact
- Governed Evidence
- Calculation
- Assumption
- Information Gap
- Risk Indicator
- Credit Interpretation
- Recommendation
- Human Decision

## Team Lead objective

NEXUS must make one question immediately answerable:

> Is the proposed financing supported by realistic cashflow, and what must Azam decide or resolve before the case proceeds?
