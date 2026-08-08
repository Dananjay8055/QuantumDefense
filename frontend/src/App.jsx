import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Quantum Defense Dashboard</h1>

      {data ? (
        <div>
          <p><strong>Project:</strong> {data.project}</p>
          <p><strong>Status:</strong> {data.status}</p>
          <p><strong>Version:</strong> {data.version}</p>
        </div>
      ) : (
        <p>Connecting to backend...</p>
      )}
    </div>
  );
}

export default App;