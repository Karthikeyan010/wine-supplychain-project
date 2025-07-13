import { useState } from "react";
import getContract from "../utils/getContract";
import { toast } from "react-toastify";

const statusEnum = {
  1: "InTransitToDistributor",
  2: "ReceivedByDistributor",
  3: "InTransitToRetailer",
  4: "ReceivedByRetailer",
  5: "ForSale",
  6: "Sold",
};

const UpdateStatusForm = () => {
  const [batchId, setBatchId] = useState("");
  const [newStatus, setNewStatus] = useState("1"); // default to first valid status
  const [status, setStatus] = useState("");

  const updateStatus = async () => {
    try {
       toast.info("⌛ Updating batch status...");
      const contract = await getContract();

      // Convert batchId and status to correct types
      const tx = await contract.updateStatus(BigInt(batchId), parseInt(newStatus));
      await tx.wait();

       toast.info(`✅ Batch ${batchId} updated to "${statusEnum[newStatus]}"`);
    } catch (err) {
      console.error("🛑 Update failed:", err);
      if (err?.info?.error?.message) {
         toast.info("❌ " + err.info.error.message);
      } else {
         toast.info("❌ Transaction failed or not authorized");
      }
    }
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid #aaa", borderRadius: "8px", maxWidth: "600px", marginTop: "2rem" }}>
      <h3>🔁 Update Batch Status</h3>
      <input
        type="text"
        placeholder="Batch ID (e.g., 1001)"
        value={batchId}
        onChange={(e) => setBatchId(e.target.value)}
        style={{ width: "200px", marginBottom: "8px" }}
      /><br />
      <select
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value)}
        style={{ width: "220px", marginBottom: "8px" }}
      >
        {Object.entries(statusEnum).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select><br />
      <button onClick={updateStatus}>Update Status</button>

      {status && <p style={{ marginTop: "1rem", color: status.startsWith("❌") ? "red" : "green" }}>{status}</p>}
    </div>
  );
};

export default UpdateStatusForm;
