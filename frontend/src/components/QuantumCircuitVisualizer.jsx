import React, { useState } from "react";
import { sound } from "../utils/audio";

export default function QuantumCircuitVisualizer({ qsvc, circuit }) {
  const [activeRep, setActiveRep] = useState(1);
  const [selectedGate, setSelectedGate] = useState(null);

  const experiment = qsvc?.experiments?.find((e) => e.reps === activeRep) || qsvc?.experiments?.[0] || {
    accuracy: 0.8867,
    precision: 0.9,
    recall: 0.36,
    f1: 0.514,
    confusion_matrix: [
      [124, 1],
      [16, 9]
    ],
    training_time_seconds: 655.03,
    prediction_time_seconds: 438.21
  };

  const features = qsvc?.features || [
    "Average Packet Size",
    "Packet Length Variance",
    "Subflow Bwd Bytes",
    "Total Length of Fwd Packets"
  ];

  const gateInfo = {
    H: {
      name: "HADAMARD GATE (H)",
      unitary: "1/√2 [[1, 1], [1, -1]]",
      purpose: "Transforms computational basis states |0⟩ and |1⟩ into equal superposition states |+⟩ and |-⟩."
    },
    Rz: {
      name: "PARAMETRIC PHASE ROTATION (Rz)",
      unitary: "[[e^(-iθ/2), 0], [0, e^(iθ/2)]]",
      purpose: "Encodes continuous classical network flow feature xi into the quantum relative phase."
    },
    ZZ: {
      name: "ZZ ENTANGLEMENT MAP (CNOT - Rz - CNOT)",
      unitary: "exp(i (π - xi)(π - xj) Z ⊗ Z)",
      purpose: "Generates non-linear quantum entanglement between pairs of network flow features, mapping data into Hilbert space."
    }
  };

  const handleGateClick = (type, info) => {
    sound.playClick();
    setSelectedGate({ type, ...info });
  };

  return (
    <div className="quantum-workbench">
      {/* Workbench Header */}
      <div className="hud-panel-title">
        <div className="title-left">
          <span className="title-icon">⚛</span>
          <h3>QUANTUM SUPPORT VECTOR CLASSIFIER (QSVC) & CIRCUIT ENGINE</h3>
        </div>
        <div className="rep-toggles">
          <span className="rep-label">FEATURE MAP DEPTH:</span>
          <button
            type="button"
            className={`rep-btn ${activeRep === 1 ? "rep-btn--active" : ""}`}
            onClick={() => {
              sound.playClick();
              setActiveRep(1);
            }}
          >
            ZZFeatureMap (Reps=1)
          </button>
          <button
            type="button"
            className={`rep-btn ${activeRep === 2 ? "rep-btn--active" : ""}`}
            onClick={() => {
              sound.playClick();
              setActiveRep(2);
            }}
          >
            ZZFeatureMap (Reps=2)
          </button>
        </div>
      </div>

      {/* Interactive Vector SVG Quantum Circuit Schematic */}
      <div className="circuit-canvas-frame">
        <div className="circuit-frame-header">
          <span className="frame-tag">SCHEMATIC: 4-QUBIT HILBERT SPACE EMBEDDING</span>
          <span className="frame-meta mono">
            DEPTH: {activeRep === 1 ? "6 GATES" : "12 GATES"} │ KERNEL: FidelityQuantumKernel │ SIMULATOR: Statevector
          </span>
        </div>

        <div className="circuit-svg-wrap">
          <svg viewBox="0 0 920 280" className="quantum-circuit-svg">
            <defs>
              <linearGradient id="qubitLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#8a2be2" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glowGate" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* 4 Qubit Rails */}
            {[0, 1, 2, 3].map((q) => {
              const y = 45 + q * 60;
              return (
                <g key={q} className="qubit-rail">
                  {/* Rail Label */}
                  <text x="25" y={y + 5} className="qubit-label mono">
                    |q{q}⟩
                  </text>
                  <text x="62" y={y - 12} className="qubit-feature-name mono">
                    x[{q}]: {features[q]}
                  </text>

                  {/* Qubit wire line */}
                  <line x1="60" y1={y} x2="880" y2={y} stroke="url(#qubitLineGrad)" strokeWidth="2" />

                  {/* Hadamard Gate H */}
                  <g
                    className="gate-element gate-element--h"
                    onClick={() => handleGateClick("H", gateInfo.H)}
                    cursor="pointer"
                  >
                    <rect x="100" y={y - 18} width="36" height="36" rx="5" className="gate-box gate-box--h" />
                    <text x="118" y={y + 5} className="gate-text mono">
                      H
                    </text>
                  </g>

                  {/* Parametric Rotation Gate Rz */}
                  <g
                    className="gate-element gate-element--rz"
                    onClick={() => handleGateClick("Rz", gateInfo.Rz)}
                    cursor="pointer"
                  >
                    <rect x="160" y={y - 18} width="76" height="36" rx="5" className="gate-box gate-box--rz" />
                    <text x="198" y={y + 5} className="gate-text mono">
                      Rz(x[{q}])
                    </text>
                  </g>

                  {/* Rep 2 repetition gates if active */}
                  {activeRep === 2 && (
                    <>
                      <g
                        className="gate-element gate-element--h"
                        onClick={() => handleGateClick("H", gateInfo.H)}
                        cursor="pointer"
                      >
                        <rect x="520" y={y - 18} width="36" height="36" rx="5" className="gate-box gate-box--h" />
                        <text x="538" y={y + 5} className="gate-text mono">
                          H
                        </text>
                      </g>
                      <g
                        className="gate-element gate-element--rz"
                        onClick={() => handleGateClick("Rz", gateInfo.Rz)}
                        cursor="pointer"
                      >
                        <rect x="580" y={y - 18} width="76" height="36" rx="5" className="gate-box gate-box--rz" />
                        <text x="618" y={y + 5} className="gate-text mono">
                          Rz(x[{q}])
                        </text>
                      </g>
                    </>
                  )}
                </g>
              );
            })}

            {/* ZZ Entanglement Couplings Stage 1 */}
            {/* q0 - q1 */}
            <g
              className="entanglement-link"
              onClick={() => handleGateClick("ZZ", gateInfo.ZZ)}
              cursor="pointer"
            >
              <line x1="280" y1="45" x2="280" y2="105" stroke="#8a2be2" strokeWidth="2.5" strokeDasharray="3 3" />
              <circle cx="280" cy="45" r="5" fill="#00f0ff" />
              <circle cx="280" cy="105" r="5" fill="#00f0ff" />
              <rect x="264" y="65" width="32" height="20" rx="3" fill="#1b0a3a" stroke="#8a2be2" strokeWidth="1" />
              <text x="280" y="79" className="zz-text mono">
                ZZ
              </text>
            </g>

            {/* q1 - q2 */}
            <g
              className="entanglement-link"
              onClick={() => handleGateClick("ZZ", gateInfo.ZZ)}
              cursor="pointer"
            >
              <line x1="340" y1="105" x2="340" y2="165" stroke="#8a2be2" strokeWidth="2.5" strokeDasharray="3 3" />
              <circle cx="340" cy="105" r="5" fill="#00f0ff" />
              <circle cx="340" cy="165" r="5" fill="#00f0ff" />
              <rect x="324" y="125" width="32" height="20" rx="3" fill="#1b0a3a" stroke="#8a2be2" strokeWidth="1" />
              <text x="340" y="139" className="zz-text mono">
                ZZ
              </text>
            </g>

            {/* q2 - q3 */}
            <g
              className="entanglement-link"
              onClick={() => handleGateClick("ZZ", gateInfo.ZZ)}
              cursor="pointer"
            >
              <line x1="400" y1="165" x2="400" y2="225" stroke="#8a2be2" strokeWidth="2.5" strokeDasharray="3 3" />
              <circle cx="400" cy="165" r="5" fill="#00f0ff" />
              <circle cx="400" cy="225" r="5" fill="#00f0ff" />
              <rect x="384" y="185" width="32" height="20" rx="3" fill="#1b0a3a" stroke="#8a2be2" strokeWidth="1" />
              <text x="400" y="199" className="zz-text mono">
                ZZ
              </text>
            </g>

            {/* Rep 2 Entanglement Couplings */}
            {activeRep === 2 && (
              <>
                <g
                  className="entanglement-link"
                  onClick={() => handleGateClick("ZZ", gateInfo.ZZ)}
                  cursor="pointer"
                >
                  <line x1="700" y1="45" x2="700" y2="105" stroke="#8a2be2" strokeWidth="2.5" strokeDasharray="3 3" />
                  <circle cx="700" cy="45" r="5" fill="#00f0ff" />
                  <circle cx="700" cy="105" r="5" fill="#00f0ff" />
                  <rect x="684" y="65" width="32" height="20" rx="3" fill="#1b0a3a" stroke="#8a2be2" strokeWidth="1" />
                  <text x="700" y="79" className="zz-text mono">
                    ZZ
                  </text>
                </g>
                <g
                  className="entanglement-link"
                  onClick={() => handleGateClick("ZZ", gateInfo.ZZ)}
                  cursor="pointer"
                >
                  <line x1="760" y1="105" x2="760" y2="165" stroke="#8a2be2" strokeWidth="2.5" strokeDasharray="3 3" />
                  <circle cx="760" cy="105" r="5" fill="#00f0ff" />
                  <circle cx="760" cy="165" r="5" fill="#00f0ff" />
                  <rect x="744" y="125" width="32" height="20" rx="3" fill="#1b0a3a" stroke="#8a2be2" strokeWidth="1" />
                  <text x="760" y="139" className="zz-text mono">
                    ZZ
                  </text>
                </g>
                <g
                  className="entanglement-link"
                  onClick={() => handleGateClick("ZZ", gateInfo.ZZ)}
                  cursor="pointer"
                >
                  <line x1="820" y1="165" x2="820" y2="225" stroke="#8a2be2" strokeWidth="2.5" strokeDasharray="3 3" />
                  <circle cx="820" cy="165" r="5" fill="#00f0ff" />
                  <circle cx="820" cy="225" r="5" fill="#00f0ff" />
                  <rect x="804" y="185" width="32" height="20" rx="3" fill="#1b0a3a" stroke="#8a2be2" strokeWidth="1" />
                  <text x="820" y="199" className="zz-text mono">
                    ZZ
                  </text>
                </g>
              </>
            )}
          </svg>
        </div>

        {/* Gate Inspection Drawer */}
        {selectedGate && (
          <div className="gate-inspector-drawer">
            <div className="inspector-head">
              <span className="gate-name text-cyan">{selectedGate.name}</span>
              <span className="gate-unitary mono text-purple">{selectedGate.unitary}</span>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setSelectedGate(null)}
              >
                ✕
              </button>
            </div>
            <p className="gate-purpose">{selectedGate.purpose}</p>
          </div>
        )}
      </div>

      {/* Metrics & Confusion Matrix Deck */}
      <div className="quantum-analytics-deck">
        <div className="metrics-conduit">
          <div className="metric-cell">
            <span className="m-label">QSVC ACCURACY</span>
            <span className="m-val text-emerald">{(experiment.accuracy * 100).toFixed(2)}%</span>
            <span className="m-sub">Quantum Kernel Alignment</span>
          </div>
          <div className="metric-cell">
            <span className="m-label">PRECISION</span>
            <span className="m-val text-cyan">{(experiment.precision * 100).toFixed(1)}%</span>
            <span className="m-sub">Attack Verification Rate</span>
          </div>
          <div className="metric-cell">
            <span className="m-label">RECALL</span>
            <span className="m-val text-amber">{(experiment.recall * 100).toFixed(1)}%</span>
            <span className="m-sub">Threat Discovery Ratio</span>
          </div>
          <div className="metric-cell">
            <span className="m-label">F1 SCORE</span>
            <span className="m-val text-purple">{experiment.f1?.toFixed(3) || "0.541"}</span>
            <span className="m-sub">Harmonic Mean</span>
          </div>
          <div className="metric-cell">
            <span className="m-label">CIRCUIT RUNTIME</span>
            <span className="m-val mono">{experiment.training_time_seconds ? `${experiment.training_time_seconds.toFixed(1)}s` : "655s"}</span>
            <span className="m-sub">Statevector Simulation</span>
          </div>
        </div>

        {/* Interactive Confusion Matrix Heatmap */}
        {experiment.confusion_matrix && (
          <div className="confusion-matrix-station">
            <div className="matrix-subhead">CONFUSION MATRIX (TEST SAMPLE N=150)</div>
            <div className="heatmap-grid">
              <div className="heatmap-corner" />
              <div className="heatmap-header mono">PRED: BENIGN (0)</div>
              <div className="heatmap-header mono">PRED: ATTACK (1)</div>

              <div className="heatmap-side mono">ACTUAL: BENIGN (0)</div>
              <div className="heatmap-cell heatmap-cell--tn">
                <span className="count">{experiment.confusion_matrix[0][0]}</span>
                <span className="type">TRUE BENIGN (TN)</span>
              </div>
              <div className="heatmap-cell heatmap-cell--fp">
                <span className="count">{experiment.confusion_matrix[0][1]}</span>
                <span className="type">FALSE ALARM (FP)</span>
              </div>

              <div className="heatmap-side mono">ACTUAL: ATTACK (1)</div>
              <div className="heatmap-cell heatmap-cell--fn">
                <span className="count">{experiment.confusion_matrix[1][0]}</span>
                <span className="type">MISSED THREAT (FN)</span>
              </div>
              <div className="heatmap-cell heatmap-cell--tp">
                <span className="count">{experiment.confusion_matrix[1][1]}</span>
                <span className="type">INTERCEPTED (TP)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
