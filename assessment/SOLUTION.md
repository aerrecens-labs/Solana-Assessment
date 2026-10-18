# Interviewer solution & rubric

Candidates should not read this file during the assessment.

## Reference implementation

```solidity
function deposit() external payable {
    balances[msg.sender] += msg.value;
    emit Deposit(msg.sender, msg.value);
}

function withdraw(uint256 amount) external {
    if (paused) revert Paused();
    if (balances[msg.sender] < amount) revert InsufficientBalance();

    balances[msg.sender] -= amount;

    (bool ok,) = msg.sender.call{value: amount}("");
    if (!ok) revert TransferFailed();

    emit Withdraw(msg.sender, amount);
}

function pause() external onlyOwner {
    paused = true;
}

function unpause() external onlyOwner {
    paused = false;
}
```

## Rubric (10 minutes)

| Score | Criteria |
| --- | --- |
| Strong | All in-app checks (or `forge test`) pass; CEI correct; pause + ownership correct |
| Pass | Deposit/withdraw/events work; minor miss on pause or CEI |
| Weak | Partial stubs only; missing balance accounting or external call |
| Fail | Little progress / empty TODOs |

Also note time remaining and whether they needed hints.
