import { useState } from "react";
import getContract from "../utils/getContract";
import { ethers } from "ethers";
import { toast } from "react-toastify"; // ✅ Added
import QRCode from "react-qr-code"; // ✅ Use this instead
import { toPng } from "html-to-image";
import download from "downloadjs";


const RegisterBatchForm = () => {
  const [form, setForm] = useState({
    batchId: "",
    origin: "",
    grapeType: "",
    productionYear: "",
  });

  const [showQR, setShowQR] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerBatch = async () => {
    try {
      toast.info("⌛ Checking producer role...");
      const contract = await getContract();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const role = await contract.PRODUCER_ROLE();
      const signerAddress = await signer.getAddress();
      const isProducer = await contract.hasRole(role, signerAddress);

      if (!isProducer) {
        toast.error("❌ You don't have PRODUCER_ROLE");
        return;
      }

      toast.info("⌛ Registering batch...");
      const tx = await contract.registerBatch(
        BigInt(form.batchId),
        form.origin,
        form.grapeType,
        parseInt(form.productionYear)
      );

      await tx.wait();
      toast.success("✅ Batch registered successfully!");
      setShowQR(true);
    } catch (err) {
      console.error("Contract Error:", err);
      toast.error(`❌ Error: ${err?.reason || "Batch registration failed"}`);
      setShowQR(false);
    }
  };

  const downloadQR = () => {
    const node = document.getElementById("qr-code-container");
    toPng(node)
      .then((dataUrl) => {
        download(dataUrl, `Batch_${form.batchId}_QR.png`);
        toast.success("📥 QR code downloaded!");
      })
      .catch((err) => {
        console.error("QR Download Error", err);
        toast.error("❌ Failed to download QR code.");
      });
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "600px", marginTop: "2rem" }}>
      <h3>📝 Register New Wine Batch</h3>
      <input
        type="text"
        name="batchId"
        placeholder="Batch ID (e.g., 1001)"
        value={form.batchId}
        onChange={handleChange}
        style={{ width: "200px", marginBottom: "8px" }}
      /><br />
      <input
        type="text"
        name="origin"
        placeholder="Origin (e.g., France)"
        value={form.origin}
        onChange={handleChange}
        style={{ width: "200px", marginBottom: "8px" }}
      /><br />
      <input
        type="text"
        name="grapeType"
        placeholder="Grape Type (e.g., Merlot)"
        value={form.grapeType}
        onChange={handleChange}
        style={{ width: "200px", marginBottom: "8px" }}
      /><br />
      <input
        type="number"
        name="productionYear"
        placeholder="Year (e.g., 2023)"
        value={form.productionYear}
        onChange={handleChange}
        style={{ width: "200px", marginBottom: "8px" }}
      /><br />
      <button onClick={registerBatch}>Register Batch</button>

      {showQR && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <h4>📎 QR Code for Batch #{form.batchId}</h4>
          <div id="qr-code-container" style={{ background: "white", padding: "10px", display: "inline-block" }}>
            <QRCode value={`${window.location.origin}/batch/${form.batchId}`} size={180} fgColor="#333" />
          </div>
          <br />
          <button onClick={downloadQR} style={{ marginTop: "10px" }}>⬇️ Download QR</button>
          <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
            🔗 <a href={`${window.location.origin}/batch/${form.batchId}`} target="_blank" rel="noreferrer">
              {`${window.location.origin}/batch/${form.batchId}`}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default RegisterBatchForm;

