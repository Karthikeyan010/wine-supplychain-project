const hre = require("hardhat");
const fs = require("fs");

// ✅ MAIN DEPLOY FUNCTION
async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("📦 Deploying contract with account:", deployer.address);

    // ✅ Deploy the WineSupplyChain contract
    const WineSupplyChain = await hre.ethers.getContractFactory("WineSupplyChain");
    const contract = await WineSupplyChain.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("✅ Contract deployed to:", address);

    // ✅ Grant PRODUCER_ROLE to deployer
    const producerRole = await contract.PRODUCER_ROLE();
    await contract.grantRole(producerRole, deployer.address);
    console.log(`🔑 Granted PRODUCER_ROLE to ${deployer.address}`);

    // 📝 Optional: Write Sepolia address to frontend .env
    const envPath = "/home/appu/wine-ui/.env";
    const envData = `VITE_CONTRACT_ADDRESS=${address}\nVITE_NETWORK=sepolia\n`;
    fs.writeFileSync(envPath, envData);
    console.log("📝 Contract address written to wine-ui/.env");
}

// ⛔ ERROR HANDLING
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
