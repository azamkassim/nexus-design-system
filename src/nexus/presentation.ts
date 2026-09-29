export type PresentationKind =
  | 'CREDIT_COMMITTEE'
  | 'ALK'
  | 'CEO_PREASSESSMENT'
  | 'SITE_VISIT'
  | 'CUSTOMER_PROFILE'
  | 'MANAGEMENT_DASHBOARD'

export type PresentationSource = {
  customerName: string
  stage: string
  team: string
  owner: string
  metrics: Record<string, string | number>
  risks: string[]
  mitigants: string[]
  evidence: string[]
  decisions: string[]
  narrative?: string
}

export type Slide = {
  eyebrow: string
  title: string
  body?: string
  bullets?: string[]
  metrics?: Array<{ label: string; value: string }>
}

export type PresentationPlan = {
  kind: PresentationKind
  title: string
  confidentiality: 'INTERNAL'
  generatedAt: string
  sanitization: {
    mode: 'presentation-safe'
    removedFields: string[]
    rule: string
  }
  slides: Slide[]
}

const outputTitles: Record<PresentationKind, string> = {
  CREDIT_COMMITTEE: 'Credit Committee Presentation',
  ALK: 'ALK Presentation',
  CEO_PREASSESSMENT: 'CEO Pre-Assessment',
  SITE_VISIT: 'Site Visit Presentation',
  CUSTOMER_PROFILE: 'Customer Profile',
  MANAGEMENT_DASHBOARD: 'Management Dashboard',
}

const sensitivePatterns = [
  /\b\d{12,16}\b/g,
  /\b\d{6}-\d{2}-\d{4}\b/g,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
]

function redactText(value: string): string {
  return sensitivePatterns.reduce((text, pattern) => text.replace(pattern, '[REDACTED]'), value)
}

function cleanList(values: string[]): string[] {
  return values
    .map((value) => redactText(value.trim()))
    .filter(Boolean)
    .slice(0, 8)
}

function cleanMetrics(metrics: Record<string, string | number>): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(metrics)
      .filter(([key]) => !/(account|nric|passport|token|password|secret|bank.?statement)/i.test(key))
      .slice(0, 8)
      .map(([key, value]) => [key, typeof value === 'string' ? redactText(value) : value]),
  )
}

export function sanitizePresentationSource(source: PresentationSource): PresentationSource {
  return {
    customerName: redactText(source.customerName),
    stage: redactText(source.stage),
    team: redactText(source.team),
    owner: redactText(source.owner),
    metrics: cleanMetrics(source.metrics),
    risks: cleanList(source.risks),
    mitigants: cleanList(source.mitigants),
    evidence: cleanList(source.evidence),
    decisions: cleanList(source.decisions),
    narrative: source.narrative ? redactText(source.narrative) : undefined,
  }
}

