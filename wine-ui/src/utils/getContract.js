// src/utils/getContract.js
import { ethers } from "ethers";
import abi from "../abi/WineSupplyChain.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

// Use Infura or Alchemy public endpoint as fallback (Sepolia)
const readOnlyProvider = new ethers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_ID}` // ✅ Put this in your .env
);

const getContract = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return new ethers.Contract(contractAddress, abi.abi, signer);
    } catch (err) {
      console.warn("MetaMask found but failed to get signer. Falling back to read-only.");
    }
  }

  // Fallback to read-only mode (no MetaMask)
  return new ethers.Contract(contractAddress, abi.abi, readOnlyProvider);
};

export default getContract;
