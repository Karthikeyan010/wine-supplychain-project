import { useState } from "react";
import getContract from "../utils/getContract";

const statusEnum = {
  0: "Created",
  1: "InTransitToDistributor",
  2: "ReceivedByDistributor",
  3: "InTransitToRetailer",
  4: "ReceivedByRetailer",
  5: "ForSale",
  6: "Sold",
};

const BatchHistoryViewer = () => {
  const [batchId, setBatchId] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      setError("⌛ Fetching history...");
      const contract = await getContract();
      const result = await contract.getBatchHistory(BigInt(batchId));
      setHistory(result);
      setError("");
    } catch (err) {
      console.error("📛 History fetch failed:", err);
      setError("❌ Batch not found or history unavailable");
      setHistory([]);
    }
  };

  const formatTimestamp = (ts) => {
    const date = new Date(Number(ts) * 1000); // UNIX → ms
    return date.toLocaleString();
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid #bbb", borderRadius: "8px", maxWidth: "700px", marginTop: "2rem" }}>
      <h3>📜 View Batch History</h3>
      <input
        type="text"
        placeholder="Enter Batch ID"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
        style={{ width: "200px", marginRight: "8px" }}
      />
      <button onClick={fetchHistory}>Fetch History</button>

      {error && <p style={{ marginTop: "1rem", color: error.startsWith("❌") ? "red" : "gray" }}>{error}</p>}

      {history.length > 0 && (
        <div style={{ marginTop: "1rem", textAlign: "left" }}>
          {history.map((event, index) => (
            <div key={index} style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
              <p><strong>Status:</strong> {statusEnum[Number(event.status)]}</p>
              <p><strong>Updated By:</strong> {event.updatedBy}</p>
              <p><strong>Timestamp:</strong> {formatTimestamp(event.timestamp)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BatchHistoryViewer;
