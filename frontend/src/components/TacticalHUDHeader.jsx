import React from "react";
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
  onToggleMute
}) {
  const views = [
    { id: "radar", label: "TACTICAL SOC", tag: "RADAR // MATRIX" },
    { id: "quantum", label: "QUANTUM LAB", tag: "QSVC // QAOA" },
    { id: "ledger", label: "LEDGER FORGE", tag: "BLOCKCHAIN // AUDIT" },
    { id: "telemetry", label: "PACKET TERMINAL", tag: "FLOW STREAM" }
  ];

  return (
    <header className="tactical-header">
      {/* Upper Status Ribbon */}
      <div className="telemetry-ribbon">
        <div className="telemetry-ribbon__left">
          <div className={`status-beacon ${online ? "status-beacon--active" : "status-beacon--alert"}`}>
            <span className="beacon-dot" />
            <span className="beacon-text">{online ? "Q-NET ONLINE" : "NET DEGRADED"}</span>
          </div>
          <span className="hud-sep">│</span>
          <span className="hud-crypto-tag">NIST PQC: ML-KEM-768 [LEVEL 3]</span>
          <span className="hud-sep">│</span>
          <span className="hud-qaoa-tag">OPTIMIZER: QAOA 4-QUBIT</span>
          <span className="hud-sep">│</span>
          <span className="hud-coherence">COHERENCE: 99.84%</span>
        </div>

        <div className="telemetry-ribbon__right">
          <button
            type="button"
            className="hud-action-btn"
            onClick={() => {
              onToggleMute();
              sound.playClick();
            }}
            title={muted ? "Unmute tactical audio" : "Mute tactical audio"}
          >
            {muted ? "🔇 MUTED" : "🔊 AUDIO ON"}
          </button>
          <button
            type="button"
            className={`hud-action-btn ${refreshing ? "spinning" : ""}`}
            onClick={() => {
              sound.playClick();
              onRefresh();
            }}
            disabled={refreshing}
          >
            {refreshing ? "⟳ RESYNCING…" : "⟳ RESYNC HUD"}
          </button>
        </div>
      </div>

      {/* Main Bridge Title & Integrated Telemetry Conduit */}
      <div className="tactical-bridge">
        <div className="tactical-brand">
          <div className="brand-logo-mark">
            <svg viewBox="0 0 40 40" className="quantum-hex">
              <polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="#00f0ff" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="6" fill="#8a2be2" opacity="0.8" />
              <line x1="20" y1="2" x2="20" y2="38" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="2" y1="20" x2="38" y2="20" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 3" />
            </svg>
          </div>
          <div className="brand-titles">
            <div className="brand-eyebrow">AUTONOMOUS QUANTUM-RESISTANT CYBER DEFENCE NETWORK</div>
            <h1 className="brand-title">
              QUANTUM<span>DEFENSE</span> <small>COMMAND BRIDGE v2.4</small>
            </h1>
          </div>
        </div>

        {/* Continuous Telemetry Matrix Display */}
        <div className="telemetry-matrix">
          <div className="telemetry-cell">
            <span className="cell-label">LIVE OBSERVED FLOWS</span>
            <span className="cell-value cell-value--cyan">{liveCount}</span>
            <span className="cell-sub">real capture stream</span>
          </div>
          <div className="telemetry-cell">
            <span className="cell-label">AI DETECTED THREATS</span>
            <span className={`cell-value ${attackCount > 0 ? "cell-value--alert" : "cell-value--green"}`}>
              {attackCount}
            </span>
            <span className="cell-sub">{attackCount > 0 ? "INTERCEPTION ACTIVE" : "PERIMETER SECURE"}</span>
          </div>
          <div className="telemetry-cell">
            <span className="cell-label">QAOA OPTIMIZATIONS</span>
            <span className="cell-value cell-value--purple">{qaoaCount}</span>
            <span className="cell-sub">quantum state solutions</span>
          </div>
          <div className="telemetry-cell">
            <span className="cell-label">LEDGER HEIGHT</span>
            <span className="cell-value cell-value--emerald">{blockCount}</span>
            <span className="cell-sub">tamper-proof blocks</span>
          </div>
        </div>
      </div>

      {/* Cybernetic Viewport Navigation Tabs */}
      <nav className="tactical-nav">
        {views.map((v) => {
          const active = activeView === v.id;
          return (
            <button
              key={v.id}
              type="button"
              className={`tactical-tab ${active ? "tactical-tab--active" : ""}`}
              onClick={() => {
                sound.playClick();
                onSelectView(v.id);
              }}
            >
              <span className="tab-corner tab-corner--tl" />
              <span className="tab-corner tab-corner--br" />
              <span className="tab-label">{v.label}</span>
              <span className="tab-tag">{v.tag}</span>
              {active && <span className="tab-glow-indicator" />}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
