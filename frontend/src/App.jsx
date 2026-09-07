import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "./services/api";
import "./App.css";

const POLL_MS = 5000;

const LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const RESPONSES = {
  MONITOR: "Continue observing the suspicious source without applying a disruptive control.",
  RATE_LIMIT: "Restrict suspicious traffic while preserving connectivity.",
  BLOCK_SOURCE: "Block further traffic from the identified suspicious source.",
  ISOLATE_HOST: "Isolate the affected host to contain a critical threat.",
};
const SIMS = [
  ["LOW", 55, "blue"],
  ["MEDIUM", 70, "amber"],
  ["HIGH", 85, "orange"],
  ["CRITICAL", 98, "red"],
];

const arr = (v) => (Array.isArray(v) ? v : []);
const num = (v, d = 2) =>
  typeof v === "number" && Number.isFinite(v) ? v.toFixed(d) : "—";
const pct = (v, d = 1) =>
  typeof v === "number" && Number.isFinite(v) ? `${(v * 100).toFixed(d)}%` : "—";
const isAttack = (d) => d?.result?.prediction === 1;
const isSimulated = (d) =>
  d?.type === "SIMULATED_ATTACK" || d?.type === "SECURITY_EVENT";
const formatTime = (v) => {
  if (!v) return "—";
  const date = new Date(v * 1000);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};
const shortHash = (v) =>
  typeof v === "string" && v
    ? v.length > 32 ? `${v.slice(0, 16)}…${v.slice(-12)}` : v
    : "—";

function Icon({ name }) {
  const p = {
    viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
  };
  const body = {
    activity: <path d="M2 12h4l3 8 4-16 3 8h6" />,
    shield: <><path d="M12 2.5 19.5 6v5.2c0 4.6-3.2 7.9-7.5 9.3-4.3-1.4-7.5-4.7-7.5-9.3V6L12 2.5Z"/><path d="m9 12 2 2 4-4"/></>,
    alert: <><path d="m12 3.5 9.5 16.5h-19L12 3.5Z"/><path d="M12 9.5v4.5"/><circle cx="12" cy="17" r=".6"/></>,
    quantum: <><circle cx="12" cy="12" r="3"/><path d="M4 12c0-4 3.6-7 8-7s8 3 8 7-3.6 7-8 7-8-3-8-7Z"/><path d="M6 5.5c3.5 2 8.5 2 12 0M6 18.5c3.5-2 8.5-2 12 0"/></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    chain: <><path d="M10 13a4 4 0 0 0 5.7.2l2-2a4 4 0 0 0-5.7-5.7l-1.1 1.1"/><path d="M14 11a4 4 0 0 0-5.7-.2l-2 2A4 4 0 0 0 8 18.5l1.1-1.1"/></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.8-4L3 10"/><path d="M3 5v5h5"/><path d="M4 13a8 8 0 0 0 14.8 4L21 14"/><path d="M21 19v-5h-5"/></>,
  };
  return <svg {...p}>{body[name] || body.activity}</svg>;
}

function Dot({ ok }) {
  return <span className={`dot ${ok ? "dot--ok" : "dot--bad"}`} />;
}
function Pill({ children, tone = "cyan" }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}
function Button({ children, onClick, disabled = false }) {
  return <button className="button" onClick={onClick} disabled={disabled}>{children}</button>;
}
function Badge({ value }) {
  const v = String(value || "BENIGN").toLowerCase();
  return <span className={`badge badge--${v}`}>{String(value || "BENIGN")}</span>;
}
function Panel({ eyebrow, title, right, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel__head">
        <div>{eyebrow && <small>{eyebrow}</small>}<h2>{title}</h2></div>
        {right && <div>{right}</div>}
      </header>
      <div className="panel__body">{children}</div>
    </section>
  );
}
function Empty({ title, body, tone = "info" }) {
  return <div className={`empty empty--${tone}`}><strong>{title}</strong>{body && <span>{body}</span>}</div>;
}

