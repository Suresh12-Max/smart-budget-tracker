import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSummary, categoryTotals, validateTransaction, monthKey } from '../src/math.mjs';

const entries = [
  { kind: 'income', amount: 900.45, category: 'Wages', transaction_date: '2026-11-01' },
  { kind: 'expense', amount: 250.25, category: 'Rent', transaction_date: '2026-11-02' },
  { kind: 'expense', amount: 38.75, category: 'Food', transaction_date: '2026-11-05' },
  { kind: 'expense', amount: 20, category: 'Food', transaction_date: '2026-10-30' },
];
test('monthly totals exclude transactions in other months', () => {
  assert.deepEqual(calculateSummary(entries, '2026-11', 500), {
    income: 900.45, expenses: 289, balance: 611.45, budget: 500,
    remaining: 211, percent: 58, count: 3,
  });
});
test('overspending produces a negative remaining budget', () => {
  assert.equal(calculateSummary(entries, '2026-11', 200).remaining, -89);
});
test('empty month has safe zero totals', () => {
  assert.equal(calculateSummary(entries, '2026-09', 0).percent, 0);
});
test('category totals exclude income and order largest first', () => {
  assert.deepEqual(categoryTotals(entries, '2026-11'), [
    { category: 'Rent', amount: 250.25 }, { category: 'Food', amount: 38.75 },
  ]);
});
test('valid record passes', () => {
  assert.equal(validateTransaction({ kind: 'expense', amount: '50.20', category: 'Food', transaction_date: '2026-11-04', note: '' }), null);
});
test('zero, negative and excessive decimal amounts fail', () => {
  for (const amount of ['0', '-2', '1.999', 'NaN']) assert.ok(validateTransaction({ kind: 'expense', amount, category: 'Food', transaction_date: '2026-11-04' }));
});
test('unexpected category and invalid date format fail', () => {
  assert.ok(validateTransaction({ kind: 'expense', amount: '20', category: 'Wages', transaction_date: '2026-11-04' }));
  assert.ok(validateTransaction({ kind: 'expense', amount: '20', category: 'Food', transaction_date: '4 Nov' }));
  assert.ok(validateTransaction({ kind: 'expense', amount: '20', category: 'Food', transaction_date: '2026-02-30' }));
});
test('monthKey is stable for ISO dates', () => assert.equal(monthKey('2026-11-17'), '2026-11'));
