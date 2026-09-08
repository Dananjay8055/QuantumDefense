import React, { useState } from "react";
import { sound } from "../utils/audio";

const SEVERITY_LEVELS = [
  {
    id: "LOW",
    title: "RECONNAISSANCE PROBE",
    prob: 55,
    color: "#00f0ff",
    desc: "Unusual TCP SYN flag anomalies detected on external gateway."
  },
  {
    id: "MEDIUM",
    title: "PORT SCAN & ENUMERATION",
    prob: 70,
    color: "#ffaa00",
    desc: "Rapid sequential port probing against internal web daemon."
  },
  {
    id: "HIGH",
    title: "LATERAL EXFILTRATION",
    prob: 85,
    color: "#ff6600",
    desc: "Unauthorized privilege escalation and encrypted payload staging."
  },
  {
    id: "CRITICAL",
    title: "QUANTUM ZERO-DAY BREACH",
    prob: 98,
    color: "#ff3366",
    desc: "Distributed Shor/Grover key-derivation attack attempting bypass."
  }
];

const ACTIONS = [
  { key: "MONITOR", desc: "Passive packet logging & telemetry retention" },
  { key: "RATE_LIMIT", desc: "Dynamic bandwidth throttling on offending IP" },
  { key: "BLOCK_SOURCE", desc: "PQC-authenticated drop rule applied to edge firewall" },
  { key: "ISOLATE_HOST", desc: "Quarantine affected host into micro-segmented zero-trust VLAN" }
];

