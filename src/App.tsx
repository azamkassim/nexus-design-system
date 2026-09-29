import { useMemo, useState } from 'react'
import PresentationPanel from './PresentationPanel'

const tabs = ['Overview', 'Tasks', 'Evidence', 'Financial', 'Credit', 'Policy', 'Documents', 'Outputs', 'Presentations', 'Timeline'] as const
type Tab = (typeof tabs)[number]

type Task = {
  title: string
  owner: string
  status: 'Ready' | 'Blocked' | 'Done'
  reason?: string
}

type Evidence = {
  name: string
  source: string
  verified: boolean
  freshness: string
}

const tasks: Task[] = [
  { title: 'Confirm security package', owner: 'RM', status: 'Blocked', reason: 'Awaiting independent valuation' },
  { title: 'Complete financial spreading', owner: 'RM', status: 'Ready' },
  { title: 'Draft facility structure', owner: 'Credit', status: 'Ready' },
  { title: 'Prepare preliminary Executive Summary', owner: 'NEXUS', status: 'Ready' },
  { title: 'Validate customer mandate', owner: 'RM', status: 'Done' },
]

const evidence: Evidence[] = [
  { name: 'Board mandate', source: 'Customer document', verified: true, freshness: 'Current' },
  { name: '3-year audited accounts', source: 'Audited financials', verified: true, freshness: 'FY2023–FY2025' },
  { name: 'Latest management accounts', source: 'Management', verified: true, freshness: 'Aug 2026' },
  { name: 'Independent valuation', source: 'External valuer', verified: false, freshness: 'Pending' },
]

const workspaces = [
  { name: 'ORION DEMO SDN BHD', team: 'Team 1', stage: 'Credit Assessment', progress: 74, alert: 1 },
  { name: 'NOVA DEMO SDN BHD', team: 'Team 2', stage: 'LO / Disbursement', progress: 61, alert: 2 },
  { name: 'VECTOR DEMO SDN BHD', team: 'Team 3', stage: 'Monitoring', progress: 88, alert: 0 },
]

const activity = [
  ['13:02', 'Evidence', 'Management accounts verified and linked'],
  ['12:47', 'Task', 'Financial spreading moved to Ready'],
  ['12:31', 'Gate', 'Security gate blocked pending valuation'],
  ['11:55', 'Output', 'Preliminary ES regenerated from governed data'],
]

function StatusPill({ status }: { status: Task['status'] }) {
  const cls = status === 'Done' ? 'success' : status === 'Blocked' ? 'danger' : 'info'
  return <span className={`pill ${cls}`}>{status}</span>
}

