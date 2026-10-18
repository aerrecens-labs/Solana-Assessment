// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * SimpleVault — complete the TODOs so all assessment checks pass.
 *
 * Requirements:
 * - deposit() credits msg.value to the caller
 * - withdraw(amount) uses checks-effects-interactions
 * - pause / unpause are owner-only; withdraw reverts when paused
 * - Emit Deposit and Withdraw events
 */
contract SimpleVault {
    address public owner;
    bool public paused;

    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    error NotOwner();
    error Paused();
    error InsufficientBalance();
    error TransferFailed();

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function deposit() external payable {
        // TODO: credit msg.value to balances[msg.sender] and emit Deposit
    }

    function withdraw(uint256 amount) external {
        // TODO:
        // 1. revert if paused
        // 2. revert if balances[msg.sender] < amount
        // 3. effects before interaction (CEI)
        // 4. send ETH with call; revert on failure
        // 5. emit Withdraw
    }

    function pause() external {
        // TODO: owner-only; set paused = true
    }

    function unpause() external {
        // TODO: owner-only; set paused = false
    }
}
