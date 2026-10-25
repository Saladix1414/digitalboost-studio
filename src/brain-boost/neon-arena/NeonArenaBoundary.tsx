import { Component, type ReactNode } from 'react';

/** Isolate lazy chunk/UI failures so the landing and sibling games remain usable. */
export default class NeonArenaBoundary extends Component<{ children: ReactNode; onExit: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div role="alert" className="rounded-xl border border-cyan-300/40 p-5 text-cyan-100">
      <p>No se pudo abrir Neon Arena. Los demás juegos siguen disponibles.</p>
      <button type="button" className="mt-4 rounded-lg border border-cyan-300/40 px-4 py-3" onClick={this.props.onExit}>Volver a Focus Lab</button>
    </div> : this.props.children;
  }
}
