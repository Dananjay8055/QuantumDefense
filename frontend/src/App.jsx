import { useEffect, useState } from "react";
import api from "./services/api";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState(null);

  const simulateAttack = async () => {
    try {
      await api.post("/api/demo/attack");
      fetchData();
    } catch (err) {
      console.error(err);
  }
  };

  const fetchData = async () => {
    try {
      const status = await api.get("/");
      const detectionData = await api.get("/api/detections");

      setData(status.data);
      setDetections(detectionData.data.detections || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Backend connection failed");
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">

      <header>
        <h1>Quantum Defense</h1>
        <p>AI-Powered Network Threat Detection</p>
      </header>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <button className="attack-button" onClick={simulateAttack}>
        Simulate Attack
      </button>

      {data ? (
        <div className="status-card">
          <div>
            <strong>System</strong>
            <span className="online">● ONLINE</span>
          </div>

          <div>
            <strong>Version</strong>
            <span>{data.version}</span>
          </div>

          <div>
            <strong>Project</strong>
            <span>{data.project}</span>
          </div>
        </div>
      ) : (
        <p>Connecting to backend...</p>
      )}

      <section className="detections">

        <div className="section-header">
          <h2>Live Threat Detection</h2>
          <span>{detections.length} events</span>
        </div>

        {detections.length === 0 ? (
          <div className="empty">
            Waiting for network traffic...
          </div>
        ) : (
          <div className="table-container">
            <table>

              <thead>
                <tr>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Protocol</th>
                  <th>Prediction</th>
                  <th>Benign</th>
                  <th>Attack</th>
                </tr>
              </thead>

              <tbody>
                {detections.slice().reverse().map((event, index) => {

                  const flow = event.flow || [];
                  const result = event.result || {};

                  return (
                    <tr key={index}>

                      <td>
                        {flow[0] || "-"}:{flow[2] || "-"}
                      </td>

                      <td>
                        {flow[1] || "-"}:{flow[3] || "-"}
                      </td>

                      <td>
                        {flow[4] || "-"}
                      </td>

                      <td>
                        <span
                          className={
                            result.prediction === 1
                              ? "attack"
                              : "benign"
                          }
                        >
                          {result.prediction === 1
                            ? "ATTACK"
                            : "BENIGN"}
                        </span>
                      </td>

                      <td>
                        {result.probability_benign !== undefined
                          ? `${(result.probability_benign * 100).toFixed(1)}%`
                          : "-"}
                      </td>

                      <td>
                        {result.probability_attack !== undefined
                          ? `${(result.probability_attack * 100).toFixed(1)}%`
                          : "-"}
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}

      </section>

    </div>
  );
}

export default App;