export const EXPENSE_CATEGORIES = ['Rent', 'Food', 'Transport', 'Study', 'Bills', 'Entertainment', 'Health', 'Other'];
export const INCOME_CATEGORIES = ['Wages', 'Student support', 'Family', 'Scholarship', 'Other'];
export const COLOURS = {
  Rent: '#4f46e5', Food: '#0d9488', Transport: '#f59e0b', Study: '#a855f7',
  Bills: '#f43f5e', Entertainment: '#3b82f6', Health: '#14b8a6', Other: '#94a3b8',
};

export function monthKey(date) {
  return String(date ?? '').slice(0, 7);
}
export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
export function money(amount) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(Number(amount) || 0);
}
export function calculateSummary(transactions, month, budget = 0) {
  const rows = transactions.filter(t => monthKey(t.transaction_date) === month);
  const income = round2(rows.filter(t => t.kind === 'income').reduce((a, t) => a + Number(t.amount), 0));
  const expenses = round2(rows.filter(t => t.kind === 'expense').reduce((a, t) => a + Number(t.amount), 0));
  const limit = round2(Math.max(0, Number(budget) || 0));
  return { income, expenses, balance: round2(income - expenses), budget: limit,
    remaining: round2(limit - expenses), percent: limit > 0 ? Math.round(expenses / limit * 100) : 0,
    count: rows.length };
}
export function categoryTotals(transactions, month) {
  const totals = new Map();
  for (const row of transactions) {
    if (row.kind !== 'expense' || monthKey(row.transaction_date) !== month) continue;
    totals.set(row.category, round2((totals.get(row.category) || 0) + Number(row.amount)));
  }
  return [...totals].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
}
export function round2(n) { return Math.round((Number(n) + Number.EPSILON) * 100) / 100; }
export function validateTransaction(record) {
  const amount = Number(record.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 99999999.99 || !/^\d+(\.\d{1,2})?$/.test(String(record.amount).trim()))
    return 'Enter an amount greater than zero, with no more than two decimal places.';
  if (!['income', 'expense'].includes(record.kind)) return 'Choose income or expense.';
  const allowed = record.kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (!allowed.includes(record.category)) return 'Choose a valid category.';
  const iso = String(record.transaction_date);
  const parsed = new Date(`${iso}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0,10) !== iso)
    return 'Choose a valid transaction date.';
  if (String(record.note || '').length > 160) return 'Description must be 160 characters or fewer.';
  return null;
}
