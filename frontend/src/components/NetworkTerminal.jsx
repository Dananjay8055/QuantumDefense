import React, { useState, useMemo } from "react";
import { sound } from "../utils/audio";

export default function NetworkTerminal({ detections }) {
  const [filterQuery, setFilterQuery] = useState("");
  const [protocolFilter, setProtocolFilter] = useState("ALL");
  const [threatsOnly, setThreatsOnly] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);

  // Filter flows
  const filtered = useMemo(() => {
    return detections.filter((d) => {
      const src = d.flow?.[0] || "";
      const dst = d.flow?.[1] || "";
      const proto = d.flow?.[4] || "TCP";
      const isAtt = d.result?.prediction === 1;

      if (threatsOnly && !isAtt) return false;
      if (protocolFilter !== "ALL" && proto.toUpperCase() !== protocolFilter) return false;

      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase();
        const match =
          src.toLowerCase().includes(q) ||
          dst.toLowerCase().includes(q) ||
          proto.toLowerCase().includes(q) ||
          (d.severity || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [detections, filterQuery, protocolFilter, threatsOnly]);

  // Protocol stats
  const protoStats = useMemo(() => {
    const counts = {};
    detections.forEach((d) => {
      const p = d.flow?.[4] || "TCP";
      counts[p] = (counts[p] || 0) + 1;
    });
    const total = detections.length || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: (count / total) * 100
    }));
  }, [detections]);

  const handleSelectFlow = (flow) => {
    sound.playClick();
    setSelectedFlow(flow);
  };

  return (
    <div className="network-terminal-station">
      {/* Terminal Title Bar */}
      <div className="hud-panel-title">
        <div className="title-left">
          <span className="title-icon">⌨</span>
          <h3>DEEP PACKET TELEMETRY & LIVE CAPTURE STREAM</h3>
        </div>
        <span className="stream-badge mono">
          BUFFER: {filtered.length} / {detections.length} PACKET FLOWS
        </span>
      </div>

      {/* Protocol Distribution Ribbon */}
      <div className="protocol-spectrum-bar">
        <div className="spectrum-label mono">PROTOCOL DENSITY:</div>
        <div className="spectrum-track-multi">
          {protoStats.map((st, i) => {
            const colors = ["#00f0ff", "#8a2be2", "#00ff88", "#ffaa00", "#ff3366"];
            const color = colors[i % colors.length];
            return (
              <div
                key={st.name}
                className="spectrum-seg"
                style={{ width: `${st.pct}%`, backgroundColor: color }}
                title={`${st.name}: ${st.count} (${st.pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>
        <div className="spectrum-legend mono">
          {protoStats.map((st, i) => {
            const colors = ["#00f0ff", "#8a2be2", "#00ff88", "#ffaa00", "#ff3366"];
            return (
              <span key={st.name} style={{ color: colors[i % colors.length] }}>
                ■ {st.name} ({st.pct.toFixed(0)}%)
              </span>
            );
          })}
        </div>
      </div>

      {/* Filter Controls Ribbon */}
      <div className="terminal-filter-ribbon">
        <div className="search-input-box">
          <span className="search-prefix mono">&gt; FILTER:</span>
          <input
            type="text"
            className="terminal-input mono"
            placeholder="Search IP, destination, protocol or severity…"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          {filterQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setFilterQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-buttons-group">
          {["ALL", "TCP", "UDP", "SSH", "TLS"].map((proto) => (
            <button
              key={proto}
              type="button"
              className={`filter-btn ${protocolFilter === proto ? "filter-btn--active" : ""}`}
              onClick={() => {
                sound.playClick();
                setProtocolFilter(proto);
              }}
            >
              {proto}
            </button>
          ))}

          <button
            type="button"
            className={`filter-btn filter-btn--threat ${threatsOnly ? "filter-btn--threat-active" : ""}`}
            onClick={() => {
              sound.playClick();
              setThreatsOnly(!threatsOnly);
            }}
          >
            {threatsOnly ? "⚠ THREATS ONLY [ON]" : "THREATS ONLY"}
          </button>
        </div>
      </div>

      {/* Terminal Stream Console */}
      <div className="terminal-log-view">
        <table className="terminal-table mono">
          <thead>
            <tr>
              <th>STATUS</th>
              <th>SOURCE</th>
              <th>DIRECTION</th>
              <th>DESTINATION</th>
              <th>PROTO</th>
              <th>PORTS</th>
              <th>ATTACK PROB</th>
              <th>SEVERITY</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice().reverse().slice(0, 40).map((d, i) => {
              const [src, dst, sport, dport, proto] = d.flow || [];
              const isAtt = d.result?.prediction === 1;
              const prob = d.result?.probability_attack;
              const isSelected = selectedFlow === d;

              return (
                <tr
                  key={i}
                  className={`terminal-row ${isAtt ? "terminal-row--hostile" : ""} ${isSelected ? "terminal-row--selected" : ""}`}
                  onClick={() => handleSelectFlow(d)}
                >
                  <td>
                    <span className={`status-glyph ${isAtt ? "status-glyph--danger" : "status-glyph--ok"}`}>
                      {isAtt ? "▲ INTERCEPT" : "● PASS"}
                    </span>
                  </td>
                  <td className="text-cyan">{src || "127.0.0.1"}</td>
                  <td className="text-dim">→</td>
                  <td className="text-white">{dst || "10.0.0.1"}</td>
                  <td className="text-purple">{proto || "TCP"}</td>
                  <td className="text-dim">{sport ?? 0} : {dport ?? 0}</td>
                  <td>
                    <span className={isAtt ? "text-crimson font-bold" : "text-emerald"}>
                      {typeof prob === "number" ? `${(prob * 100).toFixed(1)}%` : "—"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-pill badge-pill--${(d.severity || "BENIGN").toLowerCase()}`}>
                      {d.severity || (isAtt ? "HIGH" : "BENIGN")}
                    </span>
                  </td>
                  <td className="text-purple font-bold">
                    {d.response?.action || (isAtt ? "BLOCK_SOURCE" : "PASS")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="terminal-empty mono">
            [SYS-MSG] No telemetry frames matching query. Try resetting filters.
          </div>
        )}
      </div>

      {/* Flow Inspection Drawer */}
      {selectedFlow && (
        <div className="flow-inspect-panel mono">
          <div className="inspect-head">
            <span className="inspect-title text-cyan">
              [INSPECT FRAME] {selectedFlow.flow?.[0]}:{selectedFlow.flow?.[2]} → {selectedFlow.flow?.[1]}:{selectedFlow.flow?.[3]}
            </span>
            <button
              type="button"
              className="close-drawer-btn"
              onClick={() => setSelectedFlow(null)}
            >
              ✕
            </button>
          </div>

          <div className="inspect-grid">
            <div className="inspect-cell">
              <span className="k">CLASSIFICATION:</span>
              <span className={selectedFlow.result?.prediction === 1 ? "text-crimson" : "text-emerald"}>
                {selectedFlow.result?.prediction === 1 ? "MALICIOUS ATTACK INTRUSION" : "NORMAL BENIGN TRAFFIC"}
              </span>
            </div>
            <div className="inspect-cell">
              <span className="k">BENIGN PROBABILITY:</span>
              <span className="text-cyan">
                {selectedFlow.result?.probability_benign != null
                  ? `${(selectedFlow.result.probability_benign * 100).toFixed(1)}%`
                  : "—"}
              </span>
            </div>
            <div className="inspect-cell">
              <span className="k">ATTACK PROBABILITY:</span>
              <span className="text-crimson">
                {selectedFlow.result?.probability_attack != null
                  ? `${(selectedFlow.result.probability_attack * 100).toFixed(1)}%`
                  : "—"}
              </span>
            </div>
            <div className="inspect-cell">
              <span className="k">DISPATCHED QAOA ACTION:</span>
              <span className="text-purple font-bold">
                {selectedFlow.response?.action || "BLOCK_SOURCE"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
