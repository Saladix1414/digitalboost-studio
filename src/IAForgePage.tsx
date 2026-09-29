import {
  Activity,
  Bot,
  Boxes,
  BrainCircuit,
  Braces,
  ChevronDown,
  CircleDot,
  Database,
  FlaskConical,
  GitBranch,
  Hammer,
  Layers3,
  MemoryStick,
  MessageSquareMore,
  Network,
  Play,
  Plug,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wrench,
  X,
  Zap,
} from "lucide-react";

import { useMemo, useState } from "react";

import "./ia-forge.css";

type ForgeSection =
  | "overview"
  | "models"
  | "intelligences"
  | "agents"
  | "bots"
  | "workflows"
  | "knowledge"
  | "datasets"
  | "tools"
  | "skills"
  | "channels"
  | "evaluations"
  | "laboratory"
  | "deployments";

type ForgeMode =
  | "intelligence"
  | "agent"
  | "bot"
  | "workflow"
  | "multi-agent";

type NavItem = {
  id: ForgeSection;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const NAVIGATION: NavItem[] = [
  { id: "overview", label: "Overview", icon: Boxes },
  { id: "models", label: "Models", icon: BrainCircuit },
  { id: "intelligences", label: "Intelligences", icon: Sparkles },
  { id: "agents", label: "Agents", icon: CircleDot },
  { id: "bots", label: "Bots", icon: Bot },
  { id: "workflows", label: "Workflows", icon: GitBranch },
  { id: "knowledge", label: "Knowledge", icon: Database },
  { id: "datasets", label: "Datasets", icon: Layers3 },
  { id: "tools", label: "Tools & MCP", icon: Wrench },
  { id: "skills", label: "Skills", icon: Zap },
  { id: "channels", label: "Channels", icon: MessageSquareMore },
  { id: "evaluations", label: "Evaluations", icon: ShieldCheck },
  { id: "laboratory", label: "Laboratory", icon: FlaskConical },
  { id: "deployments", label: "Deployments", icon: Plug },
];

const CREATE_MODES: Array<{
  id: ForgeMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  {
    id: "intelligence",
    label: "Intelligence",
    description: "Design a complete intelligence system.",
    icon: Sparkles,
  },
  {
    id: "agent",
    label: "Agent",
    description: "Build an autonomous specialized actor.",
    icon: CircleDot,
  },
  {
    id: "bot",
    label: "Bot",
    description: "Connect intelligence to a channel.",
    icon: Bot,
  },
  {
    id: "workflow",
    label: "Workflow",
    description: "Compose deterministic + AI execution.",
    icon: GitBranch,
  },
  {
    id: "multi-agent",
    label: "Multi-Agent",
    description: "Coordinate specialized agents.",
    icon: Network,
  },
];

const CAPABILITY_NODES = [
  {
    id: "model",
    label: "MODEL",
    detail: "Discovery required",
    state: "idle",
    x: 50,
    y: 12,
  },
  {
    id: "intelligence",
    label: "INTELLIGENCE",
    detail: "Blueprint draft",
    state: "focus",
    x: 50,
    y: 42,
  },
  {
    id: "knowledge",
    label: "KNOWLEDGE",
    detail: "Not configured",
    state: "idle",
    x: 18,
    y: 74,
  },
  {
    id: "memory",
    label: "MEMORY",
    detail: "Not configured",
    state: "idle",
    x: 39,
    y: 82,
  },
  {
    id: "tools",
    label: "TOOLS",
    detail: "Not configured",
    state: "idle",
    x: 61,
    y: 82,
  },
  {
    id: "channels",
    label: "CHANNELS",
    detail: "Not configured",
    state: "idle",
    x: 82,
    y: 74,
  },
];

export default function IAForgePage(props: {
  onClose?: () => void;
}) {
  const [section, setSection] =
    useState<ForgeSection>("overview");

  const [mode, setMode] =
    useState<ForgeMode>("intelligence");

  const [prompt, setPrompt] = useState("");

  const [inspectorOpen, setInspectorOpen] =
    useState(true);

  const [traceTab, setTraceTab] =
    useState<"trace" | "events" | "runtime" | "evaluation">(
      "trace"
    );

  const activeMode = useMemo(
    () =>
      CREATE_MODES.find((item) => item.id === mode) ??
      CREATE_MODES[0],
    [mode]
  );

  return (
    <main
      className="ia-forge"
      data-ia-forge="true"
    >
      <header className="ia-forge__topbar">
        <div className="ia-forge__brand">
          <div className="ia-forge__brand-mark">
            <Hammer size={16} />
          </div>

          <div>
            <div className="ia-forge__brand-title">
              IA FORGE
            </div>
            <div className="ia-forge__brand-subtitle">
              Intelligence Development Environment
            </div>
          </div>
        </div>

        <div className="ia-forge__crumbs">
          <button className="ia-forge__project-button">
            Untitled project
            <ChevronDown size={13} />
          </button>

          <span className="ia-forge__crumb-separator">
            /
          </span>

          <span>Development</span>
        </div>

        <div className="ia-forge__top-actions">
          <button
            className="ia-forge__icon-button"
            title="Search"
          >
            <Search size={16} />
          </button>

          <div
            className="ia-forge__runtime-state"
            title="Runtime has not been discovered yet"
          >
            <span className="ia-forge__state-dot" />
            Runtime discovery required
          </div>

          {props.onClose && (
            <button
              className="ia-forge__icon-button"
              onClick={props.onClose}
              title="Close IA Forge"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </header>

      <section className="ia-forge__workspace">
        <aside className="ia-forge__sidebar">
          <div className="ia-forge__nav-label">
            Forge
          </div>

          <nav className="ia-forge__nav">
            {NAVIGATION.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={
                    active
                      ? "ia-forge__nav-item ia-forge__nav-item--active"
                      : "ia-forge__nav-item"
                  }
                  onClick={() => setSection(item.id)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>

                  {item.id === "overview" && (
                    <span className="ia-forge__nav-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="ia-forge__sidebar-footer">
            <div className="ia-forge__sidebar-status">
              <Activity size={14} />

              <div>
                <strong>Forge Core</strong>
                <span>Visual shell only</span>
              </div>
            </div>

            <button
              className="ia-forge__nav-item"
              type="button"
            >
              <Settings2 size={16} />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        <section className="ia-forge__canvas">
          <div className="ia-forge__canvas-head">
            <div>
              <div className="ia-forge__eyebrow">
                {section === "overview"
                  ? "INTELLIGENCE CREATION"
                  : section.toUpperCase()}
              </div>

              <h1>
                {section === "overview"
                  ? "What do you want to build?"
                  : NAVIGATION.find(
                      (item) => item.id === section
                    )?.label}
              </h1>
            </div>

            <div className="ia-forge__canvas-actions">
              <button className="ia-forge__secondary-button">
                <Braces size={14} />
                Blueprint
              </button>

              <button className="ia-forge__primary-button">
                <Play size={14} />
                Simulate
              </button>
            </div>
          </div>

          {section === "overview" ? (
            <>
              <section className="ia-forge__composer">
                <div className="ia-forge__composer-glow" />

                <div className="ia-forge__composer-head">
                  <div>
                    <span className="ia-forge__composer-kicker">
                      FORGE COMMAND
                    </span>

                    <h2>
                      Describe the intelligence system you
                      want to create.
                    </h2>
                  </div>

                  <div className="ia-forge__mode-chip">
                    {activeMode.label}
                  </div>
                </div>

                <textarea
                  value={prompt}
                  onChange={(event) =>
                    setPrompt(event.target.value)
                  }
                  placeholder="Example: Create a customer service intelligence that understands my catalog, can consult stock, answer questions and operate across Telegram and WhatsApp..."
                />

                <div className="ia-forge__composer-footer">
                  <span>
                    Blueprint generation is not connected yet.
                  </span>

                  <button
                    type="button"
                    className="ia-forge__build-button"
                    disabled={!prompt.trim()}
                  >
                    <Hammer size={14} />
                    Build blueprint
                  </button>
                </div>
              </section>

              <section className="ia-forge__create-grid">
                {CREATE_MODES.map((item) => {
                  const Icon = item.icon;
                  const active = mode === item.id;

                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={
                        active
                          ? "ia-forge__create-card ia-forge__create-card--active"
                          : "ia-forge__create-card"
                      }
                      onClick={() => setMode(item.id)}
                    >
                      <div className="ia-forge__create-icon">
                        <Icon size={17} />
                      </div>

                      <strong>{item.label}</strong>

                      <span>{item.description}</span>
                    </button>
                  );
                })}
              </section>

              <section className="ia-forge__graph-panel">
                <div className="ia-forge__panel-head">
                  <div>
                    <span className="ia-forge__eyebrow">
                      SYSTEM ARCHITECTURE
                    </span>
                    <h2>Capability Graph</h2>
                  </div>

                  <div className="ia-forge__panel-meta">
                    Draft · Local visual state
                  </div>
                </div>

                <div className="ia-forge__graph">
                  <svg
                    className="ia-forge__graph-lines"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <line x1="50" y1="22" x2="50" y2="37" />
                    <line x1="50" y1="50" x2="18" y2="68" />
                    <line x1="50" y1="50" x2="39" y2="76" />
                    <line x1="50" y1="50" x2="61" y2="76" />
                    <line x1="50" y1="50" x2="82" y2="68" />
                  </svg>

                  {CAPABILITY_NODES.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      className={
                        node.state === "focus"
                          ? "ia-forge__graph-node ia-forge__graph-node--focus"
                          : "ia-forge__graph-node"
                      }
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                      }}
                    >
                      <span className="ia-forge__graph-node-dot" />
                      <strong>{node.label}</strong>
                      <small>{node.detail}</small>
                    </button>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="ia-forge__empty-surface">
              <div className="ia-forge__empty-icon">
                {section === "models" ? (
                  <BrainCircuit size={28} />
                ) : section === "bots" ? (
                  <Bot size={28} />
                ) : section === "knowledge" ? (
                  <Database size={28} />
                ) : section === "tools" ? (
                  <Wrench size={28} />
                ) : section === "laboratory" ? (
                  <FlaskConical size={28} />
                ) : (
                  <Boxes size={28} />
                )}
              </div>

              <span className="ia-forge__eyebrow">
                {section.toUpperCase()}
              </span>

              <h2>
                Surface prepared for the next vertical
                slice.
              </h2>

              <p>
                No production data is available yet. This
                area will connect to the canonical IA Forge
                contracts instead of using mock operational
                metrics.
              </p>
            </section>
          )}
        </section>

        {inspectorOpen && (
          <aside className="ia-forge__inspector">
            <div className="ia-forge__inspector-head">
              <div>
                <span className="ia-forge__eyebrow">
                  INSPECTOR
                </span>
                <h2>Intelligence blueprint</h2>
              </div>

              <button
                className="ia-forge__icon-button"
                type="button"
                onClick={() => setInspectorOpen(false)}
              >
                <X size={15} />
              </button>
            </div>

            <InspectorBlock
              title="Identity"
              rows={[
                ["Type", activeMode.label],
                ["Project", "Untitled project"],
                ["Version", "Draft"],
              ]}
            />

            <InspectorBlock
              title="Runtime"
              rows={[
                ["Provider", "Discovery required"],
                ["Model", "Not selected"],
                ["Environment", "Development"],
              ]}
            />

            <InspectorBlock
              title="Capabilities"
              rows={[
                ["Knowledge", "Not configured"],
                ["Memory", "Not configured"],
                ["Tools", "Not configured"],
                ["Channels", "Not configured"],
              ]}
            />

            <div className="ia-forge__inspector-block">
              <div className="ia-forge__inspector-title">
                <ShieldCheck size={14} />
                Governance
              </div>

              <div className="ia-forge__governance">
                <span>
                  Execution authority
                </span>
                <strong>PULSE governed</strong>
              </div>

              <p>
                AI output, tools, models and channels do not
                receive implicit execution authority.
              </p>
            </div>
          </aside>
        )}

        {!inspectorOpen && (
          <button
            type="button"
            className="ia-forge__inspector-restore"
            onClick={() => setInspectorOpen(true)}
            title="Open inspector"
          >
            <Settings2 size={16} />
          </button>
        )}
      </section>

      <footer className="ia-forge__runtime-strip">
        <div className="ia-forge__runtime-tabs">
          {(
            [
              ["trace", "Trace"],
              ["events", "Events"],
              ["runtime", "Runtime"],
              ["evaluation", "Evaluation"],
            ] as const
          ).map(([id, label]) => (
            <button
              type="button"
              key={id}
              className={
                traceTab === id
                  ? "ia-forge__runtime-tab ia-forge__runtime-tab--active"
                  : "ia-forge__runtime-tab"
              }
              onClick={() => setTraceTab(id)}
            >
              {id === "runtime" && (
                <TerminalSquare size={13} />
              )}
              {label}
            </button>
          ))}
        </div>

        <div className="ia-forge__runtime-message">
          <span className="ia-forge__state-dot" />
          {traceTab === "trace" &&
            "No execution trace available."}
          {traceTab === "events" &&
            "No runtime events available."}
          {traceTab === "runtime" &&
            "Runtime discovery has not been executed."}
          {traceTab === "evaluation" &&
            "No evaluation suite configured."}
        </div>

        <div className="ia-forge__runtime-health">
          <MemoryStick size={13} />
          <span>Local UI state</span>
        </div>
      </footer>
    </main>
  );
}

function InspectorBlock(props: {
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <div className="ia-forge__inspector-block">
      <div className="ia-forge__inspector-title">
        {props.title}
      </div>

      <div className="ia-forge__inspector-rows">
        {props.rows.map(([label, value]) => (
          <div
            className="ia-forge__inspector-row"
            key={label}
          >
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