function Header({ online, refreshing, onRefresh }) {
  return (
    <header className="header">
      <div className="header__glow header__glow--one" />
      <div className="header__glow header__glow--two" />
      <div className="header__network"><span/><span/><span/><span/><span/><span/><span/></div>
      <div className="header__brand">
        <small>QUANTUM SECURITY OPERATIONS CENTER</small>
        <h1>Quantum Defense <b>SOC</b></h1>
        <p>AI threat detection · QAOA optimization · QSVC quantum ML · ML-KEM-768 · blockchain audit</p>
      </div>
      <div className="header__right">
        <div className="header__status">
          <Dot ok={online}/>
          <div><strong>{online ? "SYSTEM ONLINE" : "CONNECTION DEGRADED"}</strong><span>Security monitoring platform</span></div>
        </div>
        <Button onClick={onRefresh} disabled={refreshing}><Icon name="refresh"/>{refreshing ? "REFRESHING…" : "REFRESH"}</Button>
      </div>
    </header>
  );
}

function StatCard({ label, value, sub, tone = "default", icon }) {
  return <div className={`stat-card stat-card--${tone}`}>
    <div className="stat-card__top"><span>{label}</span>{icon && <span className="stat-card__icon">{icon}</span>}</div>
    <div className="stat-card__value">{value}</div>
    {sub != null && <div className="stat-card__sub">{sub}</div>}
  </div>;
}

function SectionBanner({ title, text, badge, tone = "cyan" }) {
  return <div className={`section-banner section-banner--${tone}`}>
    <div><span className="section-banner__eyebrow">{title}</span><p>{text}</p></div>
    <Pill tone={tone}>{badge}</Pill>
  </div>;
}

function LiveDetection({ detections, latestLive }) {
  return (
    <Panel eyebrow="REAL NETWORK TELEMETRY" title="Live Random Forest Detection"
      right={<Pill tone="green">REAL CAPTURE</Pill>}>
      <SectionBanner title="LIVE NETWORK TELEMETRY"
        text="Packets and flows captured by the network monitoring layer are processed by the Random Forest detector."
        badge="LIVE STREAM" tone="green"/>
      {latestLive ? (
        <div className="detection-hero">
          <div><small>LATEST LIVE FLOW</small><strong>{latestLive.flow?.[0] || "—"} → {latestLive.flow?.[1] || "—"}</strong></div>
          <div><small>ATTACK PROBABILITY</small><strong>{pct(latestLive.result?.probability_attack)}</strong></div>
          <div><small>CLASSIFICATION</small><strong className={isAttack(latestLive) ? "text-red" : "text-green"}>{isAttack(latestLive) ? "THREAT" : "BENIGN"}</strong></div>
        </div>
      ) : <Empty title="Waiting for live flow data…" body="The dashboard is polling the detection API."/>}
      <div className="telemetry-note"><Icon name="activity"/><span>Only live RF telemetry is shown here. Demonstration events are intentionally excluded from this section.</span></div>
    </Panel>
  );
}

function QAOA({ latestSimulated }) {
  const response = latestSimulated?.response;
  const scores = response?.response_scores || {};
  if (!response) return <Panel eyebrow="QUANTUM OPTIMIZATION · QAOA" title="Response Optimizer" right={<Pill tone="purple">QAOA</Pill>}><Empty title="Standing by" body="Run a simulated security event to display the QAOA decision."/></Panel>;
  const max = Math.max(1, ...Object.values(scores).filter(v => typeof v === "number"));
  return (
    <Panel eyebrow="QUANTUM OPTIMIZATION · QAOA" title="Response Optimizer" right={<Pill tone="purple">DECISION READY</Pill>}>
      <div className="qaoa-hero"><div><small>SELECTED RESPONSE</small><strong>{response.action}</strong></div><div><small>OPTIMIZATION SCORE</small><strong>{num(response.score)}</strong></div></div>
      <div className="kv"><div><span>Quantum decision state</span><b className="mono">[{arr(response.variables).join(", ") || "—"}]</b></div><div><span>Classical optimum</span><b className="mono">{response.classical_optimal_action || "—"}</b></div><div><span>Matches classical</span><b className={response.qaoa_matches_classical ? "text-green" : "text-orange"}>{response.qaoa_matches_classical == null ? "—" : response.qaoa_matches_classical ? "YES" : "NO"}</b></div></div>
      <div className="score-list">{Object.keys(RESPONSES).map(key => <div className={`score ${key === response.action ? "score--selected" : ""}`} key={key}><span className="mono">{key}{key === response.action && <em>SELECTED</em>}</span><div><i style={{width:`${typeof scores[key] === "number" ? Math.max(3,(scores[key]/max)*100) : 0}%`}}/></div><b className="mono">{num(scores[key])}</b></div>)}</div>
    </Panel>
  );
}

