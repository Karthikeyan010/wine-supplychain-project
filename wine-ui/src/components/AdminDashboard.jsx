import { useState } from "react";
import getContract from "../utils/getContract";
import { ethers } from "ethers";
import { toast } from "react-toastify";

// ✅ Replace with your actual admin wallet address
const ADMIN_ADDRESS = "0xeCeBBC9a32d33AbCFB5EB452066084083500bdD9";

const AdminDashboard = ({ currentAccount }) => {
  const [targetAddress, setTargetAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState("DISTRIBUTOR_ROLE");

  const assignRole = async () => {
    if (!targetAddress || !ethers.isAddress(targetAddress)) {
      toast.error("❌ Invalid wallet address");
      return;
    }

    try {
      const contract = await getContract();

      let roleHash;
      if (selectedRole === "PRODUCER_ROLE") {
        roleHash = await contract.PRODUCER_ROLE();
      } else if (selectedRole === "DISTRIBUTOR_ROLE") {
        roleHash = await contract.DISTRIBUTOR_ROLE();
      } else if (selectedRole === "RETAILER_ROLE") {
        roleHash = await contract.RETAILER_ROLE();
      }

      toast.info(`⌛ Assigning ${selectedRole}...`);
      const tx = await contract.grantRole(roleHash, targetAddress);
      await tx.wait();
      toast.success(`✅ ${selectedRole} granted to ${targetAddress}`);
    } catch (err) {
      console.error("Grant Role Error:", err);
      toast.error("❌ Failed to assign role");
    }
  };

  if (!currentAccount || currentAccount.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
    return <p>⛔ You are not authorized to view this page.</p>;
  }

  return (
    <div style={{ padding: "1rem", border: "1px solid #aaa", borderRadius: "8px", marginTop: "2rem", maxWidth: "600px" }}>
      <h3>👑 Admin Dashboard – Assign Roles</h3>

      <input
        type="text"
        placeholder="Wallet Address"
        value={targetAddress}
        onChange={(e) => setTargetAddress(e.target.value)}
        style={{ width: "100%", marginBottom: "0.75rem" }}
      />

      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        style={{ width: "100%", marginBottom: "0.75rem" }}
      >
        <option value="PRODUCER_ROLE">Producer</option>
        <option value="DISTRIBUTOR_ROLE">Distributor</option>
        <option value="RETAILER_ROLE">Retailer</option>
      </select>

      <button onClick={assignRole} style={{ width: "100%" }}>Assign Role</button>
    </div>
  );
};

export default AdminDashboard;
