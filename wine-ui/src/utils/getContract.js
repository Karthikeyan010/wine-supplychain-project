// src/utils/getContract.js
import { ethers } from "ethers";
import abi from "../abi/WineSupplyChain.json";

const getContract = async () => {
    if (!window.ethereum) throw new Error("MetaMask not found");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

    return new ethers.Contract(contractAddress, abi.abi, signer);
};

export default getContract;
