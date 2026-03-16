// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GameRouter
 * @dev Routes bets to specific games and maintains game registry.
 */
contract GameRouter is Ownable {
    mapping(string => address) public gameContracts;

    event GameRegistered(string gameType, address gameAddress);

    constructor() Ownable(msg.sender) {}

    function registerGame(string memory gameType, address gameAddress) external onlyOwner {
        gameContracts[gameType] = gameAddress;
        emit GameRegistered(gameType, gameAddress);
    }

    // In a more complex system, this would handle routing logic
    // For now, it serves as a registry
}