export function buildPresentationPlan(source: PresentationSource, kind: PresentationKind): PresentationPlan {
  const safe = sanitizePresentationSource(source)
  const metrics = Object.entries(safe.metrics).map(([label, value]) => ({
    label,
    value: String(value),
  }))

  return {
    kind,
    title: outputTitles[kind],
    confidentiality: 'INTERNAL',
    generatedAt: new Date().toISOString(),
    sanitization: {
      mode: 'presentation-safe',
      removedFields: ['account identifiers', 'personal identifiers', 'credentials', 'raw bank statements'],
      rule: 'Only minimum approved presentation data leaves the governed workspace.',
    },
    slides: [
      {
        eyebrow: outputTitles[kind].toUpperCase(),
        title: safe.customerName,
        body: `${safe.stage} · ${safe.team} · Owner: ${safe.owner}`,
      },
      {
        eyebrow: 'EXECUTIVE SNAPSHOT',
        title: 'Decision-ready view',
        body: safe.narrative ?? 'A concise view generated from governed workspace data.',
        metrics,
      },
      {
        eyebrow: 'RISK & MITIGATION',
        title: 'Material matters requiring attention',
        bullets: safe.risks.map((risk, index) => {
          const mitigant = safe.mitigants[index]
          return mitigant ? `${risk} — Mitigation: ${mitigant}` : risk
        }),
      },
      {
        eyebrow: 'EVIDENCE & GOVERNANCE',
        title: 'What supports the presentation',
        bullets: safe.evidence,
      },
      {
        eyebrow: 'DECISION / NEXT ACTION',
        title: 'Human decision remains authoritative',
        bullets: safe.decisions,
      },
    ],
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderSlide(slide: Slide, index: number, total: number): string {
  const metrics = slide.metrics?.length
    ? `<div class="metrics">${slide.metrics
        .map(
          (metric) =>
            `<div class="metric"><span>${escapeHtml(metric.label)}</span><strong>${escapeHtml(metric.value)}</strong></div>`,
        )
        .join('')}</div>`
    : ''

  const bullets = slide.bullets?.length
    ? `<ul>${slide.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`
    : ''

  return `
    <section class="slide">
      <div class="eyebrow">${escapeHtml(slide.eyebrow)}</div>
      <h1>${escapeHtml(slide.title)}</h1>
      ${slide.body ? `<p class="lead">${escapeHtml(slide.body)}</p>` : ''}
      ${metrics}
      ${bullets}
      <footer><span>NEXUS · Know. Decide. Act.</span><span>${index + 1} / ${total}</span></footer>
    </section>
  `
}

export function buildPortableHtmlDeck(plan: PresentationPlan): string {
  const slides = plan.slides.map((slide, index) => renderSlide(slide, index, plan.slides.length)).join('')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(plan.title)}</title>
<style>
  :root { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #101426; background: #e9edf4; }
  * { box-sizing: border-box; }
  body { margin: 0; }
  .toolbar { position: sticky; top: 0; z-index: 2; padding: 12px 18px; background: #0a0e27; color: white; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
  .toolbar button { border: 0; border-radius: 8px; background: white; color: #0a0e27; padding: 9px 14px; font-weight: 800; cursor: pointer; }
  .deck { padding: 24px; display: grid; gap: 24px; }
  .slide { width: min(1280px, 100%); min-height: 720px; margin: 0 auto; background: #fff; padding: 64px 72px 44px; border-radius: 18px; box-shadow: 0 16px 45px rgba(10,14,39,.12); position: relative; overflow: hidden; }
  .slide::before { content: ""; position: absolute; width: 340px; height: 340px; border-radius: 50%; right: -120px; top: -130px; background: radial-gradient(circle at 30% 30%, #21d4c7, #2774ed 58%, #7b32ef); opacity: .16; }
  .eyebrow { font-size: 13px; font-weight: 900; letter-spacing: .18em; color: #526078; }
  h1 { max-width: 900px; margin: 18px 0 14px; font-size: clamp(38px, 5vw, 70px); line-height: 1.03; letter-spacing: -.045em; color: #0a0e27; }
  .lead { max-width: 920px; margin: 0; font-size: 23px; line-height: 1.45; color: #566073; }
  .metrics { margin-top: 48px; display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; }
  .metric { padding: 20px; border: 1px solid #e3e8ef; border-radius: 14px; background: #f8fafc; }
  .metric span { display: block; color: #778195; font-size: 12px; }
  .metric strong { display: block; margin-top: 8px; font-size: 26px; color: #0a0e27; }
  ul { margin: 42px 0 0; padding: 0; list-style: none; max-width: 1000px; display: grid; gap: 16px; }
  li { border-left: 4px solid #2774ed; background: #f8fafc; padding: 18px 20px; border-radius: 0 12px 12px 0; font-size: 20px; line-height: 1.42; color: #2d3545; }
  footer { position: absolute; left: 72px; right: 72px; bottom: 28px; display: flex; justify-content: space-between; color: #9098a7; font-size: 11px; letter-spacing: .08em; }
  @media (max-width: 760px) { .deck { padding: 10px; } .slide { min-height: 620px; padding: 38px 26px 58px; border-radius: 12px; } .metrics { grid-template-columns: 1fr 1fr; } footer { left: 26px; right: 26px; } }
  @media print {
    @page { size: 13.333in 7.5in; margin: 0; }
    .toolbar { display: none; }
    .deck { padding: 0; gap: 0; }
    .slide { width: 13.333in; height: 7.5in; min-height: 0; border-radius: 0; box-shadow: none; page-break-after: always; }
  }
</style>
</head>
<body>
  <div class="toolbar">
    <strong>${escapeHtml(plan.title)} · presentation-safe</strong>
    <button onclick="window.print()">Print / Save PDF</button>
  </div>
  <main class="deck">${slides}</main>
</body>
</html>`
}
