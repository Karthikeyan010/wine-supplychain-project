import { useEffect, useState } from "react";
import getContract from "../utils/getContract"; // ✅ Required for role lookup
import { ethers } from "ethers";

const MetaMaskConnect = ({ onConnect }) => {
    const [account, setAccount] = useState(null);
    const [error, setError] = useState("");
    const [role, setRole] = useState(""); // ✅ Store role string

    const fetchUserRole = async (address) => {
        try {
            const contract = await getContract();
            const producerRole = await contract.PRODUCER_ROLE();
            const distributorRole = await contract.DISTRIBUTOR_ROLE();
            const retailerRole = await contract.RETAILER_ROLE();

            const isProducer = await contract.hasRole(producerRole, address);
            const isDistributor = await contract.hasRole(distributorRole, address);
            const isRetailer = await contract.hasRole(retailerRole, address);

            if (isProducer) return "Producer";
            if (isDistributor) return "Distributor";
            if (isRetailer) return "Retailer";
            return "Unknown";
        } catch (err) {
            console.error("Role check failed:", err);
            return "Unknown";
        }
    };

    const checkIfWalletIsConnected = async () => {
        if (!window.ethereum) {
            setError("MetaMask not detected");
            return;
        }

        try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            if (accounts.length > 0) {
                const userAddress = accounts[0];
                setAccount(userAddress);
                const userRole = await fetchUserRole(userAddress);
                setRole(userRole);
                if (onConnect) onConnect(userAddress, userRole); // ✅ Send both address and role
            }
        } catch (err) {
            setError("Failed to fetch accounts");
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError("Please install MetaMask to use this app");
            return;
        }

        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const userAddress = accounts[0];
            setAccount(userAddress);
            const userRole = await fetchUserRole(userAddress);
            setRole(userRole);
            setError("");
            if (onConnect) onConnect(userAddress, userRole); // ✅ Send both address and role
        } catch (err) {
            setError("Connection request denied");
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px", maxWidth: "400px" }}>
            <h3>Connect Wallet</h3>
            {account ? (
                <>
                    <p>✅ Connected: <strong>{account.slice(0, 6)}...{account.slice(-4)}</strong></p>
                    <p>🛡️ Role: <strong>{role}</strong></p>
                </>
            ) : (
                <button onClick={connectWallet}>Connect MetaMask</button>
            )}
            {error && <p style={{ color: "red" }}>⚠ {error}</p>}
        </div>
    );
};

export default MetaMaskConnect;
