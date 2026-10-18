# Solidity Technical Assessment (10 minutes)

Timed coding screen for Solidity. You will implement a small ETH vault and make the in-app checks pass.

## Important rule — No AI

**You must not use any AI tools during this assessment.**

That includes ChatGPT, Claude, Copilot, Cursor Agent, Gemini, and similar assistants. Use only your own knowledge and the starter code / tests provided in this repo.

## How to run

Node.js (LTS): https://nodejs.org/

```powershell
npm install
npm run dev
```

Open **http://localhost:8080/assessment** in your browser.

(If Vite prints a different port, use that host/port and still open `/assessment`.)

## What to do

1. Read this README and the rules on the assessment page.
2. Acknowledge that you will not use AI, then start the **10:00** timer.
3. Implement `SimpleVault` in the editor (starter is also under `assessment/src/Vault.sol`).
4. Click **Run checks** until all tests pass — or until time runs out.
5. Do **not** edit the test file / test definitions.

## Task — `SimpleVault`

Users deposit ETH, withdraw their balance; the owner can pause withdrawals.

Implement:

1. `deposit()` — credit `msg.value` to the caller’s balance; emit `Deposit`
2. `withdraw(uint256 amount)` — checks-effects-interactions; revert if insufficient balance or when paused; emit `Withdraw`
3. `pause()` / `unpause()` — owner only
4. Events: `Deposit(address indexed user, uint256 amount)`, `Withdraw(address indexed user, uint256 amount)`

## Rules

- Duration: **10 minutes** once you start
- No AI tools (see above)
- Do not modify tests
- No wallet connection is required for `/assessment`

## For interviewers

Optional authoritative grade with Foundry (candidates are not required to use this):

```powershell
cd assessment
forge test
```

See `assessment/SOLUTION.md` for the reference approach and rubric.
