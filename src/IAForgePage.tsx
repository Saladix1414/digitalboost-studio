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
}> = [
  {
    id: "intelligence",
    label: "Intelligence",
    description: "Design a complete intelligence system.",
  },
  {
    id: "agent",
    label: "Agent",
    description: "Build an autonomous specialized actor.",
  },
  {
    id: "bot",
    label: "Bot",
    description: "Connect intelligence to a channel.",
  },
  {
    id: "workflow",
    label: "Workflow",
    description: "Compose deterministic + AI execution.",
  },
  {
    id: "multi-agent",
    label: "Multi-Agent",
    description: "Coordinate specialized agents.",
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

          <div className="ia-forge__sidebar-art" aria-hidden="true">
            <img
              src="/ia-forge/forge-pirate-workshop.webp"
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>

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
                      <div
                        className={`ia-forge__create-icon ia-forge__create-icon--${item.id}`}
                        aria-hidden="true"
                      >
                        <ForgeModeIllustration mode={item.id} />
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
                    <path className="ia-forge__graph-edge ia-forge__graph-edge--model" d="M50 21 C50 27 50 32 50 37" />
                    <path className="ia-forge__graph-edge ia-forge__graph-edge--knowledge" d="M46 49 C39 55 29 61 19 68" />
                    <path className="ia-forge__graph-edge ia-forge__graph-edge--memory" d="M48 50 C46 59 42 68 39 76" />
                    <path className="ia-forge__graph-edge ia-forge__graph-edge--tools" d="M52 50 C54 59 58 68 61 76" />
                    <path className="ia-forge__graph-edge ia-forge__graph-edge--channels" d="M54 49 C61 55 71 61 81 68" />
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
            <div className="ia-forge__skyship" aria-hidden="true">
              <img
                src="/ia-forge/forge-pirate-airship.webp"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>

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

function ForgeModeIllustration(props: { mode: ForgeMode }) {
  const id = `forge-${props.mode.replaceAll("-", "")}`;
  const common = {
    className: "ia-forge__mode-art",
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    focusable: false,
    "aria-hidden": true as const,
  };

  if (props.mode === "intelligence") {
    return (
      <svg {...common}>
        <defs>
          <linearGradient id={`${id}-crystal`} x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff77d1" />
            <stop offset=".55" stopColor="#d92b9d" />
            <stop offset="1" stopColor="#8e43bd" />
          </linearGradient>
        </defs>
        <path d="m24 5 15 13-15 25L9 18 24 5Z" fill={`url(#${id}-crystal)`} stroke="#a82c99" />
        <path d="m9 18 15 5 15-5M24 23v20M24 5v18m-9-10 9 10 9-10" stroke="#fff5ff" strokeOpacity=".82" />
        <path d="M7 7v5M4.5 9.5h5M40 27v5M37.5 29.5h5" stroke="#f2a83b" strokeWidth="2" />
      </svg>
    );
  }

  if (props.mode === "agent") {
    return (
      <svg {...common}>
        <defs>
          <linearGradient id={`${id}-shell`} x1="12" y1="12" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f6c7ff" />
            <stop offset="1" stopColor="#b969ce" />
          </linearGradient>
        </defs>
        <path d="M24 5v6m-3-3h6" stroke="#d92b9d" strokeWidth="2.2" />
        <rect x="10" y="12" width="28" height="25" rx="9" fill={`url(#${id}-shell)`} stroke="#87459e" />
        <rect x="14" y="17" width="20" height="13" rx="5" fill="#3a2147" stroke="none" />
        <ellipse cx="20" cy="23.5" rx="1.8" ry="2.5" fill="#ff7ed8" stroke="none" />
        <ellipse cx="28" cy="23.5" rx="1.8" ry="2.5" fill="#ff7ed8" stroke="none" />
        <path d="M19 33h10m-12 5v4m14-4v4" stroke="#87459e" strokeWidth="2" />
        <circle cx="13" cy="16" r="2" fill="#ffc857" stroke="none" />
      </svg>
    );
  }

  if (props.mode === "bot") {
    return (
      <svg {...common}>
        <path d="M29 5h10a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-3l-4 3v-3h-3a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z" fill="#ff8a6d" stroke="#d84b62" />
        <circle cx="32" cy="12" r="1.2" fill="#fff" stroke="none" />
        <circle cx="37" cy="12" r="1.2" fill="#fff" stroke="none" />
        <rect x="6" y="17" width="29" height="24" rx="7" fill="#ffc7b6" stroke="#d84b62" />
        <rect x="10" y="21" width="21" height="12" rx="4" fill="#54273f" stroke="none" />
        <circle cx="17" cy="27" r="1.5" fill="#ffbf68" stroke="none" />
        <circle cx="24" cy="27" r="1.5" fill="#ffbf68" stroke="none" />
        <path d="M15 36h11m-13 5v3m15-3v3" stroke="#d84b62" strokeWidth="2" />
      </svg>
    );
  }

  if (props.mode === "workflow") {
    return (
      <svg {...common}>
        <path d="M11 12v20c0 4 3 6 7 6h12M11 23h12c4 0 6-2 6-6v-3m-6 9h5c4 0 6 2 6 6v5" stroke="#bd6d25" strokeWidth="2.2" />
        <rect x="6" y="6" width="10" height="10" rx="3" fill="#ffcf72" stroke="#bd6d25" />
        <circle cx="11" cy="11" r="1.5" fill="#fff8e9" stroke="none" />
        <circle cx="29" cy="12" r="4.5" fill="#ff9f43" stroke="#bd6d25" />
        <circle cx="34" cy="35" r="4.5" fill="#ffd56f" stroke="#bd6d25" />
        <circle cx="11" cy="23" r="3.5" fill="#f39b52" stroke="#bd6d25" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M13 20v9m11-15v9m11 8v-8M13 29l11-6 11 8" stroke="#84469a" strokeWidth="1.8" />
      <rect x="5" y="10" width="15" height="15" rx="5" fill="#f2d8ff" stroke="#84469a" />
      <rect x="17" y="4" width="15" height="15" rx="5" fill="#d8b2ef" stroke="#84469a" />
      <rect x="29" y="25" width="15" height="15" rx="5" fill="#f2d8ff" stroke="#84469a" />
      <circle cx="10" cy="16" r="1.4" fill="#713273" stroke="none" />
      <circle cx="15" cy="16" r="1.4" fill="#713273" stroke="none" />
      <circle cx="22" cy="10" r="1.4" fill="#713273" stroke="none" />
      <circle cx="27" cy="10" r="1.4" fill="#713273" stroke="none" />
      <circle cx="34" cy="31" r="1.4" fill="#713273" stroke="none" />
      <circle cx="39" cy="31" r="1.4" fill="#713273" stroke="none" />
      <path d="M10 20h5m7-6h5m7 21h5" stroke="#84469a" strokeWidth="1.2" />
    </svg>
  );
}
