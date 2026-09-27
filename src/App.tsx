import { useMemo, useState } from 'react';
import { engines, tasks, teamMembers, workspaces } from './data/demo';
import type { CustomerWorkspace, Engine, Task, WorkStatus } from './domain/nexus';

type ViewMode = 'dashboard' | 'workspace' | 'engines';

const statusLabel: Record<WorkStatus, string> = {
  ready: 'Ready',
  in_progress: 'In progress',
  blocked: 'Blocked',
  waiting_external: 'Waiting external',
  needs_human_review: 'Human review',
  complete: 'Complete',
};

const statusTone: Record<WorkStatus, string> = {
  ready: 'bg-info/10 text-info',
  in_progress: 'bg-navy-700/10 text-navy-700',
  blocked: 'bg-error/10 text-error',
  waiting_external: 'bg-warning/10 text-warning',
  needs_human_review: 'bg-warning/10 text-warning',
  complete: 'bg-success/10 text-success',
};

const riskTone = {
  normal: 'bg-success/10 text-success',
  attention: 'bg-warning/10 text-warning',
  critical: 'bg-error/10 text-error',
};

function App() {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspaces[0].id);
  const [selectedSectionId, setSelectedSectionId] = useState(workspaces[0].sections[0].id);
  const [selectedEngineId, setSelectedEngineId] = useState(engines[0].id);

  const selectedWorkspace =
    workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? workspaces[0];

  const selectedSection =
    selectedWorkspace.sections.find((section) => section.id === selectedSectionId) ??
    selectedWorkspace.sections[0];

  const openTasks = tasks.filter((task) => task.status !== 'complete');
  const blockedTasks = tasks.filter(
    (task) => task.status === 'blocked' || task.status === 'waiting_external',
  );
  const reviewTasks = tasks.filter((task) => task.status === 'needs_human_review');
  const dueToday = tasks.filter((task) => task.due.startsWith('Today'));

  const handleWorkspaceOpen = (workspace: CustomerWorkspace) => {
    setSelectedWorkspaceId(workspace.id);
    setSelectedSectionId(workspace.sections[0].id);
    setView('workspace');
  };

  return (
    <div className="nexus-shell">
      <header className="nexus-topbar text-white">
        <div className="mx-auto max-w-[1600px] px-lg py-md">
          <div className="flex flex-wrap items-center justify-between gap-md">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-white/60">
                NEXUS • Business Banking Intelligence
              </div>
              <div className="mt-xs flex items-baseline gap-sm">
                <h1 className="!text-white">Financing Command Center</h1>
                <span className="rounded-full border border-white/20 px-sm py-xs text-xs text-white/70">
                  Team Lead + 2 RM
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-sm">
              <span className="rounded-md bg-success/15 px-sm py-xs text-xs font-bold text-success">
                DEMO • NO CUSTOMER DATA
              </span>
              <span className="text-xs text-white/55">
                One customer → one governed workspace
              </span>
            </div>
          </div>

          <nav className="mt-lg flex gap-lg border-t border-white/10">
            <TopNavButton active={view === 'dashboard'} onClick={() => setView('dashboard')}>
              Team Dashboard
            </TopNavButton>
            <TopNavButton active={view === 'workspace'} onClick={() => setView('workspace')}>
              Customer Workspace
            </TopNavButton>
            <TopNavButton active={view === 'engines'} onClick={() => setView('engines')}>
              Engine Control
            </TopNavButton>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-lg py-lg">
        {view === 'dashboard' && (
          <Dashboard
            openTasks={openTasks}
            blockedTasks={blockedTasks}
            reviewTasks={reviewTasks}
            dueToday={dueToday}
            onOpenWorkspace={handleWorkspaceOpen}
          />
        )}

        {view === 'workspace' && (
          <WorkspaceView
            workspace={selectedWorkspace}
            selectedSectionId={selectedSection.id}
            onSelectSection={setSelectedSectionId}
            onSelectWorkspace={(workspaceId) => {
              setSelectedWorkspaceId(workspaceId);
              const next = workspaces.find((workspace) => workspace.id === workspaceId);
              if (next) setSelectedSectionId(next.sections[0].id);
            }}
          />
        )}

        {view === 'engines' && (
          <EngineControl
            selectedEngineId={selectedEngineId}
            onSelectEngine={setSelectedEngineId}
          />
        )}
      </main>
    </div>
  );
}

function TopNavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  const className =
    'border-0 border-b-2 bg-transparent px-xs py-md text-sm font-semibold transition-colors ' +
    (active ? 'border-white text-white' : 'border-transparent text-white/55 hover:text-white');

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function Dashboard({
  openTasks,
  blockedTasks,
  reviewTasks,
  dueToday,
  onOpenWorkspace,
}: {
  openTasks: Task[];
  blockedTasks: Task[];
  reviewTasks: Task[];
  dueToday: Task[];
  onOpenWorkspace: (workspace: CustomerWorkspace) => void;
}) {
  const teamUtilisation = Math.round(
    teamMembers.reduce((sum, member) => sum + member.capacity, 0) / teamMembers.length,
  );

  const kpis = [
    ['Active workspaces', String(workspaces.length), 'All financing cases'],
    ['Open tasks', String(openTasks.length), 'Across Team Lead + 2 RM'],
    ['Due today', String(dueToday.length), 'Needs attention today'],
    ['Blocked / waiting', String(blockedTasks.length), 'Alternative work available'],
    ['Human reviews', String(reviewTasks.length), 'Cannot be auto-approved'],
    ['Team load', String(teamUtilisation) + '%', 'Balanced by capacity'],
  ];

  return (
    <div className="space-y-lg">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-graphite-500">
              Team Lead Operating View
            </p>
            <h2 className="mt-xs">Know what needs attention before opening any file</h2>
          </div>
          <div className="flex gap-sm">
            <span className="nexus-chip">Priority: evidence gaps first</span>
            <span className="nexus-chip">Human gate: material decisions</span>
          </div>
        </div>

        <div className="nexus-grid nexus-kpi-grid mt-md">
          {kpis.map(([label, value, note]) => (
            <div key={label} className="nexus-card p-md">
              <div className="text-xs font-semibold uppercase tracking-wide text-graphite-500">
                {label}
              </div>
              <div className="mt-sm text-2xl font-bold text-navy-950">{value}</div>
              <div className="mt-xs text-xs text-graphite-500">{note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="nexus-grid nexus-main-grid">
        <div className="space-y-lg">
          <div className="nexus-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-graphite-100 px-md py-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-graphite-500">
                  Financing Pipeline
                </div>
                <div className="mt-xs text-sm font-semibold text-navy-900">
                  Every customer has one governed workspace
                </div>
              </div>
              <span className="nexus-chip">3 active cases</span>
            </div>

            <div className="divide-y divide-graphite-100">
              {workspaces.map((workspace) => {
                const progress = Math.round(
                  workspace.sections.reduce((sum, section) => sum + section.progress, 0) /
                    workspace.sections.length,
                );
                const owner = teamMembers.find((member) => member.id === workspace.ownerId);

                return (
                  <button
                    type="button"
                    key={workspace.id}
                    onClick={() => onOpenWorkspace(workspace)}
                    className="block w-full border-0 bg-white px-md py-md text-left hover:bg-graphite-100/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-md">
                      <div>
                        <div className="flex items-center gap-sm">
                          <div className="font-bold text-navy-950">{workspace.customerName}</div>
                          <span
                            className={
                              'rounded-full px-sm py-xs text-xs font-semibold ' +
                              riskTone[workspace.riskState]
                            }
                          >
                            {workspace.riskState}
                          </span>
                        </div>
                        <div className="mt-xs text-xs text-graphite-500">
                          {workspace.contractName} • {workspace.applicationType}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-navy-900">
                          {workspace.requestedAmount}
                        </div>
                        <div className="text-xs text-graphite-500">{owner?.name}</div>
                      </div>
                    </div>

                    <div className="mt-md grid gap-sm md:grid-cols-[1fr_11rem] md:items-center">
                      <div>
                        <div className="mb-xs flex justify-between text-xs text-graphite-500">
                          <span>{workspace.stage}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="nexus-progress">
                          <span style={{ width: String(progress) + '%' }} />
                        </div>
                      </div>
                      <div className="rounded-md bg-graphite-100/35 px-sm py-xs text-xs text-graphite-700">
                        Next: {workspace.nextDecision}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="nexus-card overflow-hidden">
            <div className="border-b border-graphite-100 px-md py-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-graphite-500">
                Work Queue
              </div>
              <div className="mt-xs text-sm font-semibold text-navy-900">
                Prioritised by risk, due date and unblock value
              </div>
            </div>

            <div className="divide-y divide-graphite-100">
              {openTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-lg">
          <div className="nexus-card p-md">
            <div className="text-xs font-bold uppercase tracking-wide text-graphite-500">
              Team Capacity
            </div>
            <div className="mt-md space-y-md">
              {teamMembers.map((member) => (
                <div key={member.id}>
                  <div className="flex items-center justify-between gap-md">
                    <div>
                      <div className="text-sm font-bold text-navy-900">{member.name}</div>
                      <div className="text-xs text-graphite-500">
                        {member.role === 'team_lead'
                          ? 'Review • allocate • unblock'
                          : 'Financing RM'}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-navy-900">{member.capacity}%</div>
                  </div>
                  <div className="nexus-progress mt-sm">
                    <span style={{ width: String(member.capacity) + '%' }} />
                  </div>
                  <div className="mt-xs flex gap-sm text-xs text-graphite-500">
                    <span>{member.activeTasks} active</span>
                    <span>•</span>
                    <span>{member.dueToday} due today</span>
                    <span>•</span>
                    <span>{member.blockedTasks} blocked</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="nexus-card border-l-4 border-l-warning p-md">
            <div className="text-xs font-bold uppercase tracking-wide text-warning">
              Blocked-task rule
            </div>
            <h3 className="mt-sm">Never let waiting become idle time</h3>
            <p className="mt-sm text-sm">
              When external evidence is missing, NEXUS surfaces the highest-value unblocked work
              in the same workspace before assigning unrelated work.
            </p>
            <div className="mt-md space-y-sm">
              {blockedTasks.map((task) => (
                <div key={task.id} className="rounded-md bg-warning/5 p-sm">
                  <div className="text-xs font-bold text-navy-900">{task.title}</div>
                  <div className="mt-xs text-xs text-graphite-500">{task.blocker}</div>
                  <div className="mt-sm text-xs font-semibold text-warning">
                    ↳ {task.nextBestAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="nexus-card p-md">
            <div className="text-xs font-bold uppercase tracking-wide text-graphite-500">
              Team Lead Daily Rhythm
            </div>
            <div className="mt-md space-y-sm text-sm">
              <Rhythm time="08:30" label="Triage priority, blockers and due items" />
              <Rhythm time="10:30" label="Review RM A evidence / judgement items" />
              <Rhythm time="13:30" label="Review RM B evidence / judgement items" />
              <Rhythm time="15:00" label="Decision gate: sign-off / return with comments" />
              <Rhythm time="16:30" label="Handoff / tomorrow queue / escalation" />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const owner = teamMembers.find((member) => member.id === task.ownerId);
  const workspace = workspaces.find((item) => item.id === task.customerId);

  return (
    <div className="px-md py-sm">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-sm">
            <span
              className={
                'rounded-full px-sm py-xs text-xs font-semibold ' + statusTone[task.status]
              }
            >
              {statusLabel[task.status]}
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-graphite-500">
              {task.priority}
            </span>
          </div>
          <div className="mt-sm font-semibold text-navy-950">{task.title}</div>
          <div className="mt-xs text-xs text-graphite-500">
            {workspace?.customerName} • {task.workspaceSection} • {task.evidenceCount} evidence items
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="font-semibold text-navy-900">{owner?.name}</div>
          <div className="mt-xs text-graphite-500">{task.due}</div>
        </div>
      </div>
      {task.nextBestAction && (
        <div className="mt-sm rounded-md bg-graphite-100/40 px-sm py-xs text-xs text-graphite-700">
          Next best action: {task.nextBestAction}
        </div>
      )}
    </div>
  );
}

function Rhythm({ time, label }: { time: string; label: string }) {
  return (
    <div className="flex gap-sm">
      <span className="w-12 shrink-0 font-bold text-navy-900">{time}</span>
      <span className="text-graphite-700">{label}</span>
    </div>
  );
}

function WorkspaceView({
  workspace,
  selectedSectionId,
  onSelectSection,
  onSelectWorkspace,
}: {
  workspace: CustomerWorkspace;
  selectedSectionId: string;
  onSelectSection: (sectionId: string) => void;
  onSelectWorkspace: (workspaceId: string) => void;
}) {
  const section =
    workspace.sections.find((item) => item.id === selectedSectionId) ?? workspace.sections[0];

  const relatedTasks = tasks.filter(
    (task) => task.customerId === workspace.id && task.workspaceSection === section.label,
  );

  const evidenceTotal = workspace.sections.reduce(
    (sum, item) => sum + item.fields.filter((field) => field.evidenceState !== 'gap').length,
    0,
  );

  return (
    <div className="space-y-md">
      <section className="nexus-card p-md">
        <div className="flex flex-wrap items-start justify-between gap-md">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-graphite-500">
              Customer Workspace
            </div>
            <h2 className="mt-xs">{workspace.customerName}</h2>
            <div className="mt-xs text-sm text-graphite-500">
              {workspace.contractName} • {workspace.applicationType}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-sm">
            <select
              value={workspace.id}
              onChange={(event) => onSelectWorkspace(event.target.value)}
              className="rounded-md border border-graphite-100 bg-white px-sm py-xs text-sm"
            >
              {workspaces.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.customerName}
                </option>
              ))}
            </select>
            <span
              className={
                'rounded-full px-sm py-xs text-xs font-semibold ' + riskTone[workspace.riskState]
              }
            >
              {workspace.riskState}
            </span>
          </div>
        </div>

        <div className="mt-md grid gap-sm md:grid-cols-5">
          <SummaryCell label="Stage" value={workspace.stage} />
          <SummaryCell label="Requested" value={workspace.requestedAmount} />
          <SummaryCell
            label="Owner"
            value={teamMembers.find((member) => member.id === workspace.ownerId)?.name ?? '—'}
          />
          <SummaryCell label="Evidence" value={String(evidenceTotal)} />
          <SummaryCell label="Next decision" value={workspace.nextDecision} />
        </div>
      </section>

      <section className="nexus-grid nexus-workspace-grid">
        <aside className="nexus-card h-fit overflow-hidden">
          <div className="nexus-section-header">Assessment Sections</div>
          <div className="max-h-[68vh] overflow-y-auto nexus-scroll">
            {workspace.sections.map((item, index) => {
              const active = item.id === selectedSectionId;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={
                    'block w-full border-0 border-b border-graphite-100 px-sm py-sm text-left ' +
                    (active ? 'bg-navy-950 text-white' : 'bg-white hover:bg-graphite-100/30')
                  }
                >
                  <div className="flex items-start gap-sm">
                    <span
                      className={
                        'mt-[2px] text-xs font-bold ' +
                        (active ? 'text-white/55' : 'text-graphite-300')
                      }
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="mt-xs flex items-center gap-sm">
                        <div
                          className={
                            'h-1 flex-1 overflow-hidden rounded-full ' +
                            (active ? 'bg-white/20' : 'bg-graphite-100')
                          }
                        >
                          <span
                            className={'block h-full ' + (active ? 'bg-white' : 'bg-info')}
                            style={{ width: String(item.progress) + '%' }}
                          />
                        </div>
                        <span
                          className={
                            'text-[10px] ' + (active ? 'text-white/60' : 'text-graphite-500')
                          }
                        >
                          {item.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-md">
          <div className="nexus-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-sm border-b border-graphite-100 px-md py-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-graphite-500">
                  Active Section
                </div>
                <h3 className="mt-xs">{section.label}</h3>
              </div>
              <span
                className={
                  'rounded-full px-sm py-xs text-xs font-semibold ' + statusTone[section.status]
                }
              >
                {statusLabel[section.status]}
              </span>
            </div>

            <div className="p-md">
              <div className="rounded-lg border border-info/20 bg-info/5 p-sm text-sm text-graphite-700">
                <strong className="text-navy-900">Capture-once rule:</strong> RM only enters
                information that cannot be reliably extracted, calculated or governed. Every
                material value carries a source state and can be reused in downstream outputs.
              </div>

              <div className="mt-md grid gap-sm md:grid-cols-2">
                {section.fields.length > 0 ? (
                  section.fields.map((field) => (
                    <div key={field.id} className="nexus-field">
                      <div className="flex items-start justify-between gap-sm">
                        <div className="text-xs font-bold uppercase tracking-wide text-graphite-500">
                          {field.label}
                        </div>
                        <span className="nexus-chip">{field.enteredBy}</span>
                      </div>
                      <div className="mt-sm text-lg font-bold text-navy-950">{field.value}</div>
                      <div className="mt-sm text-xs text-graphite-500">
                        Source: {field.source}
                      </div>
                      <div className="mt-xs flex flex-wrap gap-xs">
                        <span className="nexus-chip">{field.evidenceState}</span>
                        {field.reusedIn.map((target) => (
                          <span key={target} className="nexus-chip">
                            → {target}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <DataEntryPlaceholder />
                )}
              </div>
            </div>
          </div>

          <div className="nexus-card overflow-hidden">
            <div className="nexus-section-header">Section Tasks & Evidence</div>
            {relatedTasks.length > 0 ? (
              relatedTasks.map((task) => <TaskRow key={task.id} task={task} />)
            ) : (
              <div className="p-md text-sm text-graphite-500">
                No open section-specific task. Evidence can continue to be attached and verified.
              </div>
            )}
          </div>

          <div className="nexus-card p-md">
            <div className="flex flex-wrap items-start justify-between gap-md">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-graphite-500">
                  Output Reuse
                </div>
                <h3 className="mt-xs">One verified fact → many governed outputs</h3>
              </div>
              <button type="button" className="nexus-btn nexus-btn-primary">
                Preview generated section
              </button>
            </div>
            <div className="mt-md grid gap-sm md:grid-cols-4">
              {['Credit Paper', 'Executive Summary', 'Committee Slides', 'Approval / Risk Memo'].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-md border border-graphite-100 p-sm text-sm font-semibold text-navy-900"
                  >
                    {item}
                    <div className="mt-xs text-xs font-normal text-graphite-500">
                      Uses verified canonical fields
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-md">
          <div className="nexus-card overflow-hidden">
            <div className="nexus-section-header">Context Engines</div>
            <div className="max-h-[42vh] overflow-y-auto nexus-scroll p-sm">
              {engines
                .filter((engine) =>
                  [
                    'capture',
                    'document',
                    'evidence',
                    'cffs',
                    'credit',
                    'policy',
                    'workflow',
                    'reporting',
                  ].includes(engine.id),
                )
                .map((engine) => (
                  <div
                    key={engine.id}
                    className="mb-sm rounded-md border border-graphite-100 p-sm"
                  >
                    <div className="flex items-center justify-between gap-sm">
                      <div className="text-xs font-bold text-navy-900">{engine.shortName}</div>
                      <span className="text-[10px] uppercase tracking-wide text-graphite-500">
                        {engine.status}
                      </span>
                    </div>
                    <div className="mt-xs text-xs text-graphite-500">{engine.purpose}</div>
                    {engine.humanGate && (
                      <div className="mt-xs text-[10px] font-bold uppercase tracking-wide text-warning">
                        Human gate
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div className="nexus-card p-md">
            <div className="text-xs font-bold uppercase tracking-wide text-graphite-500">
              Decision Integrity
            </div>
            <div className="mt-md space-y-sm">
              <IntegrityRow label="Verified facts" state="green" />
              <IntegrityRow label="Calculations traceable" state="green" />
              <IntegrityRow label="Policy references" state="amber" />
              <IntegrityRow label="Information gaps" state="amber" />
              <IntegrityRow label="Human recommendation" state="amber" />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-graphite-100 bg-graphite-100/20 p-sm">
      <div className="text-[10px] font-bold uppercase tracking-wide text-graphite-500">
        {label}
      </div>
      <div className="mt-xs text-sm font-bold text-navy-900">{value}</div>
    </div>
  );
}

function DataEntryPlaceholder() {
  return (
    <div className="md:col-span-2">
      <div className="grid gap-sm md:grid-cols-2">
        <label className="nexus-field">
          <span className="text-xs font-bold uppercase tracking-wide text-graphite-500">
            RM judgement / observation
          </span>
          <textarea
            rows={4}
            className="mt-sm w-full resize-y rounded-md border border-graphite-100 bg-white p-sm text-sm"
            placeholder="Enter only non-extractable RM judgement or verified observation..."
          />
        </label>

        <label className="nexus-field">
          <span className="text-xs font-bold uppercase tracking-wide text-graphite-500">
            Evidence / source reference
          </span>
          <textarea
            rows={4}
            className="mt-sm w-full resize-y rounded-md border border-graphite-100 bg-white p-sm text-sm"
            placeholder="Document, page, clause, meeting record, system check..."
          />
        </label>
      </div>
      <div className="mt-sm flex flex-wrap justify-between gap-sm">
        <div className="text-xs text-graphite-500">
          Draft remains unverified until evidence is attached or Team Lead confirms the judgement.
        </div>
        <button type="button" className="nexus-btn">
          Save section draft
        </button>
      </div>
    </div>
  );
}

function IntegrityRow({ label, state }: { label: string; state: 'green' | 'amber' }) {
  return (
    <div className="flex items-center justify-between gap-sm">
      <span className="text-xs text-graphite-700">{label}</span>
      <span
        className={
          'h-2.5 w-2.5 rounded-full ' + (state === 'green' ? 'bg-success' : 'bg-warning')
        }
      />
    </div>
  );
}

function EngineControl({
  selectedEngineId,
  onSelectEngine,
}: {
  selectedEngineId: string;
  onSelectEngine: (engineId: string) => void;
}) {
  const selected = useMemo<Engine>(
    () => engines.find((engine) => engine.id === selectedEngineId) ?? engines[0],
    [selectedEngineId],
  );

  return (
    <div className="nexus-grid nexus-main-grid">
      <section className="nexus-card overflow-hidden">
        <div className="border-b border-graphite-100 px-md py-sm">
          <div className="text-xs font-bold uppercase tracking-wide text-graphite-500">
            12-Engine Architecture
          </div>
          <h2 className="mt-xs">One core, specialised engines, shared canonical data</h2>
        </div>
        <div className="grid gap-sm p-md md:grid-cols-2 xl:grid-cols-3">
          {engines.map((engine, index) => {
            const active = selected.id === engine.id;
            const statusClass =
              engine.status === 'active'
                ? 'bg-success/10 text-success'
                : engine.status === 'review'
                  ? 'bg-warning/10 text-warning'
                  : 'bg-graphite-100 text-graphite-500';

            return (
              <button
                type="button"
                key={engine.id}
                onClick={() => onSelectEngine(engine.id)}
                className={
                  'nexus-card-hover rounded-lg border p-md text-left ' +
                  (active
                    ? 'border-navy-700 bg-navy-950 text-white'
                    : 'border-graphite-100 bg-white')
                }
              >
                <div className="flex items-start justify-between gap-sm">
                  <span
                    className={
                      'text-xs font-bold ' + (active ? 'text-white/50' : 'text-graphite-300')
                    }
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={
                      'rounded-full px-sm py-xs text-[10px] font-bold uppercase tracking-wide ' +
                      statusClass
                    }
                  >
                    {engine.status}
                  </span>
                </div>
                <div className="mt-md text-sm font-bold">{engine.name}</div>
                <div className={'mt-xs text-xs ' + (active ? 'text-white/65' : 'text-graphite-500')}>
                  {engine.purpose}
                </div>
                {engine.humanGate && (
                  <div className="mt-md text-[10px] font-bold uppercase tracking-wide text-warning">
                    Human decision boundary
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <aside className="space-y-md">
        <div className="nexus-card p-md">
          <div className="text-xs font-bold uppercase tracking-wide text-graphite-500">
            Selected Engine
          </div>
          <h3 className="mt-sm">{selected.name}</h3>
          <p className="mt-sm text-sm">{selected.purpose}</p>

          <div className="mt-md space-y-sm">
            <EngineRule label="Input" value="Canonical workspace objects + governed evidence" />
            <EngineRule label="Output" value="Typed result with provenance and state" />
            <EngineRule label="Write rule" value="Never overwrite source evidence" />
            <EngineRule
              label="Decision rule"
              value={
                selected.humanGate
                  ? 'Human approval required for material outcome'
                  : 'Automation permitted within governed scope'
              }
            />
          </div>
        </div>

        <div className="nexus-card p-md">
          <div className="text-xs font-bold uppercase tracking-wide text-graphite-500">
            Core Object Model
          </div>
          <div className="mt-md flex flex-wrap gap-xs">
            {[
              'Customer',
              'Application',
              'Contract',
              'Facility',
              'Security',
              'Counterparty',
              'Evidence',
              'Task',
              'Decision',
              'Output',
            ].map((item) => (
              <span key={item} className="nexus-chip">
                {item}
              </span>
            ))}
          </div>
          <p className="mt-md text-xs">
            Engines read and write governed objects. They do not create independent copies of the
            same customer facts.
          </p>
        </div>
      </aside>
    </div>
  );
}

function EngineRule({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-graphite-100 bg-graphite-100/20 p-sm">
      <div className="text-[10px] font-bold uppercase tracking-wide text-graphite-500">
        {label}
      </div>
      <div className="mt-xs text-xs font-semibold text-navy-900">{value}</div>
    </div>
  );
}

export default App;
