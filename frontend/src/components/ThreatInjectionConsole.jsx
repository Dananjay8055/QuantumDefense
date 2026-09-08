import React, { useState } from "react";
import { sound } from "../utils/audio";

const SEVERITY_STEPS = [
  {
    id: "LOW",
    label: "LOW (Reconnaissance)",
    prob: 55,
    color: "var(--color-primary)",
    desc: "Perimeter ping sweep and non-destructive port identification."
  },
  {
    id: "MEDIUM",
    label: "MEDIUM (Port Scanning)",
    prob: 70,
    color: "var(--color-amber)",
    desc: "Sequential service probing attempting vulnerability identification."
  },
  {
    id: "HIGH",
    label: "HIGH (Lateral Infiltration)",
    prob: 85,
    color: "#ea580c",
    desc: "Anomalous lateral transit with privilege escalation payload."
  },
  {
    id: "CRITICAL",
    label: "CRITICAL (Zero-Day Breach)",
    prob: 98,
    color: "var(--color-crimson)",
    desc: "Coordinated quantum-assisted key extraction attack attempting firewall bypass."
  }
];

const ACTIONS = [
  { key: "MONITOR", label: "Passive Monitoring", desc: "Flag packet and continue telemetry observation." },
  { key: "RATE_LIMIT", label: "Rate Limiting", desc: "Dynamic ingress bandwidth throttling on suspect subnet." },
  { key: "BLOCK_SOURCE", label: "Firewall Drop Rule", desc: "Drop all packets via post-quantum authenticated RPC." },
  { key: "ISOLATE_HOST", label: "VLAN Quarantine", desc: "Quarantine target machine into isolated zero-trust VLAN." }
];

export default function ThreatInjectionConsole({
  latestSimulated,
  running,
  onRunAttack,
  pqc,
  blockchain
}) {
  const [severityIndex, setSeverityIndex] = useState(2); // default: HIGH (index 2)

  const currentProfile = SEVERITY_STEPS[severityIndex];
  const response = latestSimulated?.response;
  const scores = response?.response_scores || {
    MONITOR: 0.12,
    RATE_LIMIT: 0.48,
    BLOCK_SOURCE: 0.912,
    ISOLATE_HOST: 0.76
  };
  const maxScore = Math.max(1, ...Object.values(scores).filter((v) => typeof v === "number"));

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSeverityIndex(val);
    sound.playClick();
  };

  const handleTrigger = () => {
    sound.playAlert();
    onRunAttack(currentProfile.id);
  };

  return (
    <div className="threat-linear-actuator-station">
      <div className="station-horizon-bar">
        <div className="horizon-left">
          <span className="horizon-icon">⚡</span>
          <div>
            <h3 className="horizon-title">AUTONOMOUS THREAT INJECTION & QAOA ACTUATION</h3>
            <p className="horizon-sub">Inject Controlled Cyber Range Scenarios to Trigger Quantum Defense Sequence</p>
          </div>
        </div>

        <div className="horizon-right">
          <span className="status-pill status-pill--active">
            {running ? `EXECUTING ${currentProfile.id}…` : "ACTUATOR ARMED"}
          </span>
        </div>
      </div>

      <div className="linear-actuator-workbench">
        {/* Left: Continuous Threat Slider Strip */}
        <div className="slider-control-rail">
          <div className="rail-subhead">
            <span>1. CONTINUOUS THREAT INTENSITY CONTROLLER</span>
            <span className="prob-display mono" style={{ color: currentProfile.color }}>
              PROBABILITY: {currentProfile.prob}% ATTACK
            </span>
          </div>

          {/* Stepped Range Slider */}
          <div className="range-track-container">
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={severityIndex}
              onChange={handleSliderChange}
              className="threat-linear-slider"
              style={{ "--slider-accent": currentProfile.color }}
            />
            <div className="slider-notches-row mono">
              {SEVERITY_STEPS.map((step, idx) => (
                <span
                  key={step.id}
                  className={`notch-label ${idx === severityIndex ? "notch-label--active" : ""}`}
                  onClick={() => {
                    setSeverityIndex(idx);
                    sound.playClick();
                  }}
                  style={{ color: idx === severityIndex ? step.color : undefined }}
                >
                  {step.id}
                </span>
              ))}
            </div>
          </div>

          {/* Selected Threat Scenario Description (No cards, clean inline strip) */}
          <div className="scenario-detail-strip">
            <div className="scenario-title" style={{ color: currentProfile.color }}>
              {currentProfile.label}
            </div>
            <div className="scenario-desc">{currentProfile.desc}</div>
          </div>

          <button
            type="button"
            className={`linear-fire-btn ${running ? "linear-fire-btn--running" : ""}`}
            onClick={handleTrigger}
            disabled={!!running}
          >
            <span className="btn-icon">⚡</span>
            <span>
              {running ? `PROCESSING ${currentProfile.id} DEFENSE PIPELINE…` : `EXECUTE DEFENSE SEQUENCE: ${currentProfile.id}`}
            </span>
          </button>
        </div>

        {/* Right: QAOA Optimization Spectrum & Mitigation (Borderless integrated layout) */}
        <div className="qaoa-spectrum-rail">
          <div className="rail-subhead">
            <span>2. QAOA HAMILTONIAN OPTIMIZATION SPECTRUM</span>
            <span className="mono text-purple">
              OPTIMAL ACTION: <b>{response?.action || "BLOCK_SOURCE"}</b>
            </span>
          </div>

          <div className="spectrum-action-bars">
            {ACTIONS.map((act) => {
              const isChosen = (response?.action || "BLOCK_SOURCE") === act.key;
              const scoreVal = typeof scores[act.key] === "number" ? scores[act.key] : 0.2;
              const widthPct = Math.max(10, (scoreVal / maxScore) * 100);

              return (
                <div key={act.key} className={`linear-action-row ${isChosen ? "linear-action-row--chosen" : ""}`}>
                  <div className="action-row-left">
                    <span className="action-key mono">{act.key}</span>
                    <span className="action-sub">{act.label}</span>
                    {isChosen && <span className="optimal-flag">QAOA OPTIMAL</span>}
                  </div>

                  <div className="action-row-right">
                    <div className="action-bar-track">
                      <div
                        className="action-bar-gauge"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: isChosen ? "var(--color-primary)" : "var(--color-purple)"
                        }}
                      />
                    </div>
                    <span className="action-score-val mono">{scoreVal.toFixed(3)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Executed Mitigation Banner */}
          {latestSimulated?.mitigation && (
            <div className="linear-mitigation-banner mono">
              <span className="mitigation-flag text-emerald">MITIGATION DISPATCHED:</span>
              <span className="mitigation-msg">{latestSimulated.mitigation.message}</span>
              <span className="mitigation-status text-primary">[{latestSimulated.mitigation.status}]</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
