export type CheckResult = {
  id: string;
  name: string;
  passed: boolean;
  detail: string;
};

function extractFunctionBody(source: string, name: string): string | null {
  const re = new RegExp(`function\\s+${name}\\s*\\([^)]*\\)\\s*[^{]*\\{`);
  const match = re.exec(source);
  if (!match || match.index === undefined) return null;

  const start = match.index + match[0].length;
  let depth = 1;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i);
    }
  }
  return null;
}

function hasEmit(body: string, eventName: string): boolean {
  return new RegExp(`emit\\s+${eventName}\\s*\\(`).test(body);
}

function usesOnlyOwner(body: string, fullSource: string, fnName: string): boolean {
  if (/\bonlyOwner\b/.test(body)) return true;
  const sig = new RegExp(
    `function\\s+${fnName}\\s*\\([^)]*\\)\\s*external\\s+onlyOwner\\s*\\{`,
  );
  if (sig.test(fullSource)) return true;
  return (
    /msg\.sender\s*!=\s*owner/.test(body) ||
    /owner\s*!=\s*msg\.sender/.test(body) ||
    /NotOwner/.test(body)
  );
}

export function runVaultChecks(source: string): CheckResult[] {
  const deposit = extractFunctionBody(source, "deposit");
  const withdraw = extractFunctionBody(source, "withdraw");
  const pause = extractFunctionBody(source, "pause");
  const unpause = extractFunctionBody(source, "unpause");

  const depositOk =
    !!deposit &&
    /balances\s*\[\s*msg\.sender\s*\]\s*\+=\s*msg\.value/.test(deposit) &&
    hasEmit(deposit, "Deposit");

  const withdrawBalanceCheck =
    !!withdraw &&
    (/InsufficientBalance/.test(withdraw) ||
      /balances\s*\[\s*msg\.sender\s*\]\s*<\s*amount/.test(withdraw) ||
      /require\s*\(\s*balances\s*\[\s*msg\.sender\s*\]\s*>=\s*amount/.test(withdraw));

  const withdrawPausedCheck =
    !!withdraw &&
    (/Paused\b/.test(withdraw) ||
      /if\s*\(\s*paused\s*\)/.test(withdraw) ||
      /require\s*\(\s*!paused/.test(withdraw));

  const callIdx = withdraw?.search(/\.call\s*\{/) ?? -1;
  const effectIdx =
    withdraw?.search(/balances\s*\[\s*msg\.sender\s*\]\s*-=\s*amount/) ?? -1;
  const ceiOk =
    !!withdraw &&
    callIdx >= 0 &&
    effectIdx >= 0 &&
    effectIdx < callIdx &&
    hasEmit(withdraw, "Withdraw") &&
    (/TransferFailed/.test(withdraw) || /require\s*\(\s*\w+\s*\)/.test(withdraw));

  const pauseOk =
    !!pause &&
    usesOnlyOwner(pause, source, "pause") &&
    /paused\s*=\s*true/.test(pause);

  const unpauseOk =
    !!unpause &&
    usesOnlyOwner(unpause, source, "unpause") &&
    /paused\s*=\s*false/.test(unpause);

  return [
    {
      id: "test_DepositCreditsBalanceAndEmits",
      name: "test_DepositCreditsBalanceAndEmits",
      passed: depositOk,
      detail: depositOk
        ? "deposit credits msg.value and emits Deposit"
        : "deposit must update balances[msg.sender] and emit Deposit",
    },
    {
      id: "test_WithdrawSendsEthAndReducesBalance",
      name: "test_WithdrawSendsEthAndReducesBalance",
      passed: ceiOk && withdrawBalanceCheck,
      detail:
        ceiOk && withdrawBalanceCheck
          ? "withdraw reduces balance, sends ETH, emits Withdraw"
          : "withdraw must reduce balance, call{value: amount}, and emit Withdraw",
    },
    {
      id: "test_CannotWithdrawMoreThanBalance",
      name: "test_CannotWithdrawMoreThanBalance",
      passed: !!withdrawBalanceCheck,
      detail: withdrawBalanceCheck
        ? "insufficient balance is rejected"
        : "withdraw must revert when balance < amount",
    },
    {
      id: "test_CannotWithdrawWhenPaused",
      name: "test_CannotWithdrawWhenPaused",
      passed: !!withdrawPausedCheck,
      detail: withdrawPausedCheck
        ? "paused withdrawals are rejected"
        : "withdraw must revert when paused",
    },
    {
      id: "test_NonOwnerCannotPause",
      name: "test_NonOwnerCannotPause",
      passed: pauseOk,
      detail: pauseOk
        ? "pause is owner-gated"
        : "pause must be onlyOwner (or equivalent check)",
    },
    {
      id: "test_OwnerCanPauseAndUnpause",
      name: "test_OwnerCanPauseAndUnpause",
      passed: pauseOk && unpauseOk,
      detail:
        pauseOk && unpauseOk
          ? "owner can pause and unpause"
          : "pause/unpause must set paused and be owner-only",
    },
    {
      id: "test_WithdrawUsesChecksEffectsInteractions",
      name: "test_WithdrawUsesChecksEffectsInteractions",
      passed: ceiOk,
      detail: ceiOk
        ? "balance updated before external call (CEI)"
        : "update balances[msg.sender] before msg.sender.call{value: amount}",
    },
  ];
}
