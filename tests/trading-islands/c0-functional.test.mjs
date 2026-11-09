import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { RuntimeEvidenceDiagnostics } from '../../src/trading/activity/RuntimeEvidenceDiagnostics.tsx';
import { mockTradingBots } from '../../src/trading/bots/fixtures.ts';
import { mockStrategies } from '../../src/trading/strategy/fixtures.ts';
import { reviewPaperRisk } from '../../src/trading/risk/review.ts';
import { runBotRuntimeStep } from '../../src/trading/runtime/botRuntime.ts';
import { createPaperAccount } from '../../src/trading/paper/engine.ts';

// tsx defaults to the classic JSX transform in this repository without a global tsconfig.
globalThis.React = React;

test('Activity diagnostics render without undefined subscriptions', () => {
  assert.ok(renderToString(React.createElement(RuntimeEvidenceDiagnostics)).length > 0);
});

test('every initial bot resolves an existing strategy', () => {
  for (const bot of mockTradingBots) {
    assert.ok(mockStrategies.find(strategy => strategy.id === bot.strategyId));
  }
});

function context() {
  const strategy = mockStrategies[0];
  const bot = { ...mockTradingBots[0], status: 'paper-running' };
  const approval = reviewPaperRisk({ bot, strategy }).review;
  return { bot, strategy, approval, account: createPaperAccount(10000),
    evaluation: { valid: true, invalidated: false, signal: 'entry' },
    market: { marketPrice: 100, quantity: 1 } };
}

test('successful paper fills retain all approval evidence', () => {
  const input = context();
  const result = runBotRuntimeStep(input);
  assert.equal(result.decision, 'paper-filled');
  assert.equal(result.account.orders.length, 1);
  assert.equal(result.approvalReviewId, input.approval.id);
  assert.equal(result.approvalBotId, input.bot.id);
  assert.equal(result.approvalStrategyId, input.strategy.id);
  assert.equal(result.approvalBindingFingerprint, input.approval.bindingFingerprint);
  assert.equal(result.liveExecution, false);
});

test('an altered strategy cannot reuse the earlier approval', () => {
  const input = context();
  input.strategy = { ...input.strategy, risk: { ...input.strategy.risk, stopLossPercent: 3 } };
  const result = runBotRuntimeStep(input);
  assert.equal(result.decision, 'approval-rejected');
  assert.equal(result.account.orders.length, 0);
});
