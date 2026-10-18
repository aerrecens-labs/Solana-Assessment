import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Download, Play, RotateCcw, ShieldAlert, Timer } from 'lucide-react';
import vaultStarter from '../../assessment/src/Vault.sol?raw';
import vaultTests from '../../assessment/test/Vault.t.sol?raw';
import { CheckResult, runVaultChecks } from '@/lib/assessment/vaultChecks';

const DURATION_SECONDS = 10 * 60;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const AssessmentPage: React.FC = () => {
  const [code, setCode] = useState(vaultStarter);
  const [acknowledged, setAcknowledged] = useState(false);
  const [started, setStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECONDS);
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const locked = started && secondsLeft <= 0;

  useEffect(() => {
    if (!started || locked) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, locked]);

  const passedCount = useMemo(
    () => results?.filter((r) => r.passed).length ?? 0,
    [results],
  );

  const handleStart = () => {
    if (!acknowledged) return;
    setStarted(true);
    setSecondsLeft(DURATION_SECONDS);
    setResults(null);
  };

  const handleRunChecks = () => {
    setResults(runVaultChecks(code));
  };

  const handleReset = () => {
    if (locked) return;
    setCode(vaultStarter);
    setResults(null);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Vault.sol';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      <header className="border-b border-white/10 bg-[#0A0E27]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00D4FF 0%, #00FFA3 100%)' }}
              >
                <span className="text-[#0A0E27] text-xs font-black">Z</span>
              </div>
              <span className="font-semibold tracking-tight">Zeinyra Assessment</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm ${
                locked ? 'bg-red-500/20 text-red-300' : 'bg-white/5 text-[#00D4FF]'
              }`}
            >
              <Timer size={16} />
              {started ? formatTime(secondsLeft) : '10:00'}
            </div>
            {!started ? (
              <button
                type="button"
                onClick={handleStart}
                disabled={!acknowledged}
                className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: acknowledged
                    ? 'linear-gradient(135deg, #00D4FF 0%, #00FFA3 100%)'
                    : 'rgba(255,255,255,0.1)',
                  color: acknowledged ? '#0A0E27' : '#9ca3af',
                }}
              >
                Start assessment
              </button>
            ) : (
              <span className="text-xs text-gray-400">
                {locked ? 'Time is up' : 'Timer running'}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div
          className="rounded-xl px-4 py-3 flex gap-3 items-start"
          style={{
            background: 'rgba(255, 80, 80, 0.1)',
            border: '1px solid rgba(255, 100, 100, 0.35)',
          }}
        >
          <ShieldAlert className="text-red-300 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-red-200">Important rule — No AI</p>
            <p className="text-sm text-red-100/80 mt-1">
              Do not use ChatGPT, Claude, Copilot, Cursor Agent, Gemini, or any other AI assistant.
              Use only your own knowledge and the starter code / tests provided here.
            </p>
          </div>
        </div>

        {!started && (
          <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1"
            />
            <span>
              I acknowledge that I will not use any AI tools during this technical assessment.
            </span>
          </label>
        )}

        <section className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">SimpleVault — 10 minute task</h1>
          <p className="text-gray-400 text-sm max-w-3xl">
            Implement <code className="text-[#00D4FF]">deposit</code>,{' '}
            <code className="text-[#00D4FF]">withdraw</code> (checks-effects-interactions), and
            owner-only <code className="text-[#00D4FF]">pause</code> /{' '}
            <code className="text-[#00D4FF]">unpause</code>. Emit <code className="text-[#00D4FF]">Deposit</code>{' '}
            and <code className="text-[#00D4FF]">Withdraw</code>. Do not edit the tests.
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-4 min-h-[60vh]">
          <div className="flex flex-col rounded-xl border border-white/10 overflow-hidden bg-black/30">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
              <span className="text-xs font-medium text-gray-300">Vault.sol</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!started || locked}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40"
                >
                  <RotateCcw size={12} /> Reset
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10"
                >
                  <Download size={12} /> Download
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!started || locked}
              spellCheck={false}
              className="flex-1 min-h-[420px] w-full bg-transparent p-3 font-mono text-xs sm:text-sm text-gray-100 outline-none resize-none disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/30 flex flex-col min-h-[220px]">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
                <span className="text-xs font-medium text-gray-300">Checks</span>
                <button
                  type="button"
                  onClick={handleRunChecks}
                  disabled={!started}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, #00D4FF 0%, #00FFA3 100%)',
                    color: '#0A0E27',
                  }}
                >
                  <Play size={12} /> Run checks
                </button>
              </div>
              <div className="p-3 space-y-2">
                {results ? (
                  <>
                    <p className="text-sm text-gray-300 mb-2">
                      {passedCount}/{results.length} passed
                      {locked ? ' · final score' : ''}
                    </p>
                    {results.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-start gap-2 text-sm rounded-lg px-2 py-1.5 bg-white/[0.03]"
                      >
                        {r.passed ? (
                          <CheckCircle2 size={16} className="text-[#00FFA3] shrink-0 mt-0.5" />
                        ) : (
                          <Circle size={16} className="text-gray-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className={r.passed ? 'text-[#00FFA3]' : 'text-gray-200'}>{r.name}</p>
                          <p className="text-xs text-gray-500">{r.detail}</p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    Start the assessment, edit the contract, then run checks.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/30 flex-1">
              <div className="px-3 py-2 border-b border-white/10 bg-white/5">
                <span className="text-xs font-medium text-gray-300">Vault.t.sol (read-only)</span>
              </div>
              <pre className="p-3 text-[11px] sm:text-xs font-mono text-gray-400 overflow-auto max-h-[320px] whitespace-pre-wrap">
                {vaultTests}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
