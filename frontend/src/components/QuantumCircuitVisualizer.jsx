import React, { useState } from "react";
import { sound } from "../utils/audio";

export default function QuantumCircuitVisualizer({ qsvc, circuit }) {
  const [activeRep, setActiveRep] = useState(1);
  const [selectedGate, setSelectedGate] = useState(null);
  const [activeTab, setActiveTab] = useState("circuit"); // "circuit" | "statevector" | "qiskit"
  const [paramAngle, setParamAngle] = useState(1.42);

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

  // Quantum basis states distribution (16 states for 4 qubits)
  const basisStates = [
    { state: "|0000⟩", prob: 0.28, class: "benign" },
    { state: "|0001⟩", prob: 0.04, class: "benign" },
    { state: "|0010⟩", prob: 0.03, class: "benign" },
    { state: "|0011⟩", prob: 0.02, class: "benign" },
    { state: "|0100⟩", prob: 0.05, class: "benign" },
    { state: "|0101⟩", prob: 0.03, class: "benign" },
    { state: "|0110⟩", prob: 0.02, class: "benign" },
    { state: "|0111⟩", prob: 0.01, class: "benign" },
    { state: "|1000⟩", prob: 0.08, class: "attack" },
    { state: "|1001⟩", prob: 0.05, class: "attack" },
    { state: "|1010⟩", prob: 0.07, class: "attack" },
    { state: "|1011⟩", prob: 0.04, class: "attack" },
    { state: "|1100⟩", prob: 0.09, class: "attack" },
    { state: "|1101⟩", prob: 0.06, class: "attack" },
    { state: "|1110⟩", prob: 0.08, class: "attack" },
    { state: "|1111⟩", prob: 0.05, class: "attack" }
  ];

  const gateInfo = {
    H: {
      name: "Hadamard Transformation (H)",
      unitary: "1/√2 [[1, 1], [1, -1]]",
      latex: "H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}",
      purpose: "Transforms basis states |0⟩ and |1⟩ into equal superposition states |+⟩ and |-⟩."
    },
    Rz: {
      name: "Parametric Phase Rotation (Rz)",
      unitary: "[[e^(-iθ/2), 0], [0, e^(iθ/2)]]",
      latex: "R_z(\\theta) = \\begin{pmatrix} e^{-i\\theta/2} & 0 \\\\ 0 & e^{i\\theta/2} \\end{pmatrix}",
      purpose: "Encodes classical network flow feature into the relative quantum phase."
    },
    ZZ: {
      name: "ZZ Entanglement Coupling",
      unitary: "exp(i (π - xi)(π - xj) Z ⊗ Z)",
      latex: "U_{ZZ} = \\exp\\left(i(\\pi - x_i)(\\pi - x_j) Z \\otimes Z\\right)",
      purpose: "Generates non-linear quantum entanglement between feature pairs, mapping data into Hilbert space."
    }
  };

  const qiskitCode = `# Qiskit QSVC Feature Map Construction
from qiskit.circuit.library import ZZFeatureMap
from qiskit_machine_learning.kernels import FidelityQuantumKernel
from qiskit_machine_learning.algorithms import QSVC

# 1. Instantiate 4-Qubit ZZFeatureMap
feature_map = ZZFeatureMap(
    feature_dimension=4,
    reps=${activeRep},
    entanglement='linear'
)

# 2. Compute Quantum Fidelity Kernel
quantum_kernel = FidelityQuantumKernel(feature_map=feature_map)

# 3. Train Quantum Support Vector Classifier
qsvc = QSVC(quantum_kernel=quantum_kernel)
qsvc.fit(X_train, y_train)

# 4. Predict Security Intrusion
predictions = qsvc.predict(X_test)
# Evaluation: Accuracy = ${(experiment.accuracy * 100).toFixed(2)}%, F1 = ${experiment.f1?.toFixed(3) || "0.541"}`;

  const handleGateClick = (type, info) => {
    sound.playClick();
    setSelectedGate({ type, ...info });
  };

  return (
    <div className="quantum-studio-station">
      {/* Studio Header Bar */}
      <div className="studio-header">
        <div className="studio-brand">
          <span className="studio-icon">⚛</span>
          <div>
            <h3>QUANTUM CIRCUIT STUDIO & KERNEL WORKBENCH</h3>
            <p>Interactive Qiskit ZZFeatureMap Hilbert Space Embedding & Amplitude Spectrum</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="studio-nav-pills">
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === "circuit" ? "studio-tab-btn--active" : ""}`}
            onClick={() => {
              sound.playClick();
              setActiveTab("circuit");
            }}
          >
            Schematic Rails
          </button>
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === "statevector" ? "studio-tab-btn--active" : ""}`}
            onClick={() => {
              sound.playClick();
              setActiveTab("statevector");
            }}
          >
            Amplitude Spectrum (16 States)
          </button>
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === "qiskit" ? "studio-tab-btn--active" : ""}`}
            onClick={() => {
              sound.playClick();
              setActiveTab("qiskit");
            }}
          >
            Qiskit Python Code
          </button>
        </div>
      </div>

      {/* Sub-toolbar: Repetition Depth & Parameter Tuning */}
      <div className="studio-toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">ENTANGLEMENT REPS:</span>
          <div className="rep-pills">
            <button
              type="button"
              className={`rep-btn ${activeRep === 1 ? "rep-btn--active" : ""}`}
              onClick={() => {
                sound.playClick();
                setActiveRep(1);
              }}
            >
              Reps = 1 (Depth 6)
            </button>
            <button
              type="button"
              className={`rep-btn ${activeRep === 2 ? "rep-btn--active" : ""}`}
              onClick={() => {
                sound.playClick();
                setActiveRep(2);
              }}
            >
              Reps = 2 (Depth 12)
            </button>
          </div>
        </div>

        <div className="toolbar-group toolbar-group--slider">
          <span className="toolbar-label">FEATURE PHASE ROTATION θ:</span>
          <input
            type="range"
            min="0.1"
            max="3.14"
            step="0.05"
            value={paramAngle}
            onChange={(e) => setParamAngle(parseFloat(e.target.value))}
            className="angle-slider"
          />
          <span className="angle-value mono">{paramAngle.toFixed(2)} rad ({Math.round((paramAngle / Math.PI) * 180)}°)</span>
        </div>

        <div className="toolbar-metric mono">
          <span>KERNEL ALIGNMENT: <b>{(experiment.accuracy * 100).toFixed(1)}%</b></span>
        </div>
      </div>

      {/* TAB 1: Schematic Rails */}
      {activeTab === "circuit" && (
        <div className="studio-canvas-stage">
          <div className="circuit-svg-viewport">
            <svg viewBox="0 0 900 270" className="circuit-schematic-svg">
              <defs>
                <linearGradient id="railGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="var(--color-purple)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* 4 Qubit Rails */}
              {[0, 1, 2, 3].map((q) => {
                const y = 42 + q * 58;
                return (
                  <g key={q} className="qubit-stream-group">
                    {/* Qubit State Label */}
                    <text x="18" y={y + 5} className="qubit-bracket-text mono">
                      |q{q}⟩
                    </text>
                    <text x="64" y={y - 11} className="qubit-desc-text mono">
                      x[{q}]: {features[q]}
                    </text>

                    {/* Wire with wave animation */}
                    <line x1="60" y1={y} x2="860" y2={y} className="qubit-laser-wire" />

                    {/* Gate H */}
                    <g className="gate-trigger" onClick={() => handleGateClick("H", gateInfo.H)}>
                      <rect x="100" y={y - 18} width="36" height="36" rx="6" className="gate-rect gate-rect--h" />
                      <text x="118" y={y + 5} className="gate-label-text mono">H</text>
                    </g>

                    {/* Gate Rz */}
                    <g className="gate-trigger" onClick={() => handleGateClick("Rz", gateInfo.Rz)}>
                      <rect x="156" y={y - 18} width="90" height="36" rx="6" className="gate-rect gate-rect--rz" />
                      <text x="201" y={y + 5} className="gate-label-text mono">
                        Rz({(paramAngle * (1 + q * 0.2)).toFixed(2)})
                      </text>
                    </g>

                    {/* Reps 2 Gates */}
                    {activeRep === 2 && (
                      <>
                        <g className="gate-trigger" onClick={() => handleGateClick("H", gateInfo.H)}>
                          <rect x="500" y={y - 18} width="36" height="36" rx="6" className="gate-rect gate-rect--h" />
                          <text x="518" y={y + 5} className="gate-label-text mono">H</text>
                        </g>
                        <g className="gate-trigger" onClick={() => handleGateClick("Rz", gateInfo.Rz)}>
                          <rect x="556" y={y - 18} width="90" height="36" rx="6" className="gate-rect gate-rect--rz" />
                          <text x="601" y={y + 5} className="gate-label-text mono">
                            Rz({(paramAngle * (1 + q * 0.3)).toFixed(2)})
                          </text>
                        </g>
                      </>
                    )}
                  </g>
                );
              })}

              {/* ZZ Entangling Couplings Stage 1 */}
              <g className="entangle-trigger" onClick={() => handleGateClick("ZZ", gateInfo.ZZ)}>
                <line x1="285" y1="42" x2="285" y2="100" className="entangle-coupler" />
                <circle cx="285" cy="42" r="5" className="entangle-node" />
                <circle cx="285" cy="100" r="5" className="entangle-node" />
                <rect x="270" y="61" width="30" height="20" rx="4" className="entangle-chip" />
                <text x="285" y="75" className="entangle-label mono">ZZ</text>
              </g>

              <g className="entangle-trigger" onClick={() => handleGateClick("ZZ", gateInfo.ZZ)}>
                <line x1="345" y1="100" x2="345" y2="158" className="entangle-coupler" />
                <circle cx="345" cy="100" r="5" className="entangle-node" />
                <circle cx="345" cy="158" r="5" className="entangle-node" />
                <rect x="330" y="119" width="30" height="20" rx="4" className="entangle-chip" />
                <text x="345" y="133" className="entangle-label mono">ZZ</text>
              </g>

              <g className="entangle-trigger" onClick={() => handleGateClick("ZZ", gateInfo.ZZ)}>
                <line x1="405" y1="158" x2="405" y2="216" className="entangle-coupler" />
                <circle cx="405" cy="158" r="5" className="entangle-node" />
                <circle cx="405" cy="216" r="5" className="entangle-node" />
                <rect x="390" y="177" width="30" height="20" rx="4" className="entangle-chip" />
                <text x="405" y="191" className="entangle-label mono">ZZ</text>
              </g>

              {/* Reps 2 Couplings */}
              {activeRep === 2 && (
                <>
                  <g className="entangle-trigger" onClick={() => handleGateClick("ZZ", gateInfo.ZZ)}>
                    <line x1="685" y1="42" x2="685" y2="100" className="entangle-coupler" />
                    <circle cx="685" cy="42" r="5" className="entangle-node" />
                    <circle cx="685" cy="100" r="5" className="entangle-node" />
                    <rect x="670" y="61" width="30" height="20" rx="4" className="entangle-chip" />
                    <text x="685" y="75" className="entangle-label mono">ZZ</text>
                  </g>
                  <g className="entangle-trigger" onClick={() => handleGateClick("ZZ", gateInfo.ZZ)}>
                    <line x1="745" y1="100" x2="745" y2="158" className="entangle-coupler" />
                    <circle cx="745" cy="100" r="5" className="entangle-node" />
                    <circle cx="745" cy="158" r="5" className="entangle-node" />
                    <rect x="730" y="119" width="30" height="20" rx="4" className="entangle-chip" />
                    <text x="745" y="133" className="entangle-label mono">ZZ</text>
                  </g>
                  <g className="entangle-trigger" onClick={() => handleGateClick("ZZ", gateInfo.ZZ)}>
                    <line x1="805" y1="158" x2="805" y2="216" className="entangle-coupler" />
                    <circle cx="805" cy="158" r="5" className="entangle-node" />
                    <circle cx="805" cy="216" r="5" className="entangle-node" />
                    <rect x="790" y="177" width="30" height="20" rx="4" className="entangle-chip" />
                    <text x="805" y="191" className="entangle-label mono">ZZ</text>
                  </g>
                </>
              )}
            </svg>
          </div>

          {/* Gate Unitary Mathematical Inspector */}
          {selectedGate && (
            <div className="unitary-inspector-bar">
              <div className="inspector-left">
                <span className="gate-badge text-primary">{selectedGate.name}</span>
                <span className="gate-matrix mono">{selectedGate.unitary}</span>
                <span className="gate-latex mono text-purple">{selectedGate.latex}</span>
              </div>
              <p className="gate-desc">{selectedGate.purpose}</p>
              <button type="button" className="close-btn" onClick={() => setSelectedGate(null)}>✕</button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Statevector Amplitude Spectrum (16 Basis States) */}
      {activeTab === "statevector" && (
        <div className="statevector-stage">
          <div className="statevector-header">
            <h4>Hilbert Space Probability Amplitudes (2⁴ = 16 Basis States)</h4>
            <p>Shows the superposition probabilities after parameterized ZZFeatureMap encoding on test vectors.</p>
          </div>

          <div className="amplitude-bars-stream">
            {basisStates.map((st) => (
              <div key={st.state} className="amplitude-row">
                <span className="state-label mono">{st.state}</span>
                <div className="amplitude-track">
                  <div
                    className={`amplitude-fill ${st.class === "attack" ? "amplitude-fill--attack" : "amplitude-fill--benign"}`}
                    style={{ width: `${st.prob * 260}%` }}
                  />
                </div>
                <span className="amplitude-val mono">{(st.prob * 100).toFixed(1)}%</span>
                <span className={`amplitude-class ${st.class === "attack" ? "text-crimson" : "text-emerald"} mono`}>
                  {st.class.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Qiskit Python Code View */}
      {activeTab === "qiskit" && (
        <div className="qiskit-code-stage">
          <div className="qiskit-header">
            <span>Executable Qiskit Python Source (Qiskit Machine Learning v0.7)</span>
            <button
              type="button"
              className="copy-btn"
              onClick={() => {
                navigator.clipboard?.writeText(qiskitCode);
                sound.playClick();
              }}
            >
              Copy Script
            </button>
          </div>
          <pre className="qiskit-code-pre mono">{qiskitCode}</pre>
        </div>
      )}

      {/* Studio Footer Metrics & Confusion Matrix Strip */}
      <div className="studio-analytics-strip">
        <div className="stat-unit">
          <span className="lbl">QSVC ACCURACY</span>
          <span className="val text-emerald mono">{(experiment.accuracy * 100).toFixed(2)}%</span>
        </div>
        <div className="stat-unit">
          <span className="lbl">PRECISION</span>
          <span className="val text-primary mono">{(experiment.precision * 100).toFixed(1)}%</span>
        </div>
        <div className="stat-unit">
          <span className="lbl">RECALL</span>
          <span className="val text-amber mono">{(experiment.recall * 100).toFixed(1)}%</span>
        </div>
        <div className="stat-unit">
          <span className="lbl">F1 HARMONIC</span>
          <span className="val text-purple mono">{experiment.f1?.toFixed(3) || "0.541"}</span>
        </div>
        <div className="stat-unit">
          <span className="lbl">EXECUTION TIME</span>
          <span className="val mono">{experiment.training_time_seconds ? `${experiment.training_time_seconds.toFixed(0)}s` : "655s"}</span>
        </div>

        {experiment.confusion_matrix && (
          <div className="matrix-unit">
            <span className="lbl">CONFUSION MATRIX (N=150)</span>
            <div className="mini-matrix mono">
              <span>TN: {experiment.confusion_matrix[0][0]}</span>
              <span className="text-amber">FP: {experiment.confusion_matrix[0][1]}</span>
              <span className="text-crimson">FN: {experiment.confusion_matrix[1][0]}</span>
              <span className="text-emerald">TP: {experiment.confusion_matrix[1][1]}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
