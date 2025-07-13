const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WineSupplyChain - registerBatch", function () {
    let contract;
    let deployer, producer, other;

    beforeEach(async () => {
        [deployer, producer, other] = await ethers.getSigners();

        const WineSupplyChain = await ethers.getContractFactory("WineSupplyChain");
        contract = await WineSupplyChain.connect(deployer).deploy();

        const PRODUCER_ROLE = await contract.PRODUCER_ROLE();
        await contract.connect(deployer).grantRole(PRODUCER_ROLE, producer.address);
    });

    it("should allow only PRODUCER_ROLE to register a batch", async () => {
        await expect(
            contract.connect(other).registerBatch(1, "France", "Merlot", 2023)
        ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("should store the correct data in batches[batchId]", async () => {
        await contract.connect(producer).registerBatch(1001, "Italy", "Sangiovese", 2022);
        const batch = await contract.batches(1001);
        expect(batch.batchId).to.equal(1001);
        expect(batch.producer).to.equal(producer.address);
        expect(batch.origin).to.equal("Italy");
    });

    it("should log one event in batchHistory with Created status", async () => {
        await contract.connect(producer).registerBatch(1002, "Spain", "Tempranillo", 2021);
        const history = await contract.getBatchHistory(1002);
        expect(history.length).to.equal(1);
        expect(history[0].status).to.equal(0);
    });

    it("should emit BatchRegistered event with correct args", async () => {
        await expect(
            contract.connect(producer).registerBatch(1003, "USA", "Cabernet", 2020)
        ).to.emit(contract, "BatchRegistered").withArgs(1003, producer.address);
    });

    it("should reject duplicate batchId", async () => {
        await contract.connect(producer).registerBatch(1004, "Chile", "Syrah", 2023);
        await expect(
            contract.connect(producer).registerBatch(1004, "Chile", "Syrah", 2023)
        ).to.be.revertedWith("Batch already exists");
    });
});

describe("WineSupplyChain - updateStatus", function () {
    let contract;
    let deployer, producer, distributor, retailer, random;

    beforeEach(async () => {
        [deployer, producer, distributor, retailer, random] = await ethers.getSigners();
        const WineSupplyChain = await ethers.getContractFactory("WineSupplyChain");
        contract = await WineSupplyChain.connect(deployer).deploy();

        await contract.grantRole(await contract.PRODUCER_ROLE(), producer.address);
        await contract.grantRole(await contract.DISTRIBUTOR_ROLE(), distributor.address);
        await contract.grantRole(await contract.RETAILER_ROLE(), retailer.address);

        await contract.connect(producer).registerBatch(1, "France", "Merlot", 2023);
    });

    it("should allow producer to update to InTransitToDistributor", async () => {
        await expect(contract.connect(producer).updateStatus(1, 1))
            .to.emit(contract, "StatusUpdated").withArgs(1, 1, producer.address);
    });

    it("should allow distributor to update to ReceivedByDistributor", async () => {
        await contract.connect(producer).updateStatus(1, 1);
        await expect(contract.connect(distributor).updateStatus(1, 2))
            .to.emit(contract, "StatusUpdated").withArgs(1, 2, distributor.address);
    });

    it("should allow retailer to update to Sold", async () => {
        await contract.connect(producer).updateStatus(1, 1);
        await contract.connect(distributor).updateStatus(1, 2);
        await contract.connect(distributor).updateStatus(1, 3);
        await contract.connect(retailer).updateStatus(1, 4);
        await contract.connect(retailer).updateStatus(1, 5);
        await expect(contract.connect(retailer).updateStatus(1, 6))
            .to.emit(contract, "StatusUpdated").withArgs(1, 6, retailer.address);
    });

    it("should reject invalid role trying transition", async () => {
        await expect(contract.connect(retailer).updateStatus(1, 1))
            .to.be.revertedWith("Only producers can ship to distributor");

        await expect(contract.connect(random).updateStatus(1, 1))
            .to.be.revertedWith("Only producers can ship to distributor")
    });

    it("should reject skipping from Created to Sold", async () => {
        await expect(contract.connect(producer).updateStatus(1, 6))
            .to.be.revertedWith("Only retailers can mark as sold");
    });

    it("should allow full lifecycle: Created → Sold", async () => {
        await contract.connect(producer).updateStatus(1, 1);
        await contract.connect(distributor).updateStatus(1, 2);
        await contract.connect(distributor).updateStatus(1, 3);
        await contract.connect(retailer).updateStatus(1, 4);
        await contract.connect(retailer).updateStatus(1, 5);
        await contract.connect(retailer).updateStatus(1, 6);

        const batch = await contract.batches(1);
        expect(batch.currentStatus).to.equal(6);
        expect(batch.currentOwner).to.equal(retailer.address);
    });

    it("should reject invalid backward transition (ForSale → ReceivedByRetailer)", async () => {
        await contract.connect(producer).updateStatus(1, 1);
        await contract.connect(distributor).updateStatus(1, 2);
        await contract.connect(distributor).updateStatus(1, 3);
        await contract.connect(retailer).updateStatus(1, 4);
        await contract.connect(retailer).updateStatus(1, 5);
        await expect(
            contract.connect(retailer).updateStatus(1, 4)
        ).to.be.revertedWith("Invalid status transition");
    });
});

describe("View Functions", function () {
    let contract;
    let deployer, producer1, producer2;

    beforeEach(async () => {
        [deployer, producer1, producer2] = await ethers.getSigners();

        const WineSupplyChain = await ethers.getContractFactory("WineSupplyChain");
        contract = await WineSupplyChain.deploy();

        await contract.grantRole(await contract.PRODUCER_ROLE(), producer1.address);
        await contract.grantRole(await contract.PRODUCER_ROLE(), producer2.address);

        // Producer 1 registers two batches
        await contract.connect(producer1).registerBatch(1001, "France", "Merlot", 2023);
        await contract.connect(producer1).registerBatch(1002, "Italy", "Sangiovese", 2022);

        // Producer 2 registers one batch
        await contract.connect(producer2).registerBatch(2001, "Spain", "Tempranillo", 2021);
    });

    it("should return the correct WineBatch struct from viewBatch()", async () => {
        const batch = await contract.viewBatch(1001);
        expect(batch.batchId).to.equal(1001);
        expect(batch.producer).to.equal(producer1.address);
        expect(batch.origin).to.equal("France");
        expect(batch.grapeType).to.equal("Merlot");
        expect(batch.productionYear).to.equal(2023);
        expect(batch.currentOwner).to.equal(producer1.address);
        expect(batch.currentStatus).to.equal(0); // Status.Created
    });

    it("should revert viewBatch() on invalid batchId", async () => {
        await expect(contract.viewBatch(9999)).to.be.revertedWith("Batch not found");
    });

    it("should return correct batch list for each producer using getProducerBatches()", async () => {
        const list1 = await contract.getProducerBatches(producer1.address);
        const list2 = await contract.getProducerBatches(producer2.address);

        expect(list1.map(id => Number(id))).to.deep.equal([1001, 1002]);
        expect(list2.map(id => Number(id))).to.deep.equal([2001]);

    });

    it("should keep producer batch lists isolated", async () => {
        const list1 = await contract.getProducerBatches(producer1.address);
        expect(list1.map(id => Number(id))).to.not.include(2001);

        const list2 = await contract.getProducerBatches(producer2.address);
        expect(list2.map(id => Number(id))).to.not.include(1001);

    });
});

