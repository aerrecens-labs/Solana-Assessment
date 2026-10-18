// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SimpleVault} from "../src/Vault.sol";

contract ReentrantAttacker {
    SimpleVault public vault;
    bool public attacking;

    constructor(SimpleVault vault_) {
        vault = vault_;
    }

    function depositAndAttack() external payable {
        vault.deposit{value: msg.value}();
        attacking = true;
        vault.withdraw(msg.value);
    }

    receive() external payable {
        if (attacking && address(vault).balance > 0) {
            attacking = false;
            try vault.withdraw(1 ether) {} catch {}
        }
    }
}

contract VaultTest is Test {
    SimpleVault internal vault;
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    function setUp() public {
        vault = new SimpleVault();
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function test_DepositCreditsBalanceAndEmits() public {
        vm.expectEmit(true, false, false, true);
        emit SimpleVault.Deposit(alice, 1 ether);

        vm.prank(alice);
        vault.deposit{value: 1 ether}();

        assertEq(vault.balances(alice), 1 ether);
        assertEq(address(vault).balance, 1 ether);
    }

    function test_WithdrawSendsEthAndReducesBalance() public {
        vm.prank(alice);
        vault.deposit{value: 2 ether}();

        uint256 beforeBal = alice.balance;

        vm.expectEmit(true, false, false, true);
        emit SimpleVault.Withdraw(alice, 1 ether);

        vm.prank(alice);
        vault.withdraw(1 ether);

        assertEq(vault.balances(alice), 1 ether);
        assertEq(alice.balance, beforeBal + 1 ether);
    }

    function test_CannotWithdrawMoreThanBalance() public {
        vm.prank(alice);
        vault.deposit{value: 1 ether}();

        vm.prank(alice);
        vm.expectRevert(SimpleVault.InsufficientBalance.selector);
        vault.withdraw(2 ether);
    }

    function test_CannotWithdrawWhenPaused() public {
        vm.prank(alice);
        vault.deposit{value: 1 ether}();

        vault.pause();

        vm.prank(alice);
        vm.expectRevert(SimpleVault.Paused.selector);
        vault.withdraw(1 ether);
    }

    function test_NonOwnerCannotPause() public {
        vm.prank(alice);
        vm.expectRevert(SimpleVault.NotOwner.selector);
        vault.pause();
    }

    function test_OwnerCanPauseAndUnpause() public {
        vault.pause();
        assertTrue(vault.paused());

        vault.unpause();
        assertFalse(vault.paused());
    }

    function test_WithdrawUsesChecksEffectsInteractions() public {
        ReentrantAttacker attacker = new ReentrantAttacker(vault);
        vm.deal(address(attacker), 2 ether);

        vm.prank(alice);
        vault.deposit{value: 5 ether}();

        attacker.depositAndAttack{value: 1 ether}();

        // If CEI is correct, attacker cannot drain extra via reentrancy
        assertEq(vault.balances(address(attacker)), 0);
        assertGe(address(vault).balance, 5 ether);
    }
}
