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
      <div className="section-head">
        <div className="section-head__title">
          <span className="section-icon">⌨</span>
          <div>
            <h3>LIVE DEEP PACKET TELEMETRY & INGESTION</h3>
            <p>Real-Time Packet Ingress, Protocol Extraction & Flow Classification Feed</p>
          </div>
        </div>
        <span className="buffer-counter mono">
          BUFFER: {filtered.length} OF {detections.length} FLOWS
        </span>
      </div>

      {/* Protocol Density Spectrum */}
      <div className="protocol-bar-strip">
        <span className="strip-label">PROTOCOL DISTRIBUTION:</span>
        <div className="multi-spectrum-track">
          {protoStats.map((st, i) => {
            const colors = [
              "var(--color-primary)",
              "var(--color-purple)",
              "var(--color-emerald)",
              "var(--color-amber)",
              "var(--color-crimson)"
            ];
            const color = colors[i % colors.length];
            return (
              <div
                key={st.name}
                className="spectrum-slice"
                style={{ width: `${st.pct}%`, backgroundColor: color }}
                title={`${st.name}: ${st.count} flows (${st.pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>
        <div className="spectrum-legend-chips">
          {protoStats.map((st, i) => {
            const colors = [
              "var(--color-primary)",
              "var(--color-purple)",
              "var(--color-emerald)",
              "var(--color-amber)",
              "var(--color-crimson)"
            ];
            return (
              <span key={st.name} className="legend-chip mono">
                <span className="dot" style={{ backgroundColor: colors[i % colors.length] }} />
                {st.name} ({st.pct.toFixed(0)}%)
              </span>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="terminal-filter-bar">
        <div className="search-field">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input mono"
            placeholder="Filter by IP, destination, protocol or severity…"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          {filterQuery && (
            <button type="button" className="clear-btn" onClick={() => setFilterQuery("")}>✕</button>
          )}
        </div>

        <div className="filter-pill-group">
          {["ALL", "TCP", "UDP", "SSH", "TLS"].map((proto) => (
            <button
              key={proto}
              type="button"
              className={`filter-pill ${protocolFilter === proto ? "filter-pill--active" : ""}`}
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
            className={`filter-pill filter-pill--threat ${threatsOnly ? "filter-pill--threat-active" : ""}`}
            onClick={() => {
              sound.playClick();
              setThreatsOnly(!threatsOnly);
            }}
          >
            {threatsOnly ? "⚠ Threats Only [On]" : "Threats Only"}
          </button>
        </div>
      </div>

      {/* High-Legibility Data Table */}
      <div className="terminal-table-wrap">
        <table className="terminal-data-table mono">
          <thead>
            <tr>
              <th>STATUS</th>
              <th>SOURCE</th>
              <th>DIRECTION</th>
              <th>DESTINATION</th>
              <th>PROTOCOL</th>
              <th>PORTS</th>
              <th>ATTACK PROB</th>
              <th>SEVERITY</th>
              <th>QAOA ACTION</th>
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
                  className={`table-row ${isAtt ? "table-row--threat" : ""} ${isSelected ? "table-row--selected" : ""}`}
                  onClick={() => handleSelectFlow(d)}
                >
                  <td>
                    <span className={`status-tag ${isAtt ? "status-tag--danger" : "status-tag--ok"}`}>
                      {isAtt ? "▲ INTERCEPT" : "● NORMAL"}
                    </span>
                  </td>
                  <td className="text-primary font-bold">{src || "127.0.0.1"}</td>
                  <td className="text-dim">→</td>
                  <td>{dst || "10.0.0.1"}</td>
                  <td className="text-purple">{proto || "TCP"}</td>
                  <td className="text-dim">{sport ?? 0} : {dport ?? 0}</td>
                  <td>
                    <span className={isAtt ? "text-crimson font-bold" : "text-emerald"}>
                      {typeof prob === "number" ? `${(prob * 100).toFixed(1)}%` : "—"}
                    </span>
                  </td>
                  <td>
                    <span className={`severity-chip severity-chip--${(d.severity || "BENIGN").toLowerCase()}`}>
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
          <div className="table-empty mono">
            No telemetry records matching current filter parameters.
          </div>
        )}
      </div>

      {/* Selected Flow Inspection Drawer */}
      {selectedFlow && (
        <div className="flow-inspector-drawer mono">
          <div className="drawer-top">
            <span className="drawer-title text-primary">
              [FLOW INSPECTION] {selectedFlow.flow?.[0]}:{selectedFlow.flow?.[2]} → {selectedFlow.flow?.[1]}:{selectedFlow.flow?.[3]}
            </span>
            <button type="button" className="close-btn" onClick={() => setSelectedFlow(null)}>✕</button>
          </div>

          <div className="drawer-grid">
            <div className="drawer-card">
              <span className="k">CLASSIFICATION VERDICT:</span>
              <span className={selectedFlow.result?.prediction === 1 ? "text-crimson font-bold" : "text-emerald font-bold"}>
                {selectedFlow.result?.prediction === 1 ? "MALICIOUS INTRUSION" : "NORMAL BENIGN TRAFFIC"}
              </span>
            </div>
            <div className="drawer-card">
              <span className="k">ATTACK PROBABILITY:</span>
              <span className="text-crimson font-bold">
                {selectedFlow.result?.probability_attack != null
                  ? `${(selectedFlow.result.probability_attack * 100).toFixed(2)}%`
                  : "—"}
              </span>
            </div>
            <div className="drawer-card">
              <span className="k">BENIGN PROBABILITY:</span>
              <span className="text-primary font-bold">
                {selectedFlow.result?.probability_benign != null
                  ? `${(selectedFlow.result.probability_benign * 100).toFixed(2)}%`
                  : "—"}
              </span>
            </div>
            <div className="drawer-card">
              <span className="k">
                {selectedFlow.response?.action
                  ? "QAOA OPTIMIZED ACTION:"
                  : "RESPONSE ACTION:"}
              </span>

              <span className="text-purple font-bold">
                {selectedFlow.response?.action
                  ? selectedFlow.response.action
                  : selectedFlow.result?.prediction === 1
                    ? "ALERT"
                    : "PASS"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