function QuantumML({ qsvc, circuit, loading, error }) {
  if (!qsvc && loading) return <Panel eyebrow="QUANTUM MACHINE LEARNING" title="QSVC Threat Classification"><Empty title="Loading QSVC experiment…" body="Retrieving quantum classifier results and circuit data."/></Panel>;
  if (!qsvc) return <Panel eyebrow="QUANTUM MACHINE LEARNING" title="QSVC Threat Classification"><Empty title="QSVC unavailable" body={error || "The quantum ML endpoint could not be reached."} tone="error"/></Panel>;
  const experiments = arr(qsvc.experiments);
  return (
    <Panel eyebrow="QUANTUM MACHINE LEARNING" title="QSVC Threat Classification" right={<Pill tone="purple">{qsvc.status || "COMPLETED"}</Pill>}>
      <div className="quantum-head"><div><small>CLASSIFIER</small><strong>{qsvc.classifier || "QSVC"}</strong></div><div><small>KERNEL</small><strong>{qsvc.kernel || "FidelityQuantumKernel"}</strong></div><div><small>QUBITS</small><strong>{qsvc.qubits ?? 4}</strong></div><div><small>DATASET</small><strong>{qsvc.dataset || "CICIDS2017"}</strong></div></div>
      <div className="feature-row">{arr(qsvc.features).map(f => <span key={f}>{f}</span>)}</div>
      {circuit?.experiments?.map((experiment) => (
  <div className="circuit-card" key={experiment.reps}>
    <div className="subhead">
      <span>ACTUAL QUANTUM CIRCUIT — REPS {experiment.reps}</span>
      <Pill tone="purple">
        {experiment.qubits} QUBITS · DEPTH {experiment.depth}
      </Pill>
    </div>

    <pre>{experiment.circuit}</pre>
  </div>
))}
      <div className="experiment-list">{experiments.map((e,i) => <div className="experiment" key={i}><div className="experiment__top"><strong>ZZFeatureMap reps={e.reps ?? i+1}</strong><span>Accuracy {pct(e.accuracy,2)}</span></div><div className="metrics"><span>F1 <b>{num(e.f1,3)}</b></span><span>Precision <b>{num(e.precision,3)}</b></span><span>Recall <b>{num(e.recall,3)}</b></span><span>Training <b>{num(e.training_time_seconds,2)} s</b></span><span>Prediction <b>{num(e.prediction_time_seconds,2)} s</b></span></div>{e.confusion_matrix && <div className="matrix"><div/><b>Pred 0</b><b>Pred 1</b><b>Actual 0</b><span>{e.confusion_matrix[0][0]}</span><span>{e.confusion_matrix[0][1]}</span><b>Actual 1</b><span>{e.confusion_matrix[1][0]}</span><span>{e.confusion_matrix[1][1]}</span></div>}</div>)}</div>
      <div className="quantum-explanation"><Icon name="quantum"/><div><strong>Why this is a quantum component</strong><p>QSVC uses a quantum feature map to encode network-security features and a Fidelity Quantum Kernel to calculate similarities between encoded states. This experiment is evaluated independently from the classical Random Forest detector.</p></div></div>
    </Panel>
  );
}

