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
    <div className="blockchain-forge-station">
      {/* Station Header */}
      <div className="hud-panel-title">
        <div className="title-left">
          <span className="title-icon">⛓</span>
          <h3>DISTRIBUTED POST-QUANTUM AUDIT LEDGER</h3>
        </div>
        <div className="chain-status-indicator">
          <span className={`status-pill ${chainValid ? "status-pill--valid" : "status-pill--corrupt"}`}>
            {chainValid ? "CHAIN INTEGRITY: VALID (SHA-256)" : "CHAIN INTEGRITY: COMPROMISED"}
          </span>
          <span className="block-height-tag mono">HEIGHT: {chain.length} BLOCKS</span>
        </div>
      </div>

      {/* Forensic Tamper Challenge Bench */}
      <div className="tamper-forensic-bench">
        <div className="bench-header">
          <div className="bench-title">
            <span className="bench-tag">CRYPTOGRAPHIC INTEGRITY & SELF-HEALING SUITE</span>
            <p>
              Simulates unauthorized byte modification on block #1, validates SHA-256 hash avalanche failure,
              and demonstrates automated state recovery.
            </p>
          </div>
          <button
            type="button"
            className={`tamper-actuator-btn ${tamperRunning ? "tamper-actuator-btn--running" : ""}`}
            onClick={handleTamperClick}
            disabled={tamperRunning || chain.length < 2}
          >
            {tamperRunning ? "INJECTING BYTE TAMPER & RE-HASHING…" : "TEST LEDGER TAMPER DETECTION ⚡"}
          </button>
        </div>

        {/* Dynamic Forensic Stages */}
        {tamper && (
          <div className="forensic-trace-deck">
            <div className="forensic-step-ribbon">
              <div className="forensic-step">
                <span className="step-num">01</span>
                <span className="step-name">ORIGINAL STATE</span>
                <span className="step-flag text-emerald mono">
                  {tamper.original_chain_valid ? "VALID" : "INVALID"}
                </span>
              </div>
              <span className="forensic-arrow">▶</span>

              <div className="forensic-step forensic-step--tampered">
                <span className="step-num">02</span>
                <span className="step-name">PAYLOAD MODIFIED</span>
                <span className="step-flag text-crimson mono">
                  {tamper.tampering_detected ? "TAMPER DETECTED" : "UNNOTICED"}
                </span>
              </div>
              <span className="forensic-arrow">▶</span>

              <div className="forensic-step forensic-step--hash">
                <span className="step-num">03</span>
                <span className="step-name">HASH MISMATCH</span>
                <span className="step-flag text-amber mono">
                  {tamper.hash_mismatch_detected ? "AVALANCHE MISMATCH" : "MATCH"}
                </span>
              </div>
              <span className="forensic-arrow">▶</span>

              <div className="forensic-step forensic-step--restored">
                <span className="step-num">04</span>
                <span className="step-name">STATE RESTORATION</span>
                <span className="step-flag text-emerald mono">
                  {tamper.after_restoration ? "RE-ESTABLISHED" : "FAILED"}
                </span>
              </div>
            </div>

            {/* Hash Evidence Diff Bar */}
            <div className="hash-evidence-drawer mono">
              <div className="evidence-line">
                <span className="k">ORIGINAL HASH:</span>
                <span className="v text-cyan">{tamper.original_hash}</span>
              </div>
              <div className="evidence-line">
                <span className="k">TAMPERED HASH:</span>
                <span className="v text-crimson">{tamper.tampered_calculated_hash}</span>
              </div>
              <div className="evidence-line">
                <span className="k">RESTORED HASH:</span>
                <span className="v text-emerald">{tamper.restored_hash}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Continuous Cryptographic Block Tape (Non-card linked ribbon) */}
      <div className="block-tape-container">
        <div className="tape-subhead">CRYPTOGRAPHIC BLOCK STREAM & MERKLE LINKAGE</div>

        <div className="block-tape-scroll">
          {chain.slice().reverse().map((b, idx) => {
            const isGenesis = b.event === "GENESIS";
            const event = typeof b.event === "object" ? b.event : null;
            const isExpanded = activeBlockIndex === b.index;
            const dateStr = b.timestamp ? new Date(b.timestamp * 1000).toLocaleTimeString() : "—";

            return (
              <div key={b.index} className="tape-segment">
                {/* Hardware Cryptographic Node */}
                <div
                  className={`tape-node ${isExpanded ? "tape-node--expanded" : ""} ${isGenesis ? "tape-node--genesis" : "tape-node--security"}`}
                  onClick={() => toggleBlock(b.index)}
                >
                  <div className="node-edge-marker">#{b.index}</div>

                  <div className="node-summary">
                    <div className="node-type">
                      <span className="type-icon">{isGenesis ? "★" : "🛡"}</span>
                      <strong className="mono">{isGenesis ? "GENESIS BLOCK" : event?.type || "SECURITY EVENT"}</strong>
                      {event?.severity && (
                        <span className={`severity-tag severity-tag--${event.severity.toLowerCase()}`}>
                          {event.severity}
                        </span>
                      )}
                    </div>
                    <div className="node-timestamp mono">{dateStr}</div>
                  </div>

                  <div className="node-hash-snippet mono">
                    <span className="hash-prefix">HASH:</span>
                    <span className="hash-val">
                      {b.hash ? `${b.hash.slice(0, 14)}…${b.hash.slice(-10)}` : "—"}
                    </span>
                  </div>

                  <div className="node-expand-toggle mono">{isExpanded ? "▲ FOLD" : "▼ INSPECT"}</div>
                </div>

                {/* Laser Link to Next Block */}
                {idx < chain.length - 1 && (
                  <div className="tape-laser-link">
                    <span className="laser-beam" />
                    <span className="laser-particle" />
                  </div>
                )}

                {/* Expanded Cryptographic Detail Panel */}
                {isExpanded && (
                  <div className="node-detail-drawer">
                    <div className="drawer-row mono">
                      <span className="k">COMPLETE BLOCK HASH:</span>
                      <span className="v text-cyan">{b.hash}</span>
                    </div>
                    <div className="drawer-row mono">
                      <span className="k">PREVIOUS BLOCK LINK:</span>
                      <span className="v text-purple">{b.previous_hash}</span>
                    </div>

                    {event && (
                      <div className="drawer-event-grid mono">
                        <div className="ev-cell">
                          <span className="k">SOURCE FLOW:</span>
                          <span className="v">{event.source} → {event.destination} ({event.protocol})</span>
                        </div>
                        <div className="ev-cell">
                          <span className="k">QAOA OPTIMIZATION:</span>
                          <span className="v text-purple">{event.qaoa_action} (Score: {event.qaoa_score})</span>
                        </div>
                        <div className="ev-cell">
                          <span className="k">POST-QUANTUM CIPHER:</span>
                          <span className="v text-emerald">{event.pqc_algorithm} (NIST Level {event.pqc_nist_level})</span>
                        </div>
                        <div className="ev-cell">
                          <span className="k">DISPATCHED MITIGATION:</span>
                          <span className="v text-cyan">{event.mitigation_action} [{event.mitigation_status}]</span>
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
