// src/utils/getReadOnlyContract.js
import { ethers } from "ethers";
import abi from "../abi/WineSupplyChain.json";

const getReadOnlyContract = () => {
  const rpcUrl = import.meta.env.VITE_INFURA_SEPOLIA_URL;
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  return new ethers.Contract(contractAddress, abi.abi, provider);
};

export default getReadOnlyContract;