function Pipeline({ latest, pqc, blockchain }) {
  const response = latest?.response;
  return <Panel eyebrow="SIMULATED SECURITY PIPELINE" title="Defense Processing Chain" right={<Pill tone="amber">DEMO MODE</Pill>}>
    <div className="pipeline-label-note">This pipeline belongs to the non-destructive attack simulator, not the live packet stream.</div>
    <div className="pipeline-flow">
      <div className="pipeline-step ai-step"><span>SIMULATED AI EVENT</span><strong>{pct(latest?.result?.probability_attack)} ATTACK</strong></div><i>→</i>
      <div className="pipeline-step qaoa-step"><span>QAOA OPTIMIZATION</span><strong>{response?.action || "PENDING"}</strong></div><i>→</i>
      <div className="pipeline-step pqc-step"><span>PQC SECURITY</span><strong>{latest?.pqc?.shared_secret_match ? `${latest.pqc.algorithm} VERIFIED` : pqc?.result?.shared_secret_match ? `${pqc.result.algorithm} VERIFIED` : "PQC UNAVAILABLE"}</strong></div><i>→</i>
      <div className="pipeline-step blockchain-step"><span>BLOCKCHAIN AUDIT</span><strong>{blockchain?.valid ? `BLOCK #${Math.max(0,(blockchain.length||1)-1)} VALID` : "AUDIT UNAVAILABLE"}</strong></div>
    </div>
  </Panel>;
}

function ResponsePanel({ latest }) {
  if (!latest?.response) return <Panel eyebrow="INCIDENT RESPONSE" title="Recommended Response"><Empty title="No simulated response yet" body="Run one of the four severity scenarios below."/></Panel>;
  const action = latest.response.action;
  return <Panel eyebrow="INCIDENT RESPONSE" title="Recommended Response" right={<Pill tone="purple">QAOA SELECTED</Pill>}>
    <div className="response"><small>RECOMMENDED ACTION</small><strong>{action}</strong><p>{RESPONSES[action]}</p></div>
    {latest.mitigation && <div className="mitigation"><header><strong>Simulated execution</strong><Pill tone="purple">{latest.mitigation.status}</Pill></header><div className="kv kv--2"><div><span>Source</span><b className="mono">{latest.mitigation.source || "—"}</b></div><div><span>Target</span><b className="mono">{latest.mitigation.destination || "—"}</b></div></div><p>{latest.mitigation.message}</p><small>Demonstration only — no real network control is modified.</small></div>}
  </Panel>;
}

function Simulator({ running, onRun }) {
  return <Panel eyebrow="DEMONSTRATION CONTROL" title="Attack Response Simulator" right={<Pill tone="amber">DEMO MODE · NON-DESTRUCTIVE</Pill>}>
    <SectionBanner title="SIMULATED SECURITY EVENT" text="Generate a controlled event to demonstrate AI classification, QAOA response optimization, ML-KEM verification and blockchain auditing." badge="DEMO ONLY" tone="amber"/>
    <div className="simulator">{SIMS.map(([level, probability, tone]) => <div className={`sim sim--${tone}`} key={level}><strong>{level}</strong><span>{probability}%</span><small>simulated attack probability</small><Button onClick={() => onRun(level)} disabled={!!running}>{running === level ? "PROCESSING…" : "RUN SIMULATION →"}</Button></div>)}</div>
  </Panel>;
}

function Analytics({ simulated }) {
  const counts = useMemo(() => LEVELS.reduce((o,l) => ({...o,[l]: simulated.filter(x => x.severity === l).length}), {}), [simulated]);
  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  return <Panel eyebrow="SIMULATION ANALYTICS" title="Simulated Threat Distribution"><div className="distribution"><div className="bars">{LEVELS.map(l => <div className="bar-row" key={l}><span>{l}</span><div><i className={`bar-${l.toLowerCase()}`} style={{width:`${total ? (counts[l]/total)*100 : 0}%`}}/></div><b>{counts[l]}</b></div>)}</div><div className="distribution-summary"><strong>{total}</strong><span>simulated security events</span><small>Live RF detections are excluded.</small></div></div></Panel>;
}

function History({ simulated }) {
  const rows = simulated.slice().reverse().slice(0,25);
  return <Panel eyebrow="DECISION LOG" title="QAOA Response History">{rows.length === 0 ? <Empty title="No QAOA decisions yet" body="Run a simulator scenario to create a decision."/> : <div className="history-list">{rows.map((d,i)=><div className="history-list__row" key={i}><Badge value={d.severity}/><span className="mono">{pct(d.result?.probability_attack)}</span><span>→</span><strong className="mono">{d.response?.action || "—"}</strong><span className="mono">{num(d.response?.score)}</span><span className={d.response?.qaoa_matches_classical ? "text-green" : "text-orange"}>{d.response?.qaoa_matches_classical ? "✓ MATCH" : "≠ DIFFERS"}</span></div>)}</div>}</Panel>;
}

