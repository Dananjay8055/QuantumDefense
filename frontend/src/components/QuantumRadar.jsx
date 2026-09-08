import React, { useEffect, useRef, useState } from "react";
import { sound } from "../utils/audio";

export default function QuantumRadar({ detections, latestSimulated, latestLive }) {
  const canvasRef = useRef(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [hoveredTarget, setHoveredTarget] = useState(null);

  // Targets mapped from detections
  const targetsRef = useRef([]);

  useEffect(() => {
    // Generate persistent coordinates for flows based on flow hash
    const targets = detections.slice(-24).map((d, index) => {
      const src = d.flow?.[0] || `NODE-${index}`;
      const dst = d.flow?.[1] || "INTERNAL-SUBNET";
      const isAtt = d.result?.prediction === 1;
      const prob = d.result?.probability_attack || (isAtt ? 0.85 : 0.05);

      // Deterministic angle from IP string
      let hash = 0;
      for (let i = 0; i < src.length; i++) {
        hash = (hash << 5) - hash + src.charCodeAt(i);
      }
      const angle = Math.abs(hash % 360) * (Math.PI / 180) + (index * 0.25);
      // Distance: benign closer to center or perimeter; attacks mapped by prob
      const distRatio = 0.25 + (Math.abs(hash >> 3) % 65) / 100;

      return {
        id: `${src}-${dst}-${index}`,
        flow: d.flow,
        src,
        dst,
        proto: d.flow?.[4] || "TCP",
        port: d.flow?.[2] || 4444,
        isAttack: isAtt,
        probability: prob,
        severity: d.severity || (isAtt ? "HIGH" : "BENIGN"),
        response: d.response?.action || (isAtt ? "BLOCK_SOURCE" : "PASS"),
        angle,
        distanceRatio: distRatio,
        pulse: 0,
        raw: d
      };
    });

    targetsRef.current = targets;
  }, [detections]);

  // Canvas Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let sweepAngle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(cx, cy) - 24;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.save();
      ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 36;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Radar Concentric Range Rings
      const rings = [0.25, 0.5, 0.75, 1.0];
      rings.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius * r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 3 ? "rgba(0, 240, 255, 0.35)" : "rgba(0, 240, 255, 0.12)";
        ctx.setLineDash(idx === 1 ? [4, 4] : []);
        ctx.stroke();

        // Range ring label
        ctx.font = "9px SFMono-Regular, monospace";
        ctx.fillStyle = "rgba(0, 240, 255, 0.4)";
        ctx.fillText(`${Math.round(r * 100)}% ZONE`, cx + 6, cy - maxRadius * r + 11);
      });
      ctx.setLineDash([]);

      // Tactical Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - maxRadius, cy);
      ctx.lineTo(cx + maxRadius, cy);
      ctx.moveTo(cx, cy - maxRadius);
      ctx.lineTo(cx, cy + maxRadius);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
      ctx.stroke();

      // Rotating Radar Sweep Beam
      sweepAngle = (sweepAngle + 0.02) % (Math.PI * 2);
      const sweepGrad = ctx.createConicGradient(sweepAngle, cx, cy);
      sweepGrad.addColorStop(0, "rgba(0, 240, 255, 0.28)");
      sweepGrad.addColorStop(0.12, "rgba(0, 240, 255, 0.02)");
      sweepGrad.addColorStop(0.13, "rgba(0, 240, 255, 0)");
      sweepGrad.addColorStop(1, "rgba(0, 240, 255, 0)");

      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sweep leading line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxRadius, cy + Math.sin(sweepAngle) * maxRadius);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Center 4-Qubit Orbital Coherence Core
      const time = Date.now() * 0.0015;
      const coreRadius = maxRadius * 0.18;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(138, 43, 226, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "rgba(138, 43, 226, 0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Qubits orbiting the core
      for (let q = 0; q < 4; q++) {
        const qAngle = time + (q * Math.PI) / 2;
        const qx = cx + Math.cos(qAngle) * (coreRadius * 0.75);
        const qy = cy + Math.sin(qAngle) * (coreRadius * 0.75);

        ctx.beginPath();
        ctx.arc(qx, qy, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#8a2be2";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = "8px SFMono-Regular, monospace";
        ctx.fillStyle = "#e0c3fc";
        ctx.fillText(`q${q}`, qx + 6, qy + 3);
      }

      // Draw Flow Targets / Signatures
      targetsRef.current.forEach((t) => {
        const tr = maxRadius * t.distanceRatio;
        const tx = cx + Math.cos(t.angle) * tr;
        const ty = cy + Math.sin(t.angle) * tr;

        // Calculate angular difference to sweep beam for illumination
        let angleDiff = sweepAngle - t.angle;
        while (angleDiff < 0) angleDiff += Math.PI * 2;
        while (angleDiff >= Math.PI * 2) angleDiff -= Math.PI * 2;
        const brightness = Math.max(0.25, 1 - angleDiff / (Math.PI * 0.6));

        ctx.save();
        if (t.isAttack) {
          // Crimson glowing attack blip
          ctx.beginPath();
          ctx.arc(tx, ty, 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 51, 102, ${brightness})`;
          ctx.shadowColor = "#ff3366";
          ctx.shadowBlur = 10 * brightness;
          ctx.fill();

          // Pulsing danger ring
          t.pulse = (t.pulse + 0.05) % 1;
          ctx.beginPath();
          ctx.arc(tx, ty, 6 + t.pulse * 10, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 51, 102, ${(1 - t.pulse) * brightness * 0.8})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Threat crosshairs
          ctx.strokeStyle = `rgba(255, 51, 102, ${brightness * 0.7})`;
          ctx.beginPath();
          ctx.moveTo(tx - 8, ty);
          ctx.lineTo(tx + 8, ty);
          ctx.moveTo(tx, ty - 8);
          ctx.lineTo(tx, ty + 8);
          ctx.stroke();
        } else {
          // Emerald / cyan benign flow blip
          ctx.beginPath();
          ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 136, ${brightness * 0.9})`;
          ctx.shadowColor = "#00ff88";
          ctx.shadowBlur = 6 * brightness;
          ctx.fill();
        }
        ctx.restore();

        // Selected or Hovered Target Marker
        if (selectedTarget?.id === t.id || hoveredTarget?.id === t.id) {
          ctx.save();
          ctx.strokeStyle = "#00f0ff";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(tx - 10, ty - 10, 20, 20);

          // Vector connector line to center
          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.restore();
        }
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedTarget, hoveredTarget]);

  // Handle Canvas Click to Lock on Target
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxRadius = Math.min(cx, cy) - 24;

    let found = null;
    targetsRef.current.forEach((t) => {
      const tr = maxRadius * t.distanceRatio;
      const tx = cx + Math.cos(t.angle) * tr;
      const ty = cy + Math.sin(t.angle) * tr;
      const dist = Math.hypot(clickX - tx, clickY - ty);
      if (dist < 16) {
        found = t;
      }
    });

    if (found) {
      sound.playAlert();
      setSelectedTarget(found);
    } else {
      setSelectedTarget(null);
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const hoverY = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxRadius = Math.min(cx, cy) - 24;

    let found = null;
    targetsRef.current.forEach((t) => {
      const tr = maxRadius * t.distanceRatio;
      const tx = cx + Math.cos(t.angle) * tr;
      const ty = cy + Math.sin(t.angle) * tr;
      const dist = Math.hypot(hoverX - tx, hoverY - ty);
      if (dist < 16) found = t;
    });

    setHoveredTarget(found);
  };

  const activeTarget = selectedTarget || hoveredTarget || targetsRef.current[targetsRef.current.length - 1] || null;

  return (
    <div className="radar-station">
      {/* Radar Left/Top HUD Telemetry */}
      <div className="radar-station__viewport">
        <div className="radar-canvas-container">
          <canvas
            ref={canvasRef}
            width={520}
            height={520}
            className="radar-canvas"
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
          />

          {/* Tactical Edge Overlays */}
          <div className="radar-corner radar-corner--tl">SEC: ALPHA-01</div>
          <div className="radar-corner radar-corner--tr">FREQ: 3.82 GHz</div>
          <div className="radar-corner radar-corner--bl">BEAM: AUTO-TRACK</div>
          <div className="radar-corner radar-corner--br">FOV: 360° SPHERE</div>

          {/* Center Overlay Label */}
          <div className="radar-hub-badge">
            <span>QAOA 4-QUBIT CORE</span>
            <small>Fidelity Kernel</small>
          </div>
        </div>

        {/* Tactical Legend & Telemetry Readout */}
        <div className="radar-telemetry-panel">
          <div className="hud-panel-title">
            <span className="title-icon">◈</span>
            <h3>DEFENSE RADAR TELEMETRY</h3>
            <span className="live-pill">LIVE SCAN</span>
          </div>

          <div className="radar-stats-grid">
            <div className="radar-stat-box">
              <span className="label">TARGET BLIPS</span>
              <span className="val">{targetsRef.current.length}</span>
            </div>
            <div className="radar-stat-box">
              <span className="label">ACTIVE HOSTILE</span>
              <span className="val text-crimson">
                {targetsRef.current.filter((t) => t.isAttack).length}
              </span>
            </div>
            <div className="radar-stat-box">
              <span className="label">DETECTION MODEL</span>
              <span className="val text-cyan">RandomForest 100T</span>
            </div>
            <div className="radar-stat-box">
              <span className="label">QUANTUM COUPLING</span>
              <span className="val text-purple">ZZFeatureMap (4Q)</span>
            </div>
          </div>

          {/* Interactive Target Lock Telemetry */}
          <div className="target-telemetry-lock">
            <div className="lock-header">
              <span className="lock-tag">
                {activeTarget ? (activeTarget.isAttack ? "TARGET LOCKED // HOSTILE" : "TARGET LOCKED // BENIGN") : "SEARCHING PERIMETER…"}
              </span>
              {activeTarget && (
                <span className={`lock-status ${activeTarget.isAttack ? "lock-status--danger" : "lock-status--safe"}`}>
                  {activeTarget.severity}
                </span>
              )}
            </div>

            {activeTarget ? (
              <div className="lock-details">
                <div className="lock-row">
                  <span className="k">SOURCE FLOW:</span>
                  <span className="v mono">{activeTarget.src}:{activeTarget.port}</span>
                </div>
                <div className="lock-row">
                  <span className="k">TARGET DEST:</span>
                  <span className="v mono">{activeTarget.dst}</span>
                </div>
                <div className="lock-row">
                  <span className="k">PROTOCOL / PORT:</span>
                  <span className="v mono">{activeTarget.proto}</span>
                </div>
                <div className="lock-row">
                  <span className="k">ATTACK PROBABILITY:</span>
                  <span className={`v mono font-bold ${activeTarget.isAttack ? "text-crimson" : "text-emerald"}`}>
                    {(activeTarget.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="lock-row">
                  <span className="k">QAOA RESPONSE:</span>
                  <span className="v mono text-purple font-bold">{activeTarget.response}</span>
                </div>
              </div>
            ) : (
              <div className="lock-placeholder">Click any blip on the radar canvas to lock sensor telemetry.</div>
            )}
          </div>

          {/* Recent Live RF Flow Badge */}
          {latestLive && (
            <div className="recent-rf-strip">
              <div className="rf-strip-label">LATEST HARDWARE RF TELEMETRY</div>
              <div className="rf-strip-val mono">
                <span>{latestLive.flow?.[0] || "127.0.0.1"} → {latestLive.flow?.[1] || "10.0.0.1"}</span>
                <span className={latestLive.result?.prediction === 1 ? "text-crimson" : "text-emerald"}>
                  {latestLive.result?.prediction === 1 ? "THREAT DETECTED" : "FLOW BENIGN"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