function Progress({ value }: { value: number }) {
  return (
    <div className="progress-track" aria-label={`${value}% complete`}>
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const readyTasks = useMemo(() => tasks.filter((task) => task.status === 'Ready'), [])
  const verifiedCount = useMemo(() => evidence.filter((item) => item.verified).length, [])

  const renderTab = () => {
    if (activeTab === 'Overview') {
      return (
        <div className="overview-grid">
          <section className="panel next-action">
            <div className="section-kicker">NEXUS NEXT BEST ACTION</div>
            <div className="next-action-row">
              <div>
                <h2>Continue work while valuation is pending</h2>
                <p>The security gate is blocked, but three independent tasks can proceed now.</p>
              </div>
              <button className="primary-button">Start next task →</button>
            </div>
            <div className="action-strip">
              {readyTasks.map((task) => (
                <div className="action-item" key={task.title}>
                  <span className="dot info-dot" />
                  <div>
                    <strong>{task.title}</strong>
                    <small>{task.owner}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel gate-panel">
            <div className="panel-heading">
              <div>
                <div className="section-kicker">STAGE GATE</div>
                <h3>Credit Assessment</h3>
              </div>
              <span className="pill danger">1 blocker</span>
            </div>
            <div className="gate-row">
              <div className="gate-icon">!</div>
              <div>
                <strong>Security confirmation cannot be completed</strong>
                <p>Independent valuation is required before final credit recommendation.</p>
              </div>
            </div>
            <div className="gate-footer">Rule: no governed evidence → no stage completion</div>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <div className="section-kicker">EVIDENCE HEALTH</div>
                <h3>{verifiedCount}/{evidence.length} verified</h3>
              </div>
              <span className="score">{Math.round((verifiedCount / evidence.length) * 100)}%</span>
            </div>
            <div className="evidence-list">
              {evidence.map((item) => (
                <div className="evidence-row" key={item.name}>
                  <span className={item.verified ? 'check' : 'pending'}>{item.verified ? '✓' : '…'}</span>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.source} · {item.freshness}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel reuse-panel">
            <div className="section-kicker">ENTER ONCE · REUSE EVERYWHERE</div>
            <h3>One governed customer model</h3>
            <p>Structured facts and verified evidence flow into every downstream output instead of being re-keyed.</p>
            <div className="flow">
              <span>Data entry</span><b>→</b><span>Evidence</span><b>→</b><span>Analysis</span><b>→</b><span>Decision</span><b>→</b><span>Outputs</span>
            </div>
          </section>
        </div>
      )
    }

    if (activeTab === 'Tasks') {
      return (
        <section className="panel table-panel">
          <div className="panel-heading"><div><div className="section-kicker">WORK QUEUE</div><h3>Tasks and alternatives</h3></div></div>
          <div className="table">
            {tasks.map((task) => (
              <div className="table-row four" key={task.title}>
                <div><strong>{task.title}</strong>{task.reason && <small>{task.reason}</small>}</div>
                <span>{task.owner}</span>
                <StatusPill status={task.status} />
                <button className="text-button">{task.status === 'Blocked' ? 'View dependency' : 'Open →'}</button>
              </div>
            ))}
          </div>
        </section>
      )
    }

    if (activeTab === 'Evidence') {
      return (
        <section className="panel table-panel">
          <div className="panel-heading"><div><div className="section-kicker">PROVENANCE REGISTER</div><h3>Evidence with scope, source and freshness</h3></div></div>
          <div className="table">
            {evidence.map((item) => (
              <div className="table-row four" key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.source}</span>
                <span>{item.freshness}</span>
                <span className={item.verified ? 'pill success' : 'pill warning'}>{item.verified ? 'Verified' : 'Pending'}</span>
              </div>
            ))}
          </div>
        </section>
      )
    }

    if (activeTab === 'Presentations') {
      return <PresentationPanel />
    }

    const placeholder: Record<Exclude<Tab, 'Overview' | 'Tasks' | 'Evidence' | 'Presentations'>, { title: string; lines: string[] }> = {
      Financial: { title: 'Financial Engine', lines: ['3-year spreading', 'Ratios and trends', 'Projected cash flow', 'Sensitivity and covenant checks'] },
      Credit: { title: 'Credit Intelligence', lines: ['Strengths and weaknesses', 'Repayment source', 'Risk mitigants', 'Recommendation with evidence links'] },
      Policy: { title: 'Policy & Decisioning', lines: ['Effective-dated rules', 'Clause-level evidence', 'Exception register', 'Human decision gate'] },
      Documents: { title: 'Document Intelligence', lines: ['Source pack', 'Extraction status', 'Duplicates and conflicts', 'Missing-document requests'] },
      Outputs: { title: 'Generated Outputs', lines: ['Pre-Assessment Memo', 'CAR', 'Executive Summary', 'Committee slides', 'LO / disbursement pack'] },
      Timeline: { title: 'Immutable Activity Timeline', lines: activity.map((item) => `${item[0]} · ${item[1]} · ${item[2]}`) },
    }

    const content = placeholder[activeTab as keyof typeof placeholder]
    return (
      <section className="panel placeholder-panel">
        <div className="section-kicker">WORKSPACE ENGINE</div>
        <h2>{content.title}</h2>
        <div className="placeholder-list">
          {content.lines.map((line) => <div key={line}><span>✓</span>{line}</div>)}
        </div>
      </section>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">N</div>
          <div><strong>NEXUS</strong><small>Know. Decide. Act.</small></div>
        </div>

        <button className="nav-button active">▦ <span>Command Center</span></button>
        <button className="nav-button">◎ <span>My Work</span></button>
        <button className="nav-button">⌕ <span>Evidence Search</span></button>
        <button className="nav-button">⚙ <span>Governance</span></button>

        <div className="side-section">
          <div className="side-label">WORKSPACES</div>
          {workspaces.map((workspace, index) => (
            <button className={`workspace-mini ${index === 0 ? 'selected' : ''}`} key={workspace.name}>
              <div className="workspace-mini-top">
                <strong>{workspace.name.replace(' SDN BHD', '')}</strong>
                {workspace.alert > 0 && <span className="alert-count">{workspace.alert}</span>}
              </div>
              <small>{workspace.team} · {workspace.stage}</small>
              <Progress value={workspace.progress} />
            </button>
          ))}
        </div>

        <div className="privacy-card">
          <strong>PRIVATE-BY-DESIGN</strong>
          <small>Synthetic demo only. No customer data in this repository.</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Command Center / Customer Workspace</div>
            <h1>ORION DEMO SDN BHD</h1>
            <div className="meta-line">
              <span className="pill info">Credit Assessment</span>
              <span>Team 1 · Financing</span>
              <span>Owner: RM Demo</span>
              <span>Last evidence sync: 13:02</span>
            </div>
          </div>
          <div className="health">
            <span>Workspace health</span>
            <strong>74%</strong>
            <Progress value={74} />
          </div>
        </header>

        <section className="metrics">
          <div className="metric"><span>Next action</span><strong>Financial spreading</strong><small>Ready now</small></div>
          <div className="metric"><span>Blockers</span><strong>1</strong><small>Valuation</small></div>
          <div className="metric"><span>Evidence</span><strong>{verifiedCount}/{evidence.length}</strong><small>verified</small></div>
          <div className="metric"><span>Open tasks</span><strong>{tasks.filter((task) => task.status !== 'Done').length}</strong><small>{readyTasks.length} ready now</small></div>
        </section>

        <nav className="tabs" aria-label="Workspace sections">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'active' : ''}>{tab}</button>
          ))}
        </nav>

        <div className="content">{renderTab()}</div>
      </main>
    </div>
  )
}

export default App