function Block({ block }) {
  const [open,setOpen]=useState(false);
  const event = typeof block.event === "object" ? block.event : null;
  return <div className="block"><button type="button" onClick={()=>setOpen(v=>!v)}><b className="mono">#{block.index}</b><strong>{block.event === "GENESIS" ? "GENESIS BLOCK" : event?.type || "SECURITY EVENT"}</strong>{event?.severity && <Badge value={event.severity}/>}<time>{formatTime(block.timestamp)}</time><span>{open?"▲":"▼"}</span></button>{open&&<div className="block__body"><div className="hash-card"><span>BLOCK HASH · SHA-256</span><code>{block.hash || "—"}</code></div><div className="hash-card"><span>PREVIOUS HASH · CHAIN LINK</span><code>{block.previous_hash || "—"}</code></div>{event&&<><div className="block-detail"><span>Source → Destination</span><code>{event.source||"—"} → {event.destination||"—"}</code></div><div className="block-detail"><span>QAOA</span><code>{event.qaoa_action||"—"} · {num(event.qaoa_score)}</code></div><div className="block-detail"><span>PQC</span><code>{event.pqc_algorithm||"—"} · {event.pqc_status||"—"}</code></div><div className="block-detail"><span>Mitigation</span><code>{event.mitigation_action||"—"} · {event.mitigation_status||"—"}</code></div></>}</div>}</div>;
}

function Blockchain({ data, latest, onTamper, tamperRunning, tamperResult }) {
  if (!data) return <Panel eyebrow="DISTRIBUTED LEDGER" title="Blockchain Security Audit"><Empty title="Blockchain unavailable" tone="error"/></Panel>;
  const chain=arr(data.chain);
  const attack=Boolean(latest) || chain.some(b=>b.event && b.event !== "GENESIS" && b.event.type === "SECURITY_EVENT");
  const r=tamperResult;
  const passed=r?.original_chain_valid===true&&r?.tampering_detected===true&&r?.after_tampering===false&&r?.after_restoration===true&&r?.hash_mismatch_detected===true;
  return <Panel eyebrow="DISTRIBUTED LEDGER" title="Blockchain Security Audit" right={<Pill tone={data.valid?"green":"red"}>{data.valid?"CHAIN VALID":"CHAIN INVALID"}</Pill>}>
    <div className={`audit ${attack?"audit--attack":"audit--safe"}`}><b>{attack?"SECURITY EVENT RECORDED":"AUDIT CHAIN SECURE"}</b><span>{attack?"Simulated security events are recorded in the audit chain.":"Blockchain is maintaining a valid audit trail."}</span></div>
    <div className="audit-count"><span>Total blocks</span><b>{data.length ?? chain.length}</b></div>
    <div className="blocks">{chain.slice().reverse().map(b=><Block key={b.index} block={b}/>)}</div>
    {attack&&<div className="tamper"><header><div><small>BLOCKCHAIN INTEGRITY SELF-TEST</small><p>Controlled tamper simulation: modify → hash → detect → restore.</p></div><Button onClick={onTamper} disabled={tamperRunning}>{tamperRunning?"VERIFYING…":"VERIFY LEDGER INTEGRITY"}</Button></header>{r&&<><div className="tamper-flow">{[["01","Original chain",r.original_chain_valid],["02","Tampering detected",r.tampering_detected],["03","Modified chain invalid",r.after_tampering===false],["04","Chain restored",r.after_restoration===true]].map(([n,l,ok],i)=><React.Fragment key={n}><div className={ok?"tamper-step ok":"tamper-step bad"}><b>{n}</b><span>{ok?"✓":"✕"} {l}</span></div>{i<3&&<i>↓</i>}</React.Fragment>)}</div><div className={`tamper-final ${passed?"ok":"bad"}`}>{passed?"INTEGRITY PROTECTION VERIFIED":"INTEGRITY TEST FAILED"}</div></>}</div>}
  </Panel>;
}

