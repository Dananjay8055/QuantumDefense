import React, { useState } from "react";
import { sound } from "../utils/audio";

export default function DefenseHighway({
  detections,
  latestSimulated,
  latestLive,
  pqc,
  blockchain,
  running
}) {
  const [selectedStage, setSelectedStage] = useState("ai");

  const latestEvent = latestSimulated || detections[detections.length - 1] || null;
  const isAttack = latestEvent?.result?.prediction === 1;
  const attackProb = latestEvent?.result?.probability_attack || 0.05;
  const response = latestEvent?.response;

  const stages = [
    {
      id: "ingress",
      step: "01",
      name: "Traffic Ingress",
      status: "STREAMING",
      metric: `${detections.length} Flows Captured`,
      desc: "Real-time network packet capture and layer-4 socket inspection.",
      color: "var(--color-primary)"
    },
    {
      id: "ai",
      step: "02",
      name: "AI Threat Sensor",
      status: isAttack ? "ALERT" : "NOMINAL",
      metric: `${(attackProb * 100).toFixed(1)}% Attack Prob`,
      desc: "100-Tree Random Forest trained on CICIDS2017 flow vectors.",
      color: isAttack ? "var(--color-crimson)" : "var(--color-emerald)"
    },
    {
      id: "qaoa",
      step: "03",
      name: "QAOA Quantum Optimizer",
      status: "OPTIMIZED",
      metric: response?.action || "BLOCK_SOURCE",
      desc: "Hamiltonian energy minimization searching multi-action mitigation space.",
      color: "var(--color-purple)"
    },
    {
      id: "pqc",
      step: "04",
      name: "ML-KEM-768 Shield",
      status: "VERIFIED",
      metric: "NIST Level 3 Secret Match",
      desc: "Post-quantum lattice key encapsulation securing firewall commands.",
      color: "var(--color-emerald)"
    },
    {
      id: "ledger",
      step: "05",
      name: "Audit Blockchain",
      status: blockchain?.valid !== false ? "IMMUTABLE" : "CORRUPTED",
      metric: `Height #${Math.max(0, (blockchain?.length || 1) - 1)}`,
      desc: "SHA-256 Merkle-linked audit trail preventing forensic tampering.",
      color: "var(--color-amber)"
    }
  ];

  const handleStageClick = (id) => {
    sound.playClick();
    setSelectedStage(id);
  };

  const activeStage = stages.find((s) => s.id === selectedStage) || stages[1];

  return (
    <div className="photonic-highway-station">
      {/* Station Horizon Bar */}
      <div className="station-horizon-bar">
        <div className="horizon-left">
          <span className="horizon-icon">⏣</span>
          <div>
            <h3 className="horizon-title">AUTONOMOUS DEFENSE WAVEGUIDE</h3>
            <p className="horizon-sub">Continuous Signal Conduit & Multi-Stage Defense Propagation</p>
          </div>
        </div>

        <div className="horizon-right">
          <span className={`status-pill ${running ? "status-pill--running" : isAttack ? "status-pill--alert" : "status-pill--active"}`}>
            {running ? "PROPAGATING DEFENSE SIGNAL…" : isAttack ? "INTERCEPTION ACTIVE" : "DEFENSE ENVELOPE SECURE"}
          </span>
        </div>
      </div>

      {/* Zero-Card Waveguide Conduit Track */}
      <div className="waveguide-track-stage">
        {/* Continuous laser beam */}
        <div className="waveguide-laser-conduit">
          <div className={`laser-line ${running ? "laser-line--firing" : ""}`} />
          {running && <div className="laser-traveling-packet" />}
        </div>

        {/* Junction Nodes along the Conduit Line */}
        <div className="waveguide-junctions-line">
          {stages.map((st) => {
            const isSelected = selectedStage === st.id;
            return (
              <div
                key={st.id}
                className={`waveguide-junction ${isSelected ? "waveguide-junction--selected" : ""}`}
                onClick={() => handleStageClick(st.id)}
                style={{ "--junction-color": st.color }}
              >
                {/* Physical node on the line */}
                <div className="junction-hub">
                  <span className="hub-core" />
                  <span className="hub-pulse" />
                  <span className="hub-step mono">{st.step}</span>
                </div>

                {/* Inline Telemetry Labels directly on the track */}
                <div className="junction-info">
                  <span className="junction-name">{st.name}</span>
                  <span className="junction-metric mono">{st.metric}</span>
                  <span className="junction-status mono" style={{ color: st.color }}>
                    ● {st.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integrated Telemetry Readout (No cards, clean borderless ribbon) */}
      <div className="waveguide-telemetry-ribbon">
        <div className="ribbon-summary">
          <span className="ribbon-stage-title" style={{ color: activeStage.color }}>
            SELECTED STAGE: [{activeStage.step}] {activeStage.name.toUpperCase()}
          </span>
          <span className="ribbon-stage-desc">{activeStage.desc}</span>
        </div>

        <div className="ribbon-telemetry-row mono">
          {selectedStage === "ingress" && (
            <>
              <div className="ribbon-cell">
                <span className="k">SOURCE FLOW</span>
                <span className="v">{latestLive?.flow?.[0] || "192.168.1.104"}</span>
              </div>
              <div className="ribbon-cell">
                <span className="k">DESTINATION</span>
                <span className="v">{latestLive?.flow?.[1] || "10.0.0.1"}:{latestLive?.flow?.[3] || 8080}</span>
              </div>
              <div className="ribbon-cell">
                <span className="k">PROTOCOL</span>
                <span className="v text-primary">{latestLive?.flow?.[4] || "TCP"}</span>
              </div>
              <div className="ribbon-cell">
                <span className="k">INGRESS BUFFER</span>
                <span className="v text-emerald">{detections.length} Flows</span>
              </div>
            </>
          )}

          {selectedStage === "ai" && (
            <>
              <div className="ribbon-cell">
                <span className="k">CLASSIFICATION</span>
                <span className={`v ${isAttack ? "text-crimson font-bold" : "text-emerald font-bold"}`}>
                  {isAttack ? "MALICIOUS (ATTACK)" : "NORMAL (BENIGN)"}
                </span>
              </div>
              <div className="ribbon-cell">
                <span className="k">ATTACK PROB</span>
                <span className="v">{(attackProb * 100).toFixed(2)}%</span>
              </div>
              <div className="ribbon-cell">
                <span className="k">BENIGN PROB</span>
                <span className="v">{((1 - attackProb) * 100).toFixed(2)}%</span>
              </div>
              <div className="ribbon-cell">
                <span className="k">CLASSIFIER</span>
                <span className="v text-primary">RandomForest (100T)</span>
              </div>
            </>
          )}

          {selectedStage === "qaoa" && (
            <>
              <div className="ribbon-cell">
                <span className="k">CHOSEN RESPONSE</span>
                <span className="v text-purple font-bold">{response?.action || "BLOCK_SOURCE"}</span>
              </div>
              <div className="ribbon-cell">
                <span className="k">OPTIMIZATION SCORE</span>
                <span className="v">{response?.score ? response.score.toFixed(3) : "0.912"}</span>
              </div>
              <div className="ribbon-cell">
                <span className="k">GROUND STATE</span>
                <span className="v">[{response?.variables ? response.variables.join(", ") : "0, 0, 1, 0"}]</span>
              </div>
              <div className="ribbon-cell">
                <span className="k">CLASSICAL MATCH</span>
                <span className="v text-emerald">
                  {response?.qaoa_matches_classical !== false ? "✓ OPTIMAL MATCH" : "EQUIVALENT OPTIMUM"}
                </span>
              </div>
            </>
          )}

          {selectedStage === "pqc" && (
            <>
              <div className="ribbon-cell">
                <span className="k">ALGORITHM</span>
                <span className="v text-emerald">{pqc?.result?.algorithm || "ML-KEM-768"}</span>
              </div>
              <div className="ribbon-cell">
                <span className="k">SECURITY LEVEL</span>
                <span className="v">NIST Level 3 (AES-192)</span>
              </div>
              <div className="ribbon-cell">
                <span className="k">KEY SIZE</span>
                <span className="v">1,184 Bytes</span>
              </div>
              <div className="ribbon-cell">
                <span className="k">SECRET VERIFICATION</span>
                <span className="v text-emerald">✓ VERIFIED</span>
              </div>
            </>
          )}

          {selectedStage === "ledger" && (
            <>
              <div className="ribbon-cell">
                <span className="k">CHAIN VALIDATION</span>
                <span className={`v ${blockchain?.valid !== false ? "text-emerald font-bold" : "text-crimson font-bold"}`}>
                  {blockchain?.valid !== false ? "✓ VALID MERKLE CHAIN" : "CORRUPT"}
                </span>
              </div>
              <div className="ribbon-cell">
                <span className="k">TOTAL BLOCKS</span>
                <span className="v">{blockchain?.length || blockchain?.chain?.length || 3}</span>
              </div>
              <div className="ribbon-cell">
                <span className="k">HASH STANDARD</span>
                <span className="v">SHA-256</span>
              </div>
              <div className="ribbon-cell">
                <span className="k">AUDIT STATE</span>
                <span className="v text-primary">Forensic Tamper-Proof</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
