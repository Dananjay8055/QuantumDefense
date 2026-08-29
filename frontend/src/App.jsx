import { useEffect, useState } from "react";
import api from "./services/api";
import "./App.css";

const THREATS = {
  LOW: {
    label: "LOW",
    probability: 0.55,
    color: "low",
  },
  MEDIUM: {
    label: "MEDIUM",
    probability: 0.70,
    color: "medium",
  },
  HIGH: {
    label: "HIGH",
    probability: 0.85,
    color: "high",
  },
  CRITICAL: {
    label: "CRITICAL",
    probability: 0.98,
    color: "critical",
  },
};

const RESPONSE_EXPLANATIONS = {
  MONITOR: {
    title: "Monitor suspicious activity",
    description:
      "Continue observing the suspicious flow without applying a disruptive control.",
  },
  RATE_LIMIT: {
    title: "Rate-limit the source",
    description:
      "Restrict the suspicious source's traffic to reduce attack impact while preserving connectivity.",
  },
  BLOCK_SOURCE: {
    title: "Block the source",
    description:
      "Prevent further traffic from the identified suspicious source to contain the threat.",
  },
  ISOLATE_HOST: {
    title: "Isolate the affected host",
    description:
      "Isolate the affected host from the network to contain a critical threat and limit lateral movement.",
  },
};