function Activity({ detections }) {
  const rows=detections.filter(d=>!isSimulated(d)).slice().reverse().slice(0,30);
  return <Panel eyebrow="REAL CAPTURE" title="Recent Live Network Activity" right={<Pill tone="green">LIVE ONLY</Pill>}>{rows.length===0?<Empty title="No live flows recorded yet"/>:<div className="table-wrap"><table><thead><tr><th>Source</th><th>Destination</th><th>Protocol</th><th>Ports</th><th>Attack Probability</th><th>Severity</th><th>Response</th></tr></thead><tbody>{rows.map((d,i)=>{const [s,t,sp,dp,proto]=d.flow||[];const attack=isAttack(d);return <tr className={attack?"attack-row":""} key={i}><td className="mono">{s??"—"}</td><td className="mono">{t??"—"}</td><td className="mono">{proto??"—"}</td><td className="mono">{sp??"—"} → {dp??"—"}</td><td className="mono">{pct(d.result?.probability_attack)}</td><td><Badge value={attack?d.severity:"BENIGN"}/></td><td className="mono text-purple">{attack?d.response?.action||"—":"—"}</td></tr>})}</tbody></table></div>}</Panel>;
}

function Footer(){return <footer className="app-footer"><span>Quantum Defense SOC</span><span>·</span><span>AI Detection · QAOA Optimization · ML-KEM-768 · Blockchain Audit</span><span>· 5s polling</span></footer>}

