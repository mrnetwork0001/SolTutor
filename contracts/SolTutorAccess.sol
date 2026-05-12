// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SolTutorAccess
 * @notice Monthly subscription contract for SolTutor — AI Solidity Tutor
 * @dev Users pay native A0GI tokens for 30-day access to permanent neural memory.
 *      Powered by MemoriaDA Protocol on 0G Chain.
 */
contract SolTutorAccess {
    address public owner;
    uint256 public subscriptionPrice = 1 ether; // 1 A0GI
    uint256 public subscriptionDuration = 30 days;

    mapping(address => uint256) public subscriptionExpiry;

    event Subscribed(address indexed user, uint256 expiry, uint256 amount);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event Withdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Subscribe or extend subscription by paying the subscription price.
     * @dev If already subscribed, extends from current expiry. Otherwise starts from now.
     */
    function subscribe() external payable {
        require(msg.value >= subscriptionPrice, "Insufficient payment");

        uint256 currentExpiry = subscriptionExpiry[msg.sender];
        uint256 startTime = currentExpiry > block.timestamp ? currentExpiry : block.timestamp;
        uint256 newExpiry = startTime + subscriptionDuration;

        subscriptionExpiry[msg.sender] = newExpiry;

        // Refund excess payment
        uint256 excess = msg.value - subscriptionPrice;
        if (excess > 0) {
            (bool sent, ) = payable(msg.sender).call{value: excess}("");
            require(sent, "Refund failed");
        }

        emit Subscribed(msg.sender, newExpiry, subscriptionPrice);
    }

    /**
     * @notice Check if a user has an active subscription.
     */
    function isSubscribed(address user) external view returns (bool) {
        return subscriptionExpiry[user] > block.timestamp;
    }

    /**
     * @notice Get the remaining subscription time in seconds.
     */
    function timeRemaining(address user) external view returns (uint256) {
        if (subscriptionExpiry[user] <= block.timestamp) return 0;
        return subscriptionExpiry[user] - block.timestamp;
    }

    /**
     * @notice Update the subscription price (owner only).
     * @dev Use this when migrating to mainnet to set 5, 10, or 20 A0GI.
     */
    function setPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be > 0");
        uint256 oldPrice = subscriptionPrice;
        subscriptionPrice = newPrice;
        emit PriceUpdated(oldPrice, newPrice);
    }

    /**
     * @notice Update the subscription duration (owner only).
     */
    function setDuration(uint256 newDuration) external onlyOwner {
        require(newDuration > 0, "Duration must be > 0");
        subscriptionDuration = newDuration;
    }

    /**
     * @notice Transfer ownership.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    /**
     * @notice Withdraw collected subscription fees (owner only).
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");
        (bool sent, ) = payable(owner).call{value: balance}("");
        require(sent, "Withdraw failed");
        emit Withdrawn(owner, balance);
    }
}
