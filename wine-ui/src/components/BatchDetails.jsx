import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

const BatchDetails = () => {
  const { batchId } = useParams();
  const [batch, setBatch] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const formatTimestamp = (ts) => {
    const date = new Date(Number(ts) * 1000);
    return date.toLocaleString();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contract = await getContract();
        const batchData = await contract.viewBatch(BigInt(batchId));
        const events = await contract.getBatchHistory(BigInt(batchId));
        setBatch(batchData);
        setHistory(events);
        setError("");
      } catch (err) {
        console.error("❌ Failed to load batch:", err);
        setError("Batch not found or data unavailable.");
        setBatch(null);
        setHistory([]);
      }
    };

    fetchData();
  }, [batchId]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>🍷 Trace Wine Batch #{batchId}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {batch && (
        <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1rem", marginTop: "1rem" }}>
          <p><strong>Producer:</strong> {batch.producer}</p>
          <p><strong>Origin:</strong> {batch.origin}</p>
          <p><strong>Grape Type:</strong> {batch.grapeType}</p>
          <p><strong>Year:</strong> {batch.productionYear}</p>
          <p><strong>Current Status:</strong> {statusEnum[Number(batch.currentStatus)]}</p>
          <p><strong>Current Owner:</strong> {batch.currentOwner}</p>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>📜 History</h3>
          {history.map((e, i) => (
            <div key={i} style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
              <p><strong>Status:</strong> {statusEnum[Number(e.status)]}</p>
              <p><strong>Updated By:</strong> {e.updatedBy}</p>
              <p><strong>Timestamp:</strong> {formatTimestamp(e.timestamp)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BatchDetails;