export default function App() {
  const [detections,setDetections]=useState([]);
  const [blockchain,setBlockchain]=useState(null);
  const [pqc,setPqc]=useState(null);
  const [qsvc,setQsvc]=useState(null);
  const [circuit,setCircuit]=useState(null);
  const [errors,setErrors]=useState({detections:false,blockchain:false,pqc:false,qsvc:false});
  const [loading,setLoading]=useState({detections:true,blockchain:true,pqc:true,qsvc:true});
  const [running,setRunning]=useState(null);
  const [tamperRunning,setTamperRunning]=useState(false);
  const [tamperResult,setTamperResult]=useState(null);
  const [refreshing,setRefreshing]=useState(false);
  const intervalRef=useRef(null);

  const fetchDetections=useCallback(async()=>{try{const r=await api.get("/api/detections");setDetections(arr(r.data?.detections));setErrors(e=>({...e,detections:false}));}catch(e){console.error(e);setErrors(x=>({...x,detections:true}));}finally{setLoading(x=>({...x,detections:false}));}},[]);
  const fetchBlockchain=useCallback(async()=>{try{const r=await api.get("/api/blockchain");setBlockchain(r.data||null);setErrors(e=>({...e,blockchain:false}));}catch(e){console.error(e);setErrors(x=>({...x,blockchain:true}));}finally{setLoading(x=>({...x,blockchain:false}));}},[]);
  const fetchPqc=useCallback(async()=>{try{const r=await api.get("/api/pqc/status");setPqc(r.data||null);setErrors(e=>({...e,pqc:false}));}catch(e){console.error(e);setPqc(null);setErrors(x=>({...x,pqc:true}));}finally{setLoading(x=>({...x,pqc:false}));}},[]);
  const fetchQsvc=useCallback(async()=>{try{const r=await api.get("/api/quantum/qsvc");setQsvc(r.data||null);setErrors(e=>({...e,qsvc:false}));}catch(e){console.error(e);setQsvc(null);setErrors(x=>({...x,qsvc:true}));}finally{setLoading(x=>({...x,qsvc:false}));}},[]);
  const fetchCircuit=useCallback(async()=>{try{const r=await api.get("/api/quantum/qsvc/circuit");setCircuit(r.data||null);}catch(e){console.error("Circuit API error:",e);setCircuit(null);}},[]);

  const refreshAll=useCallback(async()=>{setRefreshing(true);await Promise.all([fetchDetections(),fetchBlockchain(),fetchPqc(),fetchQsvc(),fetchCircuit()]);setRefreshing(false);},[fetchDetections,fetchBlockchain,fetchPqc,fetchQsvc,fetchCircuit]);
  useEffect(()=>{refreshAll();intervalRef.current=setInterval(refreshAll,POLL_MS);return()=>clearInterval(intervalRef.current);},[refreshAll]);

  const simulated=useMemo(()=>detections.filter(isSimulated),[detections]);
  const live=useMemo(()=>detections.filter(d=>!isSimulated(d)),[detections]);
  const liveAttacks=useMemo(()=>live.filter(isAttack),[live]);
  const latestLive=live[live.length-1]||null;
  const latestSimulated=simulated[simulated.length-1]||null;
  const qaoaDecisions=simulated.filter(d=>d.response?.action).length;
  const criticalSimulations=simulated.filter(d=>d.severity==="CRITICAL").length;
  const pqcVerified=Boolean(pqc?.result?.shared_secret_match);

  const simulateAttack=async(severity)=>{try{setRunning(severity);const r=await api.post(`/api/demo/attack?severity=${severity}`);const event=r.data?.event;if(event)setDetections(prev=>[...prev,event]);await Promise.all([fetchDetections(),fetchBlockchain(),fetchPqc()]);}catch(e){console.error(e);}finally{setRunning(null);}};
  const runTamper=async()=>{try{setTamperRunning(true);const r=await api.post("/api/blockchain/tamper-test");setTamperResult(r.data||null);await fetchBlockchain();}catch(e){console.error(e);}finally{setTamperRunning(false);}};

  const online=!errors.detections&&!errors.blockchain&&!errors.pqc&&!errors.qsvc;

  return <div className="app-shell">
    <Header online={online} refreshing={refreshing} onRefresh={refreshAll}/>
    <main className="dashboard">
      <section className="service-strip">
        <div><Icon name="activity"/><span>LIVE RF</span><b>{live.length} FLOWS</b></div>
        <div><Icon name="quantum"/><span>QAOA</span><b>{qaoaDecisions} DECISIONS</b></div>
        <div><Icon name="lock"/><span>PQC</span><b>{pqcVerified?"ML-KEM-768 VERIFIED":"UNAVAILABLE"}</b></div>
        <div><Icon name="chain"/><span>AUDIT</span><b>{blockchain?.valid?"CHAIN VALID":"CHECKING"}</b></div>
      </section>

      <section className="stats">
        <StatCard label="Observed Flows" value={live.length} sub="real captured telemetry" tone="cyan" icon={<Icon name="activity"/>}/>
        <StatCard label="Live RF Detections" value={liveAttacks.length} sub="prediction = attack" tone={liveAttacks.length?"red":"green"} icon={<Icon name="alert"/>}/>
        <StatCard label="Simulated Attacks" value={simulated.length} sub="demo events only" tone="amber" icon={<Icon name="shield"/>}/>
        <StatCard label="Critical Simulations" value={criticalSimulations} sub="CRITICAL demo events" tone="red" icon={<Icon name="alert"/>}/>
        <StatCard label="QAOA Decisions" value={qaoaDecisions} sub="simulator decisions" tone="purple" icon={<Icon name="quantum"/>}/>
        <StatCard label="Audit Blocks" value={blockchain?.length ?? "—"} sub={blockchain?.valid?"hash chain valid":"audit unavailable"} tone="green" icon={<Icon name="chain"/>}/>
      </section>

      <LiveDetection detections={detections} latestLive={latestLive}/>

      <div className="grid-2"><QAOA latestSimulated={latestSimulated}/><QuantumML qsvc={qsvc} circuit={circuit} loading={loading.qsvc} error={errors.qsvc?"QSVC endpoint unavailable.":""}/></div>

      <Simulator running={running} onRun={simulateAttack}/>

      <div className="grid-2"><ResponsePanel latest={latestSimulated}/><Pipeline latest={latestSimulated} pqc={pqc} blockchain={blockchain}/></div>

      <div className="grid-2"><Analytics simulated={simulated}/><History simulated={simulated}/></div>

      <Blockchain data={blockchain} latest={latestSimulated} onTamper={runTamper} tamperRunning={tamperRunning} tamperResult={tamperResult}/>

      <Activity detections={detections}/>
    </main>
    <Footer/>
  </div>;
}
