import React from "react";
import ThemeToggle from "./ThemeToggle";
import { sound } from "../utils/audio";

export default function TacticalHUDHeader({
  activeView,
  onSelectView,
  online,
  refreshing,
  onRefresh,
  liveCount,
  attackCount,
  blockCount,
  qaoaCount,
  muted,
  onToggleMute,
  theme,
  onToggleTheme
}) {
  const views = [
    { id: "highway", label: "DEFENSE WAVEGUIDE", tag: "PIPELINE TOPOLOGY", icon: "⏣" },
    { id: "quantum", label: "QUANTUM LAB", tag: "CIRCUITS // KERNEL", icon: "⚛" },
    { id: "ledger", label: "AUDIT LEDGER", tag: "CRYPTOGRAPHIC FORENSICS", icon: "⛓" },
    { id: "telemetry", label: "PACKET TERMINAL", tag: "LIVE INGRESS STREAM", icon: "⌨" }
  ];

  return (
    <header className="command-header">
      {/* Upper Status Ribbon */}
      <div className="command-ribbon">
        <div className="command-ribbon__left">
          <div className={`status-badge ${online ? "status-badge--online" : "status-badge--offline"}`}>
            <span className="status-dot" />
            <span className="status-label">{online ? "NETWORK ONLINE" : "OFFLINE FALLBACK ACTIVE"}</span>
          </div>
          <span className="ribbon-divider">/</span>
          <span className="ribbon-spec">NIST PQC: ML-KEM-768</span>
          <span className="ribbon-divider">/</span>
          <span className="ribbon-spec">OPTIMIZER: QAOA 4-QUBIT</span>
          <span className="ribbon-divider">/</span>
          <span className="ribbon-spec">COHERENCE: 99.8%</span>
        </div>

        <div className="command-ribbon__right">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />

          <button
            type="button"
            className="ribbon-btn"
            onClick={() => {
              onToggleMute();
              sound.playClick();
            }}
            title={muted ? "Unmute audio cues" : "Mute audio cues"}
          >
            {muted ? "🔇 Muted" : "🔊 Audio"}
          </button>

          <button
            type="button"
            className={`ribbon-btn ${refreshing ? "ribbon-btn--spinning" : ""}`}
            onClick={() => {
              sound.playClick();
              onRefresh();
            }}
            disabled={refreshing}
          >
            {refreshing ? "⟳ Syncing…" : "⟳ Refresh"}
          </button>
        </div>
      </div>

      {/* Main Command Bar & Horizon Telemetry Ticker (Zero Cards) */}
      <div className="command-bar">
        <div className="command-brand">
          <div className="brand-badge">QD</div>
          <div className="brand-info">
            <h1 className="brand-title">
              QUANTUM<span>DEFENSE</span>
            </h1>
            <p className="brand-subtitle">Autonomous Quantum-Resistant Cyber Defence Platform</p>
          </div>
        </div>

        {/* Seamless Horizon Telemetry Ticker */}
        <div className="horizon-telemetry-ticker">
          <div className="ticker-item">
            <span className="ticker-label">OBSERVED FLOWS</span>
            <span className="ticker-value text-primary mono">{liveCount}</span>
            <span className="ticker-sub">Real Telemetry</span>
          </div>
          <span className="ticker-slash">/</span>

          <div className="ticker-item">
            <span className="ticker-label">THREATS INTERCEPTED</span>
            <span className={`ticker-value mono ${attackCount > 0 ? "text-crimson font-bold" : "text-emerald"}`}>
              {attackCount}
            </span>
            <span className="ticker-sub">{attackCount > 0 ? "Interception Active" : "Perimeter Clear"}</span>
          </div>
          <span className="ticker-slash">/</span>

          <div className="ticker-item">
            <span className="ticker-label">QAOA OPTIMIZATIONS</span>
            <span className="ticker-value text-purple mono">{qaoaCount}</span>
            <span className="ticker-sub">Quantum Solutions</span>
          </div>
          <span className="ticker-slash">/</span>

          <div className="ticker-item">
            <span className="ticker-label">LEDGER HEIGHT</span>
            <span className="ticker-value text-amber mono">{blockCount}</span>
            <span className="ticker-sub">Validated Blocks</span>
          </div>
        </div>
      </div>

      {/* Navigation Workspaces Switcher */}
      <nav className="command-nav">
        {views.map((v) => {
          const active = activeView === v.id;
          return (
            <button
              key={v.id}
              type="button"
              className={`nav-tab ${active ? "nav-tab--active" : ""}`}
              onClick={() => {
                sound.playClick();
                onSelectView(v.id);
              }}
            >
              <span className="nav-tab__icon">{v.icon}</span>
              <div className="nav-tab__text">
                <span className="nav-tab__label">{v.label}</span>
                <span className="nav-tab__tag">{v.tag}</span>
              </div>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
