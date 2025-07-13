// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract WineSupplyChain is AccessControl {
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    enum Status {
        Created,
        InTransitToDistributor,
        ReceivedByDistributor,
        InTransitToRetailer,
        ReceivedByRetailer,
        ForSale,
        Sold
    }

    struct WineBatch {
        uint256 batchId;
        address producer;
        string origin;
        string grapeType;
        uint16 productionYear;
        address currentOwner;
        Status currentStatus;
    }

    struct BatchEvent {
        Status status;
        address updatedBy;
        uint256 timestamp;
    }

    mapping(uint256 => WineBatch) public batches;
    mapping(uint256 => BatchEvent[]) public batchHistory;
    mapping(address => uint256[]) public producerBatches;


    event BatchRegistered(uint256 indexed batchId, address indexed producer);

    function registerBatch(
        uint256 batchId,
        string memory origin,
        string memory grapeType,
        uint16 productionYear
    ) public onlyRole(PRODUCER_ROLE) {
        require(batches[batchId].batchId == 0, "Batch already exists");

        batches[batchId] = WineBatch({
            batchId: batchId,
            producer: msg.sender,
            origin: origin,
            grapeType: grapeType,
            productionYear: productionYear,
            currentOwner: msg.sender,
            currentStatus: Status.Created
        });

        // ✅ Track this batch under the producer
        producerBatches[msg.sender].push(batchId);


    batchHistory[batchId].push(BatchEvent({
            status: Status.Created,
            updatedBy: msg.sender,
            timestamp: block.timestamp
        }));

        emit BatchRegistered(batchId, msg.sender);
    }

    /// @notice Emitted when a wine batch's status is updated
    event StatusUpdated(uint256 indexed batchId, Status newStatus, address indexed updatedBy);

    function updateStatus(uint256 batchId, Status newStatus) public {
        require(batches[batchId].batchId != 0, "Batch does not exist");

        Status current = batches[batchId].currentStatus;

        if (newStatus == Status.InTransitToDistributor) {
            require(hasRole(PRODUCER_ROLE, msg.sender), "Only producers can ship to distributor");
            require(current == Status.Created, "Invalid status transition");
        } else if (newStatus == Status.ReceivedByDistributor) {
            require(hasRole(DISTRIBUTOR_ROLE, msg.sender), "Only distributors can receive from producer");
            require(current == Status.InTransitToDistributor, "Invalid status transition");
        } else if (newStatus == Status.InTransitToRetailer) {
            require(hasRole(DISTRIBUTOR_ROLE, msg.sender), "Only distributors can ship to retailer");
            require(current == Status.ReceivedByDistributor, "Invalid status transition");
        } else if (newStatus == Status.ReceivedByRetailer) {
            require(hasRole(RETAILER_ROLE, msg.sender), "Only retailers can receive from distributor");
            require(current == Status.InTransitToRetailer, "Invalid status transition");
        } else if (newStatus == Status.ForSale) {
            require(hasRole(RETAILER_ROLE, msg.sender), "Only retailers can list for sale");
            require(current == Status.ReceivedByRetailer, "Invalid status transition");
        } else if (newStatus == Status.Sold) {
            require(hasRole(RETAILER_ROLE, msg.sender), "Only retailers can mark as sold");
            require(current == Status.ForSale, "Invalid status transition");
        } else {
            revert("Unsupported status update");
        }

        batches[batchId].currentStatus = newStatus;
        batches[batchId].currentOwner = msg.sender;

        batchHistory[batchId].push(BatchEvent({
            status: newStatus,
            updatedBy: msg.sender,
            timestamp: block.timestamp
        }));

        emit StatusUpdated(batchId, newStatus, msg.sender);
    }

    function getBatchHistory(uint256 batchId) public view returns (BatchEvent[] memory) {
        return batchHistory[batchId];
    }
    /**
 * @dev View function to return full details of a wine batch by ID.
     * Reverts if the batch doesn't exist.
     */
    function viewBatch(uint256 batchId) public view returns (WineBatch memory) {
        require(batches[batchId].batchId != 0, "Batch not found");
        return batches[batchId];
    }
    /**
 * @dev Returns the list of batch IDs created by a given producer.
     * Allows off-chain consumers to query all batches for a producer.
     */
    function getProducerBatches(address producerAddr) public view returns (uint256[] memory) {
        return producerBatches[producerAddr];
    }


}
