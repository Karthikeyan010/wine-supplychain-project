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

const BatchViewer = () => {
  const [batchId, setBatchId] = useState("");
  const [batch, setBatch] = useState(null);
  const [error, setError] = useState("");

  const fetchBatch = async () => {
    try {
      const contract = await getContract();
      const data = await contract.viewBatch(batchId);
      setBatch(data);
      setError("");     
    } catch (err) {
      setBatch(null);
      setError("❌ Batch not found or contract error");
    }
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "600px", marginTop: "1rem" }}>
      <h3>🔍 View Wine Batch</h3>
      <input
        type="text"
        placeholder="Enter Batch ID (e.g., 1001)"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
        style={{ width: "200px", marginRight: "8px" }}
      />
      <button onClick={fetchBatch}>Fetch</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {batch && (
        <div style={{ marginTop: "1rem", textAlign: "left" }}>
          <p><strong>Batch ID:</strong> {Number(batch.batchId)}</p>
          <p><strong>Producer:</strong> {batch.producer}</p>
          <p><strong>Origin:</strong> {batch.origin}</p>
          <p><strong>Grape Type:</strong> {batch.grapeType}</p>
          <p><strong>Year:</strong> {batch.productionYear}</p>
          <p><strong>Status:</strong> {statusEnum[Number(batch.currentStatus)]}</p>
          <p><strong>Current Owner:</strong> {batch.currentOwner}</p>
        </div>
      )}
    </div>
  );
};

export default BatchViewer;
