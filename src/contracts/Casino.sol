// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title NeonStakeCasino
 * @dev Simple casino contract for deposits, withdrawals and bet settlement.
 * In a real production environment, this would integrate with Chainlink VRF.
 */
contract NeonStakeCasino is Ownable, ReentrancyGuard {
    IERC20 public bettingToken;
    
    mapping(address => uint256) public balances;
    
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event BetSettled(address indexed user, uint256 betAmount, uint256 winAmount, string game);

    constructor(address _token) Ownable(msg.sender) {
        bettingToken = IERC20(_token);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(bettingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        balances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        require(bettingToken.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev In a production app, this would be called by a backend oracle 
     * after verifying the provably fair result.
     */
    function settleBet(address user, uint256 betAmount, uint256 winAmount, string memory game) external onlyOwner {
        if (winAmount > 0) {
            balances[user] += winAmount;
        } else {
            require(balances[user] >= betAmount, "User balance too low");
            balances[user] -= betAmount;
        }
        emit BetSettled(user, betAmount, winAmount, game);
    }
}
