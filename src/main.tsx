import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("DIGITALBOOST REACT ERROR:", error);
    console.error("DIGITALBOOST COMPONENT STACK:", info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#02050d",
            color: "#fff",
            padding: "24px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            overflow: "auto",
          }}
        >
          <h1 style={{ color: "#f87171", fontSize: "22px" }}>
            DigitalBoost — Error de React
          </h1>

          <p style={{ color: "#fbbf24" }}>
            La aplicación compiló correctamente, pero falló al montarse.
          </p>

          <hr style={{ borderColor: "#333", margin: "20px 0" }} />

          <strong>Error:</strong>
          <pre style={{ color: "#fb7185" }}>
            {this.state.error.message}
          </pre>

          <strong>Stack:</strong>
          <pre style={{ color: "#cbd5e1" }}>
            {this.state.error.stack || "Sin stack disponible"}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById("root");

if (!root) {
  document.body.innerHTML =
    '<div style="padding:30px;color:red;background:#02050d">ERROR: #root no existe.</div>';
} else {
  createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
