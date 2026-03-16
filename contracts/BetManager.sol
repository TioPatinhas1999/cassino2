// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BetManager
 * @dev Records bets and manages wager validation.
 */
contract BetManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Bet {
        address player;
        address token;
        uint256 amount;
        uint256 payout;
        uint256 timestamp;
        bool settled;
        string gameType;
    }

    mapping(bytes32 => Bet) public bets;
    uint256 public totalBets;
    uint256 public totalPayouts;

    event BetPlaced(bytes32 indexed betId, address indexed player, address token, uint256 amount, string gameType);
    event BetSettled(bytes32 indexed betId, address indexed player, uint256 payout);
    event PayoutSent(address indexed player, address token, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function placeBet(bytes32 betId, address token, uint256 amount, string memory gameType) external payable nonReentrant {
        require(bets[betId].player == address(0), "Bet ID already exists");
        
        if (token == address(0)) {
            require(msg.value == amount, "Invalid ETH amount");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        bets[betId] = Bet({
            player: msg.sender,
            token: token,
            amount: amount,
            payout: 0,
            timestamp: block.timestamp,
            settled: false,
            gameType: gameType
        });

        totalBets += amount;
        emit BetPlaced(betId, msg.sender, token, amount, gameType);
    }

    function settleBet(bytes32 betId, uint256 payoutAmount) external onlyOwner nonReentrant {
        Bet storage bet = bets[betId];
        require(bet.player != address(0), "Bet does not exist");
        require(!bet.settled, "Bet already settled");

        bet.settled = true;
        bet.payout = payoutAmount;

        if (payoutAmount > 0) {
            totalPayouts += payoutAmount;
            if (bet.token == address(0)) {
                (bool success, ) = payable(bet.player).call{value: payoutAmount}("");
                require(success, "ETH payout failed");
            } else {
                IERC20(bet.token).safeTransfer(bet.player, payoutAmount);
            }
            emit PayoutSent(bet.player, bet.token, payoutAmount);
        }

        emit BetSettled(betId, bet.player, payoutAmount);
    }
}
