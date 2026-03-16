// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CasinoVault
 * @dev Holds the casino bankroll and handles deposits/withdrawals.
 */
contract CasinoVault is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    mapping(address => bool) public supportedTokens;
    mapping(address => uint256) public tokenBalances;

    event Deposit(address indexed token, address indexed user, uint256 amount);
    event Withdrawal(address indexed token, address indexed user, uint256 amount);
    event TokenStatusChanged(address indexed token, bool status);

    constructor() Ownable(msg.sender) {}

    function setTokenStatus(address token, bool status) external onlyOwner {
        supportedTokens[token] = status;
        emit TokenStatusChanged(token, status);
    }

    function deposit(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(supportedTokens[token] || token == address(0), "Token not supported");
        
        if (token == address(0)) {
            require(msg.value == amount, "Invalid ETH amount");
            tokenBalances[address(0)] += msg.value;
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            tokenBalances[token] += amount;
        }
        
        emit Deposit(token, msg.sender, amount);
    }

    function withdraw(address token, uint256 amount) external onlyOwner nonReentrant {
        require(tokenBalances[token] >= amount, "Insufficient vault balance");
        
        tokenBalances[token] -= amount;
        
        if (token == address(0)) {
            (bool success, ) = payable(owner()).call{value: amount}("");
            require(success, "ETH withdrawal failed");
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
        
        emit Withdrawal(token, owner(), amount);
    }

    // Function for BetManager to pay out winners
    function payout(address token, address winner, uint256 amount) external {
        // In a real scenario, we'd restrict this to BetManager contract
        // For this demo, we'll keep it simple or use a role system
    }

    receive() external payable {
        tokenBalances[address(0)] += msg.value;
        emit Deposit(address(0), msg.sender, msg.value);
    }
}
