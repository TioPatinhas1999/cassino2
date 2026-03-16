// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RNGVerifier
 * @dev Validates provably fair seeds and results on-chain if needed.
 */
contract RNGVerifier is Ownable {
    
    event SeedVerified(address indexed player, bytes32 serverSeedHash, string clientSeed, uint256 nonce);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Verifies that a result matches the provided seeds.
     * This is useful for dispute resolution.
     */
    function verifyResult(
        bytes32 serverSeed,
        string memory clientSeed,
        uint256 nonce,
        bytes32 expectedHash
    ) public pure returns (bool) {
        bytes32 actualHash = keccak256(abi.encodePacked(serverSeed, clientSeed, nonce));
        return actualHash == expectedHash;
    }

    function logVerification(bytes32 serverSeedHash, string memory clientSeed, uint256 nonce) external {
        emit SeedVerified(msg.sender, serverSeedHash, clientSeed, nonce);
    }
}