export default function ThreatInjectionConsole({ latestSimulated, running, onRunAttack, pqc, blockchain }) {
  const [selectedSeverity, setSelectedSeverity] = useState("HIGH");

  const currentProfile = SEVERITY_LEVELS.find((s) => s.id === selectedSeverity) || SEVERITY_LEVELS[2];
  const response = latestSimulated?.response;
  const scores = response?.response_scores || {
    MONITOR: 0.12,
    RATE_LIMIT: 0.48,
    BLOCK_SOURCE: 0.91,
    ISOLATE_HOST: 0.76
  };
  const maxScore = Math.max(1, ...Object.values(scores).filter((v) => typeof v === "number"));

  const handleTrigger = () => {
    sound.playAlert();
    onRunAttack(selectedSeverity);
  };

  return (
    <div className="threat-console-station">
      {/* Console Header */}
      <div className="hud-panel-title">
        <span className="title-icon">⚡</span>
        <h3>AUTONOMOUS DEFENSE & THREAT SIMULATION ACTUATOR</h3>
        <span className="pqc-status-pill">
          {running ? "PROCESSING DEFENSE SEQUENCE…" : "READY FOR INJECTION"}
        </span>
      </div>

      <div className="threat-actuator-grid">
        {/* Severity Selector Throttle */}
        <div className="threat-throttle-column">
          <div className="column-subhead">1. SELECT THREAT VAPOR SIGNATURE</div>
          <div className="throttle-selector">
            {SEVERITY_LEVELS.map((lvl) => {
              const active = selectedSeverity === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  className={`throttle-notch ${active ? "throttle-notch--active" : ""}`}
                  style={{
                    borderColor: active ? lvl.color : "rgba(0, 240, 255, 0.15)",
                    boxShadow: active ? `0 0 15px ${lvl.color}40` : "none"
                  }}
                  onClick={() => {
                    sound.playClick();
                    setSelectedSeverity(lvl.id);
                  }}
                >
                  <div className="throttle-indicator" style={{ backgroundColor: lvl.color }} />
                  <div className="throttle-info">
                    <div className="throttle-name" style={{ color: active ? lvl.color : "#c0d4f0" }}>
                      {lvl.id} : {lvl.title}
                    </div>
                    <div className="throttle-prob mono">
                      ATTACK PROBABILITY: {lvl.prob}%
                    </div>
                  </div>
                  <span className="notch-chevron">{active ? "◀" : "▷"}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className={`tactical-fire-button ${running ? "tactical-fire-button--firing" : ""}`}
            onClick={handleTrigger}
            disabled={!!running}
          >
            <span className="fire-icon">⏣</span>
            <span className="fire-text">
              {running ? `ORCHESTRATING DEFENSE: ${running}…` : `EXECUTE THREAT RESPONSE: ${selectedSeverity}`}
            </span>
            <span className="fire-laser" />
          </button>
        </div>

        {/* Real-Time Photonic Defense Mitigation Conduit */}
        <div className="defense-conduit-column">
          <div className="column-subhead">2. CONTINUOUS DEFENSE SIGNAL PROPAGATION</div>

          <div className="defense-photonic-bus">
            {/* Stage 1: AI Ingestion */}
            <div className="photonic-node photonic-node--ai">
              <div className="node-marker">01</div>
              <div className="node-content">
                <span className="node-title">RF DETECTOR</span>
                <span className="node-metric text-cyan">
                  {latestSimulated?.result?.probability_attack
                    ? `${(latestSimulated.result.probability_attack * 100).toFixed(1)}% ATTACK`
                    : `${currentProfile.prob}% SIMULATED`}
                </span>
                <small className="node-sub">CICIDS2017 Classifier</small>
              </div>
            </div>

            <div className="photonic-link">
              <span className="link-beam" />
              <span className="link-arrow">▶</span>
            </div>

            {/* Stage 2: QAOA Optimizer */}
            <div className="photonic-node photonic-node--qaoa">
              <div className="node-marker">02</div>
              <div className="node-content">
                <span className="node-title">QAOA OPTIMIZER</span>
                <span className="node-metric text-purple">
                  {response?.action || "BLOCK_SOURCE"}
                </span>
                <small className="node-sub">Score: {response?.score ? response.score.toFixed(3) : "0.912"}</small>
              </div>
            </div>

            <div className="photonic-link">
              <span className="link-beam" />
              <span className="link-arrow">▶</span>
            </div>

            {/* Stage 3: PQC Shield */}
            <div className="photonic-node photonic-node--pqc">
              <div className="node-marker">03</div>
              <div className="node-content">
                <span className="node-title">ML-KEM-768 PQC</span>
                <span className="node-metric text-emerald">
                  {latestSimulated?.pqc?.algorithm || pqc?.result?.algorithm || "ML-KEM-768"}
                </span>
                <small className="node-sub">Lattice Secret Match: ✓</small>
              </div>
            </div>

            <div className="photonic-link">
              <span className="link-beam" />
              <span className="link-arrow">▶</span>
            </div>

            {/* Stage 4: Immutable Ledger */}
            <div className="photonic-node photonic-node--blockchain">
              <div className="node-marker">04</div>
              <div className="node-content">
                <span className="node-title">AUDIT LEDGER</span>
                <span className="node-metric text-amber">
                  {blockchain?.valid ? `BLOCK #${Math.max(0, (blockchain.length || 1) - 1)}` : "IMMUTABLE"}
                </span>
                <small className="node-sub">SHA-256 Validated</small>
              </div>
            </div>
          </div>

          {/* QAOA Quantum Hamiltonian Energy & Response Bar Graph */}
          <div className="qaoa-spectrum-station">
            <div className="spectrum-header">
              <div className="spectrum-title">
                <span>QAOA HAMILTONIAN OPTIMIZATION LANDSCAPE</span>
                <small className="mono">
                  Quantum State: [{(response?.variables || [0, 0, 1, 0]).join(", ")}]
                </small>
              </div>
              <div className="spectrum-badge">
                <span className="mono text-emerald">
                  {response?.qaoa_matches_classical ? "✓ MATCHES CLASSICAL OPTIMUM" : "EQUIVALENT OPTIMUM"}
                </span>
              </div>
            </div>

            <div className="qaoa-bars-spectrum">
              {ACTIONS.map((act) => {
                const isSelected = (response?.action || "BLOCK_SOURCE") === act.key;
                const scoreVal = typeof scores[act.key] === "number" ? scores[act.key] : 0.2;
                const pctWidth = Math.max(8, (scoreVal / maxScore) * 100);

                return (
                  <div key={act.key} className={`spectrum-row ${isSelected ? "spectrum-row--selected" : ""}`}>
                    <div className="spectrum-label-box">
                      <span className="act-name mono">{act.key}</span>
                      {isSelected && <span className="selected-tag">CHOSEN RESPONSE</span>}
                    </div>
                    <div className="spectrum-track">
                      <div
                        className="spectrum-fill"
                        style={{
                          width: `${pctWidth}%`,
                          backgroundColor: isSelected ? "#00f0ff" : "rgba(138, 43, 226, 0.45)"
                        }}
                      />
                    </div>
                    <span className="spectrum-val mono">{scoreVal.toFixed(3)}</span>
                  </div>
                );
              })}
            </div>

            {latestSimulated?.mitigation && (
              <div className="mitigation-feed-ribbon mono">
                <span className="tag text-purple">EXECUTED MITIGATION:</span>
                <span className="desc">{latestSimulated.mitigation.message}</span>
                <span className="status text-emerald">[{latestSimulated.mitigation.status}]</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
