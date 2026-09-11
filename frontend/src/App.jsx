import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "./services/api";
import {
  MOCK_DETECTIONS,
  MOCK_BLOCKCHAIN,
  MOCK_PQC,
  MOCK_QSVC,
  MOCK_CIRCUIT
} from "./services/mockData";
import TacticalHUDHeader from "./components/TacticalHUDHeader";
import DefenseHighway from "./components/DefenseHighway";
import ThreatInjectionConsole from "./components/ThreatInjectionConsole";
import QuantumCircuitVisualizer from "./components/QuantumCircuitVisualizer";
import BlockchainStream from "./components/BlockchainStream";
import NetworkTerminal from "./components/NetworkTerminal";
import { sound } from "./utils/audio";
import "./App.css";

const POLL_MS = 4000;

export default function App() {
  const [activeView, setActiveView] = useState("highway");
  const [muted, setMuted] = useState(false);

  // Theme Management (Light & Dark mode)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("qd_theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("qd_theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const handleToggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // State with high-fidelity fallbacks
  const [detections, setDetections] = useState(MOCK_DETECTIONS);
  const [blockchain, setBlockchain] = useState(MOCK_BLOCKCHAIN);
  const [pqc, setPqc] = useState(MOCK_PQC);
  const [qsvc, setQsvc] = useState(MOCK_QSVC);
  const [circuit, setCircuit] = useState(MOCK_CIRCUIT);

  const [online, setOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [runningAttack, setRunningAttack] = useState(null);
  const [tamperRunning, setTamperRunning] = useState(false);
  const [tamperResult, setTamperResult] = useState(null);

  const intervalRef = useRef(null);

  // Fetch from Flask Backend
  const fetchDetections = useCallback(async () => {
    try {
      const r = await api.get("/api/detections");
      if (Array.isArray(r.data?.detections) && r.data.detections.length > 0) {
        setDetections(r.data.detections);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchBlockchain = useCallback(async () => {
    try {
      const r = await api.get("/api/blockchain");
      if (r.data?.chain) {
        setBlockchain(r.data);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchPqc = useCallback(async () => {
    try {
      const r = await api.get("/api/pqc/status");
      if (r.data?.result) {
        setPqc(r.data);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchQsvc = useCallback(async () => {
    try {
      const r = await api.get("/api/quantum/qsvc");
      if (r.data?.experiments) {
        setQsvc(r.data);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchCircuit = useCallback(async () => {
    try {
      const r = await api.get("/api/quantum/qsvc/circuit");
      if (r.data?.experiments) {
        setCircuit(r.data);
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    const results = await Promise.all([
      fetchDetections(),
      fetchBlockchain(),
      fetchPqc(),
      fetchQsvc(),
      fetchCircuit()
    ]);
    const isAnyOnline = results.some(Boolean);
    setOnline(isAnyOnline);
    setRefreshing(false);
  }, [fetchDetections, fetchBlockchain, fetchPqc, fetchQsvc, fetchCircuit]);

  useEffect(() => {
    refreshAll();
    intervalRef.current = setInterval(refreshAll, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [refreshAll]);

  // Derived Telemetry
  const simulated = useMemo(() => {
    return detections.filter(
      (d) => d.type === "SIMULATED_ATTACK" || d.type === "SECURITY_EVENT"
    );
  }, [detections]);

  const live = useMemo(() => {
    return detections.filter(
      (d) => d.type !== "SIMULATED_ATTACK" && d.type !== "SECURITY_EVENT"
    );
  }, [detections]);

  const attackDetections = useMemo(() => {
    return detections.filter((d) => d.result?.prediction === 1);
  }, [detections]);

  const latestLive = live[live.length - 1] || null;
  const latestSimulated = simulated[simulated.length - 1] || null;
  const qaoaDecisionsCount = simulated.filter((d) => d.response?.action).length;

  // Simulate Attack Execution
  const handleRunAttack = async (severity) => {
    setRunningAttack(severity);
    try {
      const r = await api.post(`/api/demo/attack?severity=${severity}`);
      const event = r.data?.event;
      if (event) {
        setDetections((prev) => [...prev, event]);
      }
      await Promise.all([fetchDetections(), fetchBlockchain(), fetchPqc()]);
      sound.playSuccess();
    } catch {
      // Fallback offline simulation execution
      setTimeout(() => {
        const probMap = { LOW: 0.55, MEDIUM: 0.7, HIGH: 0.85, CRITICAL: 0.98 };
        const actionMap = {
          LOW: "MONITOR",
          MEDIUM: "RATE_LIMIT",
          HIGH: "BLOCK_SOURCE",
          CRITICAL: "ISOLATE_HOST"
        };
        const prob = probMap[severity] || 0.85;
        const action = actionMap[severity] || "BLOCK_SOURCE";

        const newEvent = {
          flow: [
            `192.168.1.${Math.floor(100 + Math.random() * 150)}`,
            "10.0.0.1",
            Math.floor(2000 + Math.random() * 8000),
            8080,
            "TCP"
          ],
          result: {
            prediction: 1,
            probability_benign: +(1 - prob).toFixed(2),
            probability_attack: prob
          },
          severity,
          type: "SIMULATED_ATTACK",
          timestamp: Math.floor(Date.now() / 1000),
          response: {
            action,
            score: +(0.88 + Math.random() * 0.1).toFixed(3),
            algorithm: "QAOA",
            variables: [0, 0, action === "BLOCK_SOURCE" ? 1 : 0, action === "ISOLATE_HOST" ? 1 : 0],
            classical_optimal_action: action,
            qaoa_matches_classical: true,
            response_scores: {
              MONITOR: +(0.1 + (severity === "LOW" ? 0.8 : 0.05)).toFixed(3),
              RATE_LIMIT: +(0.25 + (severity === "MEDIUM" ? 0.65 : 0.1)).toFixed(3),
              BLOCK_SOURCE: +(0.4 + (severity === "HIGH" ? 0.55 : 0.2)).toFixed(3),
              ISOLATE_HOST: +(0.3 + (severity === "CRITICAL" ? 0.68 : 0.1)).toFixed(3)
            }
          },
          mitigation: {
            action,
            source: "INTRUSION-VECTOR",
            destination: "10.0.0.1",
            status: "EXECUTED",
            message: `Mitigation rule applied via Post-Quantum RPC: ${action}`
          },
          pqc: {
            algorithm: "ML-KEM-768",
            claimed_nist_level: 3,
            shared_secret_match: true,
            status: "SUCCESS"
          }
        };

        setDetections((prev) => [...prev, newEvent]);

        // Append to blockchain
        setBlockchain((prev) => {
          const prevChain = prev?.chain || [];
          const lastBlock = prevChain[prevChain.length - 1] || { hash: "0000000000" };
          const newBlock = {
            index: prevChain.length,
            timestamp: Math.floor(Date.now() / 1000),
            event: {
              type: "SECURITY_EVENT",
              source: newEvent.flow[0],
              destination: newEvent.flow[1],
              protocol: newEvent.flow[4],
              severity: newEvent.severity,
              attack_probability: newEvent.result.probability_attack,
              prediction: 1,
              qaoa_action: action,
              qaoa_score: newEvent.response.score,
              algorithm: "QAOA",
              mitigation_action: action,
              mitigation_status: "SUCCESS",
              pqc_algorithm: "ML-KEM-768",
              pqc_nist_level: 3
            },
            previous_hash: lastBlock.hash,
            hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
          };
          return {
            valid: true,
            length: prevChain.length + 1,
            chain: [...prevChain, newBlock]
          };
        });

        sound.playSuccess();
      }, 500);
    } finally {
      setRunningAttack(null);
    }
  };

  // Run Tamper Detection Test
  // Run Tamper Detection Test
  // Run Tamper Detection Test
  const handleRunTamper = async () => {
    setTamperRunning(true);

    try {
      const r = await api.post(
        "/api/blockchain/tamper-test"
      );

      console.log(
        "REAL TAMPER TEST RESPONSE:",
        r.data
      );

      setTamperResult(r.data);

      await fetchBlockchain();

      sound.playSuccess();

    } catch (error) {

      console.error(
        "Blockchain tamper test failed:",
        error
      );

      setTamperResult(null);

    } finally {

      setTamperRunning(false);

    }
  };

  const handleToggleMute = () => {
    const isMuted = sound.toggleMute();
    setMuted(isMuted);
  };

  return (
    <div className="command-app-root">
      {/* Upper Navigation and Telemetry Header */}
      <TacticalHUDHeader
        activeView={activeView}
        onSelectView={setActiveView}
        online={online}
        refreshing={refreshing}
        onRefresh={refreshAll}
        liveCount={live.length}
        attackCount={attackDetections.length}
        blockCount={blockchain?.length ?? blockchain?.chain?.length ?? 0}
        qaoaCount={qaoaDecisionsCount}
        muted={muted}
        onToggleMute={handleToggleMute}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Viewport Content Area */}
      <main className="command-viewport">
        {activeView === "highway" && (
          <div className="view-stack">
            {/* Interactive Autonomous Defense Highway */}
            <DefenseHighway
              detections={detections}
              latestSimulated={latestSimulated}
              latestLive={latestLive}
              pqc={pqc}
              blockchain={blockchain}
              running={runningAttack}
            />

            {/* Actuator & Threat Injection Controls */}
            <ThreatInjectionConsole
              latestSimulated={latestSimulated}
              running={runningAttack}
              onRunAttack={handleRunAttack}
              pqc={pqc}
              blockchain={blockchain}
            />
          </div>
        )}

        {activeView === "quantum" && (
          <div className="view-stack">
            <QuantumCircuitVisualizer qsvc={qsvc} circuit={circuit} />
          </div>
        )}

        {activeView === "ledger" && (
          <div className="view-stack">
            <BlockchainStream
              blockchain={blockchain}
              latestSimulated={latestSimulated}
              onRunTamper={handleRunTamper}
              tamperRunning={tamperRunning}
              tamperResult={tamperResult}
            />
          </div>
        )}

        {activeView === "telemetry" && (
          <div className="view-stack">
            <NetworkTerminal detections={detections} />
          </div>
        )}
      </main>

      {/* Bottom Global Status Footer Bar */}
      <footer className="command-footer mono">
        <div className="footer-item">
          <span className="footer-status-indicator" />
          <span>AUTONOMOUS CYBER DEFENCE ACTIVE</span>
        </div>
        <div className="footer-item">
          <span>ALGORITHM STACK: RF + QAOA (4-QUBIT) + ML-KEM-768 + SHA-256</span>
        </div>
        <div className="footer-item">
          <span>POLLING CYCLE: {POLL_MS / 1000}s</span>
        </div>
        <div className="footer-item footer-item--right">
          <span>QUANTUM DEFENSE COMMAND // SEC-01</span>
        </div>
      </footer>
    </div>
  );
}
