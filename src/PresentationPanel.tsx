import { useMemo, useState } from 'react'
import {
  buildPortableHtmlDeck,
  buildPresentationPlan,
  type PresentationKind,
  type PresentationSource,
} from './nexus/presentation'
import './presentation.css'

const outputs: Array<{ kind: PresentationKind; label: string; purpose: string }> = [
  { kind: 'CREDIT_COMMITTEE', label: 'CC Slides', purpose: 'Committee decision pack' },
  { kind: 'ALK', label: 'ALK Slides', purpose: 'Board / ALK presentation' },
  { kind: 'CEO_PREASSESSMENT', label: 'CEO Pre-Assessment', purpose: 'Early decision view' },
  { kind: 'SITE_VISIT', label: 'Site Visit', purpose: 'Visit findings and evidence' },
  { kind: 'CUSTOMER_PROFILE', label: 'Customer Profile', purpose: 'Compact customer overview' },
  { kind: 'MANAGEMENT_DASHBOARD', label: 'Management Dashboard', purpose: 'Portfolio / team update' },
]

const demoSource: PresentationSource = {
  customerName: 'ORION DEMO SDN BHD',
  stage: 'Credit Assessment',
  team: 'Team 1 · Financing',
  owner: 'RM Demo',
  metrics: {
    'Workspace health': '74%',
    'Evidence verified': '3 / 4',
    'Ready tasks': 3,
    Blockers: 1,
  },
  risks: [
    'Independent valuation is still pending.',
    'Final facility structure must remain within approved parameters.',
    'Evidence freshness must be reconfirmed before final recommendation.',
  ],
  mitigants: [
    'Do not complete the security gate until governed valuation evidence is received.',
    'Route structural exceptions through the human approval gate.',
    'Revalidate time-sensitive evidence at finalisation.',
  ],
  evidence: [
    'Board mandate · verified',
    '3-year audited accounts · verified',
    'Latest management accounts · verified',
    'Independent valuation · pending',
  ],
  decisions: [
    'Continue financial spreading and preliminary Executive Summary now.',
    'Keep final credit recommendation blocked until valuation evidence is verified.',
    'Human approver remains authoritative for any recommendation or exception.',
  ],
  narrative:
    'The presentation engine reuses governed workspace data, strips sensitive fields, and produces a free local deck without making Canva or any paid service a dependency.',
}

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function PresentationPanel() {
  const [selected, setSelected] = useState<PresentationKind>('CREDIT_COMMITTEE')
  const [copied, setCopied] = useState(false)

  const plan = useMemo(() => buildPresentationPlan(demoSource, selected), [selected])
  const selectedOutput = outputs.find((item) => item.kind === selected) ?? outputs[0]

  const exportHtml = () => {
    const fileName = `nexus-${selected.toLowerCase().replace(/_/g, '-')}.html`
    download(fileName, buildPortableHtmlDeck(plan), 'text/html;charset=utf-8')
  }

  const copySafePayload = async () => {
    await navigator.clipboard.writeText(JSON.stringify(plan, null, 2))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="presentation-engine">
      <section className="presentation-hero panel">
        <div>
          <div className="section-kicker">NEXUS PRESENTATION ENGINE · v0.1</div>
          <h2>RM0 recurring cost. Premium output. Canva optional.</h2>
          <p>
            Governed workspace data is sanitised first, then rendered locally. Canva can be used as an optional finishing
            surface without becoming a dependency or source of credit decisions.
          </p>
        </div>
        <div className="presentation-cost">
          <span>Recurring cost</span>
          <strong>RM0</strong>
          <small>local-first fallback always available</small>
        </div>
      </section>

      <div className="presentation-layout">
        <section className="panel presentation-picker">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">OUTPUT LIBRARY</div>
              <h3>One governed source → many outputs</h3>
            </div>
            <span className="pill success">FREE-FIRST</span>
          </div>
          <div className="output-grid">
            {outputs.map((output) => (
              <button
                key={output.kind}
                className={selected === output.kind ? 'output-card selected' : 'output-card'}
                onClick={() => setSelected(output.kind)}
              >
                <strong>{output.label}</strong>
                <small>{output.purpose}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="panel presentation-gate">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">HARD PRIVACY GATE</div>
              <h3>Presentation-safe payload only</h3>
            </div>
            <span className="pill success">PASS</span>
          </div>
          <div className="gate-checks">
            <div><span>✓</span><strong>Account / personal identifiers</strong><small>redacted before export</small></div>
            <div><span>✓</span><strong>Credentials and tokens</strong><small>excluded by field rule</small></div>
            <div><span>✓</span><strong>Raw bank statements</strong><small>never included in presentation payload</small></div>
            <div><span>✓</span><strong>Human approval</strong><small>remains authoritative</small></div>
          </div>
        </section>
      </div>

      <section className="panel deck-preview">
        <div className="panel-heading">
          <div>
            <div className="section-kicker">LIVE BLUEPRINT</div>
            <h3>{selectedOutput.label}</h3>
          </div>
          <div className="deck-actions">
            <button className="text-button presentation-copy" onClick={copySafePayload}>
              {copied ? 'Copied ✓' : 'Copy Canva-ready payload'}
            </button>
            <button className="primary-button" onClick={exportHtml}>Download local deck →</button>
          </div>
        </div>

        <div className="slide-strip">
          {plan.slides.map((slide, index) => (
            <article className="slide-card" key={slide.title}>
              <div className="slide-number">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <small>{slide.eyebrow}</small>
                <strong>{slide.title}</strong>
                <p>{slide.body ?? slide.bullets?.[0] ?? 'Governed presentation content'}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="presentation-routing">
          <div><span className="route-dot ready" /><strong>Local HTML / PDF</strong><small>Default · fully free · offline capable</small></div>
          <div><span className="route-dot optional" /><strong>Canva Free</strong><small>Optional finishing layer using sanitised payload</small></div>
          <div><span className="route-dot ready" /><strong>NEXUS Design System</strong><small>Source of visual consistency and fallback</small></div>
        </div>
      </section>
    </div>
  )
}

export default PresentationPanel