function App() {
  const [detections, setDetections] = useState([]);
  const [responseHistory, setResponseHistory] = useState([]);
  const [blockchain, setBlockchain] = useState(null);
  const [pqc, setPqc] = useState(null);
  const [tamperTest, setTamperTest] = useState(null);
  const [tamperTesting, setTamperTesting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(null);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH DETECTIONS
  // --------------------------------------------------

  const fetchDetections = async () => {
    try {
      const response = await api.get("/api/detections");

      const events = response.data.detections || [];

      setDetections(events);

      // Rebuild QAOA response history from backend events.
      // This keeps the history available after a browser refresh.
      setResponseHistory(
        events.filter(
          (event) =>
            event.result?.prediction === 1 &&
            event.response
        )
      );

      setError("");

    } catch (err) {
      console.error(err);
      setError("Unable to connect to backend.");
    }
  };

  // --------------------------------------------------
  // FETCH BLOCKCHAIN
  // --------------------------------------------------

  const fetchBlockchain = async () => {
    try {
      const response = await api.get(
        "/api/blockchain"
      );

      setBlockchain(response.data);

    } catch (err) {
      console.error(err);
    }
  };

  // --------------------------------------------------
  // BLOCKCHAIN TAMPER-DETECTION TEST
  // --------------------------------------------------

  const runTamperTest = async () => {
    try {
      setTamperTesting(true);
      setError("");

      const response = await api.post(
        "/api/blockchain/tamper-test"
      );

      setTamperTest(
        response.data?.tamper_detection || null
      );

      await fetchBlockchain();

    } catch (err) {
      console.error(err);
      setError("Blockchain tamper test failed.");
      setTamperTest(null);

    } finally {
      setTamperTesting(false);
    }
  };

  // --------------------------------------------------
  // FETCH PQC STATUS
  // --------------------------------------------------

  const fetchPQC = async () => {
    try {
      const response = await api.get("/api/pqc/status");

      setPqc(response.data);

    } catch (err) {
      console.error(err);
      setPqc(null);
    }
  };

  // --------------------------------------------------
  // INITIAL LOAD + POLLING
  // --------------------------------------------------

  useEffect(() => {

    fetchDetections();
    fetchBlockchain();
    fetchPQC();

    const interval = setInterval(() => {
      fetchDetections();
      fetchBlockchain();
      fetchPQC();
    }, 5000);

    return () => clearInterval(interval);

  }, []);

  // --------------------------------------------------
  // SIMULATE ATTACK
  // --------------------------------------------------

  const simulateAttack = async (severity) => {

    try {

      setSimulating(severity);
      setLoading(true);
      setError("");

      const response = await api.post(
        `/api/demo/attack?severity=${severity}`
      );

      // Refresh data from the backend.
      // fetchDetections() rebuilds response history from
      // the persisted in-memory event bus, preventing duplicates.
      await fetchDetections();
      await fetchBlockchain();

    } catch (err) {

      console.error(err);
      setError(
        "Attack simulation failed."
      );

    } finally {

      setLoading(false);
      setSimulating(null);

    }

  };

  // --------------------------------------------------
  // ATTACK DATA
  // --------------------------------------------------

  const attacks =
    detections.filter(
      (event) =>
        event.result?.prediction === 1
    );

  const latestAttack =
    attacks.length > 0
      ? attacks[attacks.length - 1]
      : null;

  const response =
    latestAttack?.response;

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (

    <div className="dashboard">

      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="header">

        <div>

          <h1>
            Quantum Defense SOC
          </h1>

          <p>
            AI-Powered Cyber Threat Detection &
            Quantum Response Optimization
          </p>

        </div>

        <div className="status">

          <span className="status-dot"></span>

          SYSTEM ONLINE

        </div>

      </header>


      {/* ==========================================
          STATISTICS
      ========================================== */}

      <section className="stats">

        <div className="card">

          <span>
            Total Events
          </span>

          <strong>
            {detections.length}
          </strong>

        </div>


        <div className="card">

          <span>
            Threats Detected
          </span>

          <strong
            className={
              attacks.length > 0
                ? "danger"
                : ""
            }
          >
            {attacks.length}
          </strong>

        </div>


        <div className="card">

          <span>
            Classical IDS
          </span>

          <strong>
            Random Forest
          </strong>

        </div>


        <div className="card quantum-card">

          <span>
            Quantum Optimizer
          </span>

          <strong>
            QAOA
          </strong>

        </div>

      </section>


      {/* ==========================================
          ATTACK SIMULATOR
      ========================================== */}

      <section className="simulator">

        <div className="section-title">

          <div>

            <h2>
              Attack Response Simulator
            </h2>

            <p>
              Simulate different threat severities
              and observe the QAOA-selected response.
            </p>

          </div>

          <span className="live-label">
            LIVE DEMO
          </span>

        </div>


        <div className="threat-buttons">

          {Object.values(THREATS).map(
            (threat) => (

              <button
                key={threat.label}
                className={`threat-button ${threat.color}`}
                onClick={() =>
                  simulateAttack(
                    threat.label
                  )
                }
                disabled={loading}
              >

                <span className="button-title">
                  {threat.label}
                </span>

                <span className="button-probability">
                  {(
                    threat.probability * 100
                  ).toFixed(0)}
                  % threat
                </span>

                {simulating ===
                  threat.label && (

                  <span className="button-loading">
                    Running QAOA...
                  </span>

                )}

              </button>

            )
          )}

        </div>

      </section>

      {/* ==========================================
          POST-QUANTUM SECURITY
      ========================================== */}

      <section className="pqc-panel">

        <div className="section-title">

          <div>

            <h2>
              Post-Quantum Security
            </h2>

            <p>
              Post-quantum key establishment using ML-KEM-768
            </p>

          </div>

          {pqc?.result?.shared_secret_match ? (

            <span className="pqc-status">
              PQC OPERATIONAL
            </span>

          ) : (

            <span className="pqc-status-error">
              PQC UNAVAILABLE
            </span>

          )}

        </div>


        {pqc?.result ? (

          <div className="pqc-grid">

            {/* ALGORITHM */}

            <div className="pqc-card">

              <span>
                Algorithm
              </span>

              <strong>
                {pqc.result.algorithm}
              </strong>

            </div>


            {/* SECURITY LEVEL */}

            <div className="pqc-card">

              <span>
                NIST Security Level
              </span>

              <strong>
                Level {pqc.result.claimed_nist_level}
              </strong>

            </div>


            {/* KEY EXCHANGE */}

            <div className="pqc-card">

              <span>
                Key Exchange
              </span>

              <strong className="pqc-success">
                {pqc.result.shared_secret_match
                  ? "VERIFIED"
                  : "FAILED"}
              </strong>

            </div>


            {/* EXECUTION */}

            <div className="pqc-card">

              <span>
                Execution Time
              </span>

              <strong>
                {pqc.result.execution_time_ms} ms
              </strong>

            </div>

          </div>

        ) : (

          <div className="pqc-loading">
            Loading post-quantum security status...
          </div>

        )}


        {pqc?.result && (

          <div className="pqc-details">

            <div>

              <span>
                Public Key
              </span>

              <strong>
                {pqc.result.public_key_bytes} bytes
              </strong>

            </div>


            <div>

              <span>
                Secret Key
              </span>

              <strong>
                {pqc.result.secret_key_bytes} bytes
              </strong>

            </div>


            <div>

              <span>
                Ciphertext
              </span>

              <strong>
                {pqc.result.ciphertext_bytes} bytes
              </strong>

            </div>


            <div>

              <span>
                Shared Secret
              </span>

              <strong>
                {pqc.result.shared_secret_bytes} bytes
              </strong>

            </div>

          </div>

        )}

      </section>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (

        <div className="error">
          WARNING: {error}
        </div>

      )}


      {/* ==========================================
          ACTIVE THREAT
      ========================================== */}

      {latestAttack ? (

        <section className="attack-panel">

          <div className="attack-header">

            <div>

              <h2>
                THREAT DETECTED
              </h2>

              <p>
                Quantum response optimization completed
              </p>

            </div>

            <span
              className={`badge ${latestAttack.severity?.toLowerCase()}`}
            >
              {latestAttack.severity}
            </span>

          </div>


          {/* FLOW INFORMATION */}

          <div className="attack-grid">

            <div>

              <label>
                Source
              </label>

              <p>
                {latestAttack.flow?.[0]}
              </p>

            </div>


            <div>

              <label>
                Destination
              </label>

              <p>
                {latestAttack.flow?.[1]}
              </p>

            </div>


            <div>

              <label>
                Protocol
              </label>

              <p>
                {latestAttack.flow?.[4]}
              </p>

            </div>


            <div>

              <label>
                Destination Port
              </label>

              <p>
                {latestAttack.flow?.[3]}
              </p>

            </div>

          </div>


          {/* ======================================
              AI + QAOA
          ====================================== */}

          <div className="detection-result">


            {/* AI DETECTION */}

            <div className="result-card">

              <h3>
                AI Threat Detection
              </h3>

              <div className="result-row">

                <span>
                  Prediction
                </span>

                <strong className="danger">
                  ATTACK
                </strong>

              </div>


              <div className="result-row">

                <span>
                  Attack Probability
                </span>

                <strong>
                  {(
                    latestAttack.result
                      ?.probability_attack * 100
                  ).toFixed(1)}
                  %
                </strong>

              </div>


              <div className="result-row">

                <span>
                  Benign Probability
                </span>

                <strong>
                  {(
                    latestAttack.result
                      ?.probability_benign * 100
                  ).toFixed(1)}
                  %
                </strong>

              </div>


              <div className="probability-bar">

                <div
                  style={{
                    width: `${
                      latestAttack.result
                        ?.probability_attack * 100
                    }%`,
                  }}
                ></div>

              </div>

            </div>


            {/* QAOA */}

            <div className="result-card qaoa-card">

              <h3>
                QAOA Response Optimizer
              </h3>

              {response ? (

                <>

                  <div className="result-row">

                    <span>
                      Algorithm
                    </span>

                    <strong>
                      {response.algorithm}
                    </strong>

                  </div>


                  <div className="result-row">

                    <span>
                      Selected Response
                    </span>

                    <strong className="quantum-action">
                      {response.action}
                    </strong>

                  </div>


                  <div className="result-row">

                    <span>
                      Optimization Score
                    </span>

                    <strong>
                      {response.score.toFixed(2)}
                    </strong>

                  </div>


                  <div className="result-row">

                    <span>
                      Quantum State
                    </span>

                    <strong>
                      [
                      {response.variables.join(", ")}
                      ]
                    </strong>

                  </div>


                  <div className="result-row">

                    <span>
                      Classical Optimum
                    </span>

                    <strong>
                      {response.classical_optimal_action}
                    </strong>

                  </div>


                  <div className="match">

                    {response.qaoa_matches_classical
                      ? "QAOA matches classical optimum"
                      : "QAOA differs from classical optimum"}

                  </div>

                </>

              ) : (

                <p>
                  QAOA response unavailable.
                </p>

              )}

            </div>

          </div>


          {/* ======================================
              EVENT PQC VERIFICATION
          ====================================== */}

          {latestAttack.pqc && (

            <div className="event-pqc">

              <div className="event-pqc-header">

                <div>
                  <span className="event-pqc-label">
                    EVENT PQC VERIFICATION
                  </span>

                  <h3>
                    {latestAttack.pqc.algorithm}
                  </h3>
                </div>

                <span
                  className={
                    latestAttack.pqc.shared_secret_match
                      ? "event-pqc-verified"
                      : "event-pqc-failed"
                  }
                >
                  {latestAttack.pqc.shared_secret_match
                    ? "VERIFIED"
                    : "FAILED"}
                </span>

              </div>

              <div className="event-pqc-grid">

                <div>
                  <span>NIST LEVEL</span>
                  <strong>
                    Level {latestAttack.pqc.claimed_nist_level}
                  </strong>
                </div>

                <div>
                  <span>KEY EXCHANGE</span>
                  <strong>
                    {latestAttack.pqc.shared_secret_match
                      ? "SHARED SECRET MATCH"
                      : "MISMATCH"}
                  </strong>
                </div>

                <div>
                  <span>CIPHERTEXT</span>
                  <strong>
                    {latestAttack.pqc.ciphertext_bytes} bytes
                  </strong>
                </div>

                <div>
                  <span>EXECUTION</span>
                  <strong>
                    {latestAttack.pqc.execution_time_ms} ms
                  </strong>
                </div>

              </div>

            </div>

          )}


          {/* ======================================
              RESPONSE BANNER
          ====================================== */}

          {response && (

            <div className="response-banner">

              <div className="response-banner-title">
                <span>
                  RECOMMENDED RESPONSE
                </span>

                <strong>
                  {response.action}
                </strong>
              </div>

              {RESPONSE_EXPLANATIONS[response.action] && (

                <div className="mitigation-explanation">

                  <span className="mitigation-label">
                    MITIGATION
                  </span>

                  <strong>
                    {RESPONSE_EXPLANATIONS[response.action].title}
                  </strong>

                  <p>
                    {RESPONSE_EXPLANATIONS[response.action].description}
                  </p>

                </div>

              )}

              {latestAttack.mitigation && (

                <div className="mitigation-execution">

                  <div className="execution-header">
                    <span>
                      MITIGATION EXECUTION
                    </span>

                    <strong>
                      {latestAttack.mitigation.status}
                    </strong>
                  </div>

                  <p>
                    {latestAttack.mitigation.message}
                  </p>

                  <div className="execution-flow">

                    <div>
                      <span>SOURCE</span>
                      <strong>
                        {latestAttack.mitigation.source}
                      </strong>
                    </div>

                    <div>
                      <span>TARGET</span>
                      <strong>
                        {latestAttack.mitigation.destination}
                      </strong>
                    </div>

                  </div>

                </div>

              )}


            </div>

          )}


          {/* ======================================
              SECURITY RESPONSE PIPELINE
          ====================================== */}

          <div className="security-pipeline">

            <div className="pipeline-title">
              SECURITY RESPONSE PIPELINE
            </div>

            <div className="pipeline-flow">

              <div className="pipeline-step ai-step">
                <span className="pipeline-label">
                  AI DETECTION
                </span>
                <strong>
                  {(
                    (latestAttack.result?.probability_attack || 0) * 100
                  ).toFixed(1)}% ATTACK
                </strong>
              </div>

              <div className="pipeline-arrow">
                &rarr;
              </div>

              <div className="pipeline-step qaoa-step">
                <span className="pipeline-label">
                  QAOA OPTIMIZATION
                </span>
                <strong>
                  {response?.action || "PENDING"}
                </strong>
              </div>

              <div className="pipeline-arrow">
                &rarr;
              </div>

              <div className="pipeline-step pqc-step">
                <span className="pipeline-label">
                  PQC SECURITY
                </span>
                <strong>
                  {latestAttack?.pqc?.shared_secret_match
                    ? `${latestAttack.pqc.algorithm} VERIFIED`
                    : latestAttack?.pqc?.status === "FAILED"
                      ? "PQC VERIFICATION FAILED"
                      : pqc?.result?.shared_secret_match
                        ? `${pqc.result.algorithm} VERIFIED`
                        : "PQC UNAVAILABLE"}
                </strong>
              </div>

              <div className="pipeline-arrow">
                &rarr;
              </div>

              <div className="pipeline-step blockchain-step">
                <span className="pipeline-label">
                  BLOCKCHAIN AUDIT
                </span>
                <strong>
                  {blockchain?.valid
                    ? `BLOCK #${blockchain.length - 1} VALID`
                    : "AUDIT UNAVAILABLE"}
                </strong>
              </div>

            </div>

          </div>

        </section>

      ) : (

        <section className="safe-panel">

          <h2>
            Network Status: No Active Threat
          </h2>

          <p>
            Select a threat severity above to
            demonstrate the quantum response optimizer.
          </p>

        </section>

      )}


      {/* ==========================================
          QAOA RESPONSE HISTORY
      ========================================== */}

      <section className="table-section">

        <div className="section-title">

          <div>

            <h2>
              QAOA Response History
            </h2>

            <p>
              Adaptive mitigation selected according
              to attack severity and probability
            </p>

          </div>

          <span className="live-label">
            QUANTUM OPTIMIZATION
          </span>

        </div>


        {responseHistory.length === 0 ? (

          <div className="empty-history">

            Run an attack simulation above to see
            the QAOA response decision.

          </div>

        ) : (

          <div className="response-history">

            {responseHistory
              .slice()
              .reverse()
              .map(
                (event, index) => {

                  const response =
                    event.response;

                  if (!response) {
                    return null;
                  }

                  return (

                    <div
                      className="history-card"
                      key={index}
                    >

                      <div className="history-severity">

                        <span
                          className={`badge ${
                            event.severity?.toLowerCase()
                          }`}
                        >
                          {event.severity}
                        </span>

                        <strong>
                          {(
                            event.result
                              ?.probability_attack * 100
                          ).toFixed(0)}
                          %
                        </strong>

                      </div>


                      <div className="history-arrow">
                        &rarr;
                      </div>


                      <div className="history-action">

                        <span>
                          QAOA RESPONSE
                        </span>

                        <strong>
                          {response.action}
                        </strong>

                      </div>


                      <div className="history-score">

                        <span>
                          Score
                        </span>

                        <strong>
                          {response.score.toFixed(2)}
                        </strong>

                      </div>


                      <div className="history-match">

                        {response.qaoa_matches_classical
                          ? "Classical match"
                          : "Different solution"}

                      </div>

                    </div>

                  );

                }
              )}

          </div>

        )}

      </section>


      {/* ==========================================
          BLOCKCHAIN SECURITY AUDIT
      ========================================== */}

      <section className="blockchain-panel">

        <div className="section-title">

          <div>

            <h2>
              Blockchain Security Audit
            </h2>

            <p>
              Tamper-evident audit trail of security events
              and quantum response decisions
            </p>

          </div>

          {blockchain && (

            <span
              className={
                blockchain.valid
                  ? "chain-valid"
                  : "chain-invalid"
              }
            >
              {blockchain.valid
                ? "CHAIN VALID"
                : "CHAIN INVALID"}
            </span>

          )}

        </div>


        {blockchain ? (

          <>

            {/* BLOCKCHAIN SUMMARY */}

            <div className="blockchain-stats">

              <div>

                <span>
                  Total Blocks
                </span>

                <strong>
                  {blockchain.length}
                </strong>

              </div>


              <div>

                <span>
                  Chain Status
                </span>

                <strong
                  className={
                    blockchain.valid
                      ? "chain-text-valid"
                      : "chain-text-invalid"
                  }
                >
                  {blockchain.valid
                    ? "VALID"
                    : "INVALID"}
                </strong>

              </div>

            </div>


            {/* ======================================
                BLOCKCHAIN TAMPER-DETECTION TEST
            ====================================== */}

            <div className="blockchain-integrity-test">

              <div className="integrity-test-header">

                <div className="integrity-test-copy">

                  <div className="integrity-test-title-row">
                    <span className="integrity-test-icon">✓</span>

                    <div>
                      <h3>
                        Blockchain Integrity Test
                      </h3>

                      <p>
                        Safely simulate block tampering and verify that
                        the hash chain detects the modification.
                      </p>
                    </div>
                  </div>

                </div>

                <button
                  className="tamper-test-button"
                  onClick={runTamperTest}
                  disabled={tamperTesting || blockchain.length < 2}
                >
                  {tamperTesting
                    ? "RUNNING TEST..."
                    : "RUN TAMPER TEST"}
                </button>

              </div>


              {tamperTest && (

                <div className="blockchain-test-results">

                  <div
                    className={`blockchain-test-result ${
                      tamperTest.original_chain_valid
                        ? "test-valid"
                        : "test-invalid"
                    }`}
                  >
                    <span>ORIGINAL CHAIN</span>

                    <strong>
                      {tamperTest.original_chain_valid
                        ? "✓ VALID"
                        : "✕ INVALID"}
                    </strong>

                    <small>
                      Initial integrity state
                    </small>
                  </div>


                  <div
                    className={`blockchain-test-result ${
                      !tamperTest.after_tampering
                        ? "test-valid"
                        : "test-invalid"
                    }`}
                  >
                    <span>TAMPER SIMULATION</span>

                    <strong>
                      {tamperTest.after_tampering
                        ? "✕ NOT DETECTED"
                        : "✓ DETECTED"}
                    </strong>

                    <small>
                      Hash modification check
                    </small>
                  </div>


                  <div
                    className={`blockchain-test-result ${
                      tamperTest.tampering_detected
                        ? "test-valid"
                        : "test-invalid"
                    }`}
                  >
                    <span>DETECTION RESULT</span>

                    <strong>
                      {tamperTest.tampering_detected
                        ? "✓ TAMPERING DETECTED"
                        : "✕ FAILED"}
                    </strong>

                    <small>
                      Integrity protection verified
                    </small>
                  </div>


                  <div
                    className={`blockchain-test-result ${
                      tamperTest.after_restoration
                        ? "test-valid"
                        : "test-invalid"
                    }`}
                  >
                    <span>RESTORED CHAIN</span>

                    <strong>
                      {tamperTest.after_restoration
                        ? "✓ VALID"
                        : "✕ INVALID"}
                    </strong>

                    <small>
                      Original chain restored
                    </small>
                  </div>

                </div>

              )}

            </div>


            {/* BLOCK LIST */}

            <div className="block-list">

              {blockchain.chain
                ?.slice()
                .reverse()
                .map(
                  (block) => {

                    const event =
                      typeof block.event ===
                      "object"
                        ? block.event
                        : null;

                    return (

                      <div
                        className="block-card"
                        key={block.index}
                      >

                        <div className="block-number">

                          <span>
                            BLOCK
                          </span>

                          <strong>
                            #{block.index}
                          </strong>

                        </div>


                        <div className="block-content">

                          {event ? (

                            <>

                              <div className="block-row">

                                <span>
                                  Severity
                                </span>

                                <strong>
                                  {event.severity ||
                                    "-"}
                                </strong>

                              </div>


                              <div className="block-row">

                                <span>
                                  QAOA Response
                                </span>

                                <strong className="quantum-action">
                                  {event.qaoa_action ||
                                    "-"}
                                </strong>

                              </div>


                              <div className="block-row">

                                <span>
                                  Algorithm
                                </span>

                                <strong>
                                  {event.algorithm ||
                                    "-"}
                                </strong>

                              </div>

                            </>

                          ) : (

                            <div className="block-row">

                              <span>
                                Event
                              </span>

                              <strong>
                                GENESIS
                              </strong>

                            </div>

                          )}

                        </div>


                        <div className="block-hashes">

                          <div>

                            <span>
                              Previous Hash
                            </span>

                            <code>
                              {block.previous_hash}
                            </code>

                          </div>


                          <div>

                            <span>
                              Current Hash
                            </span>

                            <code>
                              {block.hash}
                            </code>

                          </div>

                        </div>


                        <div className="block-status">
                          VALID
                        </div>

                      </div>

                    );

                  }
                )}

            </div>

          </>

        ) : (

          <div className="empty-history">

            Loading blockchain audit...

          </div>

        )}

      </section>


      {/* ==========================================
          RECENT NETWORK ACTIVITY
      ========================================== */}

      <section className="table-section">

        <div className="section-title">

          <div>

            <h2>
              Recent Network Activity
            </h2>

            <p>
              Latest detected network flows
            </p>

          </div>

        </div>


        <table>

          <thead>

            <tr>

              <th>
                Source
              </th>

              <th>
                Destination
              </th>

              <th>
                Protocol
              </th>

              <th>
                Probability
              </th>

              <th>
                Severity
              </th>

              <th>
                Response
              </th>

            </tr>

          </thead>


          <tbody>

            {detections
              .slice()
              .reverse()
              .slice(0, 10)
              .map(
                (event, index) => {

                  const attack =
                    event.result
                      ?.prediction === 1;

                  return (

                    <tr key={index}>

                      <td>
                        {event.flow?.[0]}
                      </td>

                      <td>
                        {event.flow?.[1]}
                      </td>

                      <td>
                        {event.flow?.[4]}
                      </td>

                      <td>
                        {(
                          (event.result
                            ?.probability_attack ||
                            0) * 100
                        ).toFixed(1)}
                        %
                      </td>

                      <td>

                        {event.severity ? (

                          <span
                            className={`badge ${
                              event.severity.toLowerCase()
                            }`}
                          >
                            {event.severity}
                          </span>

                        ) : (

                          "-"

                        )}

                      </td>

                      <td>

                        {attack ? (

                          <span className="response-text">

                            {event.response
                              ?.action ||
                              "PENDING"}

                          </span>

                        ) : (

                          <span className="badge benign">

                            BENIGN

                          </span>

                        )}

                      </td>

                    </tr>

                  );

                }
              )}

          </tbody>

        </table>

      </section>

    </div>

  );
}

export default App;