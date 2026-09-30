export type CashflowGateStatus = 'PASS' | 'REVIEW' | 'BLOCKED'

export type CashflowMonth = {
  period: string
  openingCash: number
  customerCollections: number
  otherInflows: number
  operatingOutflows: number
  capex: number
  scheduledDebtService: number
  financingDrawdown: number
  financingRepayment: number
}

export type CashflowPolicy = {
  minimumClosingCash: number
  minimumDebtServiceCoverage: number
  maximumCollectionDelayDays?: number
}

export type CashflowScenario = {
  id: string
  label: string
  kind: 'HISTORICAL' | 'BASE' | 'DOWNSIDE' | 'SEVERE' | 'CUSTOM'
  months: CashflowMonth[]
  collectionDelayDays?: number
}

export type CashflowDecisionView = {
  scenarioId: string
  scenarioLabel: string
  gate: CashflowGateStatus
  minimumClosingCash: number
  minimumClosingCashPeriod: string | null
  peakFundingGap: number
  peakFundingGapPeriod: string | null
  minimumDebtServiceCoverage: number | null
  minimumDebtServiceCoveragePeriod: string | null
  collectionDelayDays: number | null
  reasons: string[]
  nextActions: string[]
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function assessCashflowScenario(
  scenario: CashflowScenario,
  policy: CashflowPolicy,
): CashflowDecisionView {
  let minimumClosingCash = Number.POSITIVE_INFINITY
  let minimumClosingCashPeriod: string | null = null
  let peakFundingGap = 0
  let peakFundingGapPeriod: string | null = null
  let minimumDebtServiceCoverage = Number.POSITIVE_INFINITY
  let minimumDebtServiceCoveragePeriod: string | null = null
  let hasDebtService = false

  for (const month of scenario.months) {
    const operatingInflows = month.customerCollections + month.otherInflows
    const preFinancingCash =
      month.openingCash +
      operatingInflows -
      month.operatingOutflows -
      month.capex -
      month.scheduledDebtService -
      month.financingRepayment

    const fundingGap = Math.max(0, -preFinancingCash)
    if (fundingGap > peakFundingGap) {
      peakFundingGap = fundingGap
      peakFundingGapPeriod = month.period
    }

    const closingCash = preFinancingCash + month.financingDrawdown
    if (closingCash < minimumClosingCash) {
      minimumClosingCash = closingCash
      minimumClosingCashPeriod = month.period
    }

    if (month.scheduledDebtService > 0) {
      hasDebtService = true
      const cashAvailableForDebtService = operatingInflows - month.operatingOutflows - month.capex
      const coverage = cashAvailableForDebtService / month.scheduledDebtService
      if (coverage < minimumDebtServiceCoverage) {
        minimumDebtServiceCoverage = coverage
        minimumDebtServiceCoveragePeriod = month.period
      }
    }
  }

  if (scenario.months.length === 0) {
    minimumClosingCash = 0
  }

  const reasons: string[] = []
  const nextActions: string[] = []
  let gate: CashflowGateStatus = 'PASS'

  if (minimumClosingCash < policy.minimumClosingCash) {
    gate = 'BLOCKED'
    reasons.push(
      `Minimum closing cash ${round(minimumClosingCash)} is below governed minimum ${round(policy.minimumClosingCash)}.`,
    )
    nextActions.push('Review facility sizing, drawdown timing, repayment profile or additional liquidity support.')
  }

  if (hasDebtService && minimumDebtServiceCoverage < policy.minimumDebtServiceCoverage) {
    gate = 'BLOCKED'
    reasons.push(
      `Minimum debt-service coverage ${round(minimumDebtServiceCoverage)}x is below governed minimum ${round(policy.minimumDebtServiceCoverage)}x.`,
    )
    nextActions.push('Review repayment source, repayment timing and downside cash generation.')
  }

  if (
    policy.maximumCollectionDelayDays !== undefined &&
    scenario.collectionDelayDays !== undefined &&
    scenario.collectionDelayDays > policy.maximumCollectionDelayDays
  ) {
    if (gate === 'PASS') gate = 'REVIEW'
    reasons.push(
      `Collection delay ${scenario.collectionDelayDays} days exceeds governed tolerance ${policy.maximumCollectionDelayDays} days.`,
    )
    nextActions.push('Validate debtor ageing, collection evidence and working-capital assumptions.')
  }

  if (peakFundingGap > 0) {
    if (gate === 'PASS') gate = 'REVIEW'
    reasons.push(`Peak pre-financing funding gap is ${round(peakFundingGap)}.`)
    nextActions.push('Confirm requested facility and drawdown schedule cover the timing gap without over-financing.')
  }

  if (reasons.length === 0) {
    reasons.push('Scenario satisfies the supplied governed cashflow thresholds.')
    nextActions.push('Proceed to evidence review and human credit judgement.')
  }

  return {
    scenarioId: scenario.id,
    scenarioLabel: scenario.label,
    gate,
    minimumClosingCash: round(minimumClosingCash),
    minimumClosingCashPeriod,
    peakFundingGap: round(peakFundingGap),
    peakFundingGapPeriod,
    minimumDebtServiceCoverage: hasDebtService ? round(minimumDebtServiceCoverage) : null,
    minimumDebtServiceCoveragePeriod,
    collectionDelayDays: scenario.collectionDelayDays ?? null,
    reasons,
    nextActions,
  }
}

export function compareCashflowScenarios(
  scenarios: CashflowScenario[],
  policy: CashflowPolicy,
): CashflowDecisionView[] {
  return scenarios.map((scenario) => assessCashflowScenario(scenario, policy))
}
