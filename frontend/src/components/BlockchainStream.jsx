import React, { useState } from "react";
import { sound } from "../utils/audio";

export default function BlockchainStream({
  blockchain,
  latestSimulated,
  onRunTamper,
  tamperRunning,
  tamperResult
}) {
  const [activeBlockIndex, setActiveBlockIndex] = useState(null);

  const chain = blockchain?.chain || [];
  const chainValid = blockchain?.valid !== false;
  const tamper = tamperResult?.tamper_detection;

  const handleTamperClick = () => {
    sound.playAlert();
    onRunTamper();
  };

  const toggleBlock = (idx) => {
    sound.playClick();
    setActiveBlockIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="blockchain-filmstrip-station">
      <div className="station-horizon-bar">
        <div className="horizon-left">
          <span className="horizon-icon">⛓</span>
          <div>
            <h3 className="horizon-title">DISTRIBUTED CRYPTOGRAPHIC AUDIT TRACK</h3>
            <p className="horizon-sub">SHA-256 Merkle Ledger with Post-Quantum Security Logging & Automated Self-Healing</p>
          </div>
        </div>

        <div className="horizon-right">
          <span className={`status-pill ${chainValid ? "status-pill--active" : "status-pill--alert"}`}>
            {chainValid ? "LEDGER INTEGRITY: VERIFIED" : "CHAIN INTEGRITY COMPROMISED"}
          </span>
          <span className="height-pill mono">HEIGHT: {chain.length} BLOCKS</span>
        </div>
      </div>

      {/* Forensic Tamper Challenge Strip (Zero Cards) */}
      <div className="tamper-forensic-strip">
        <div className="forensic-top-rail">
          <div>
            <span className="strip-badge">CRYPTOGRAPHIC TAMPER DETECTION TESTBED</span>
            <h4>Live Byte Corruption & Automated Ledger Recovery</h4>
            <p>
              Simulates unauthorized modification of block #1, validates SHA-256 hash mismatch detection, and restores chain state.
            </p>
          </div>

          <button
            type="button"
            className={`linear-tamper-btn ${tamperRunning ? "linear-tamper-btn--running" : ""}`}
            onClick={handleTamperClick}
            disabled={tamperRunning || chain.length < 2}
          >
            <span className="btn-icon">⚡</span>
            <span>{tamperRunning ? "VALIDATING CORRUPTION & RESTORING…" : "TEST LEDGER TAMPER DETECTION"}</span>
          </button>
        </div>

        {/* Results Progression Ribbon */}
        {tamper && (
          <div className="forensic-progression-ribbon">
            <div className="progression-steps-line mono">
              <div className="step-cell">
                <span className="step-tag">01. PRE-CHECK</span>
                <span className="step-val text-emerald">{tamper.original_chain_valid ? "VALID STATE" : "INVALID"}</span>
              </div>
              <span className="step-sep">→</span>
              <div className="step-cell">
                <span className="step-tag">02. MODIFICATION</span>
                <span className="step-val text-crimson">{tamper.tampering_detected ? "TAMPER DETECTED" : "MISSED"}</span>
              </div>
              <span className="step-sep">→</span>
              <div className="step-cell">
                <span className="step-tag">03. AVALANCHE</span>
                <span className="step-val text-amber">{tamper.hash_mismatch_detected ? "HASH MISMATCH" : "MATCH"}</span>
              </div>
              <span className="step-sep">→</span>
              <div className="step-cell">
                <span className="step-tag">04. RECOVERY</span>
                <span className="step-val text-emerald">{tamper.after_restoration ? "RESTORED" : "FAILED"}</span>
              </div>
            </div>

            <div className="hash-diff-strip mono">
              <div className="hash-row">
                <span className="hash-k">ORIGINAL HASH:</span>
                <span className="hash-v text-primary">{tamper.original_hash}</span>
              </div>
              <div className="hash-row">
                <span className="hash-k">TAMPERED HASH:</span>
                <span className="hash-v text-crimson">{tamper.tampered_calculated_hash}</span>
              </div>
              <div className="hash-row">
                <span className="hash-k">RESTORED HASH:</span>
                <span className="hash-v text-emerald">{tamper.restored_hash}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Continuous Cryptographic Filmstrip Track */}
      <div className="filmstrip-track-viewport">
        <div className="filmstrip-subhead">IMMUTABLE BLOCK CHAIN STREAM</div>

        <div className="timeline-filmstrip-rail">
          {chain.slice().reverse().map((b) => {
            const isGenesis = b.event === "GENESIS";
            const event = typeof b.event === "object" ? b.event : null;
            const isExpanded = activeBlockIndex === b.index;
            const timeStr = b.timestamp ? new Date(b.timestamp * 1000).toLocaleString() : "—";

            return (
              <div key={b.index} className="filmstrip-milestone">
                {/* Milestone Node on the Track */}
                <div
                  className={`milestone-bar ${isExpanded ? "milestone-bar--expanded" : ""}`}
                  onClick={() => toggleBlock(b.index)}
                >
                  <div className="milestone-hub">
                    <span className="milestone-dot" />
                    <span className="milestone-idx mono">#{b.index}</span>
                  </div>

                  <div className="milestone-identity">
                    <strong>{isGenesis ? "GENESIS BLOCK" : event?.type || "SECURITY EVENT"}</strong>
                    {event?.severity && (
                      <span className={`inline-sev-tag inline-sev-tag--${event.severity.toLowerCase()}`}>
                        {event.severity}
                      </span>
                    )}
                    <span className="milestone-time mono">{timeStr}</span>
                  </div>

                  <div className="milestone-hash mono">
                    <span className="hash-prefix">HASH:</span>
                    <span className="hash-string">
                      {b.hash ? `${b.hash.slice(0, 16)}…${b.hash.slice(-12)}` : "—"}
                    </span>
                  </div>

                  <span className="expand-indicator mono">{isExpanded ? "Fold ▲" : "Inspect ▼"}</span>
                </div>

                {/* Expanded Merkle Cryptographic Trace */}
                {isExpanded && (
                  <div className="milestone-drawer mono">
                    <div className="drawer-line">
                      <span className="k">FULL BLOCK HASH:</span>
                      <span className="v text-primary">{b.hash}</span>
                    </div>
                    <div className="drawer-line">
                      <span className="k">PREVIOUS BLOCK HASH:</span>
                      <span className="v text-purple">{b.previous_hash}</span>
                    </div>

                    {event && (
                      <div className="drawer-telemetry-strip">
                        <div className="strip-item">
                          <span className="k">FLOW:</span>
                          <span className="v">{event.source} → {event.destination} ({event.protocol})</span>
                        </div>
                        <div className="strip-item">
                          <span className="k">QAOA DECISION:</span>
                          <span className="v text-purple">{event.qaoa_action} (Score: {event.qaoa_score})</span>
                        </div>
                        <div className="strip-item">
                          <span className="k">PQC ENCRYPTION:</span>
                          <span className="v text-emerald">{event.pqc_algorithm} [Level {event.pqc_nist_level}]</span>
                        </div>
                        <div className="strip-item">
                          <span className="k">MITIGATION:</span>
                          <span className="v text-primary">{event.mitigation_action} [{event.mitigation_status}]</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
