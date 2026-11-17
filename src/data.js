import { createClient } from '@supabase/supabase-js';
import { currentMonth } from './math.mjs';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured = Boolean(url && key && !url.includes('YOUR_PROJECT') && !key.includes('YOUR_'));
export const supabase = configured ? createClient(url, key) : null;

const demoKey = 'ledgerly-student-demo-v1';
function shiftDate(month, day) { return `${month}-${String(day).padStart(2, '0')}`; }
function sample() {
  const month = currentMonth();
  const entries = [
    ['income', 'Wages', 880, 2, 'Part-time shift pay'],
    ['income', 'Student support', 340, 8, 'Weekly support'],
    ['expense', 'Rent', 440, 3, 'Flat rent'],
    ['expense', 'Food', 86.5, 5, 'Groceries'],
    ['expense', 'Transport', 39.2, 7, 'Fuel and bus'],
    ['expense', 'Study', 64, 10, 'Textbooks'],
    ['expense', 'Bills', 58, 12, 'Phone and internet'],
    ['expense', 'Entertainment', 28, 13, 'Cinema'],
  ];
  return { transactions: entries.map(([kind, category, amount, day, note], i) => ({
    id: `demo-${i + 1}`, kind, category, amount, transaction_date: shiftDate(month, day), note,
  })), budgets: [{ month: `${month}-01`, limit_amount: 1000 }] };
}
function demoRead() {
  try { const existing = localStorage.getItem(demoKey); if (existing) return JSON.parse(existing); } catch { /* safe reset */ }
  const initial = sample(); localStorage.setItem(demoKey, JSON.stringify(initial)); return initial;
}
function demoWrite(data) { localStorage.setItem(demoKey, JSON.stringify(data)); }
export async function fetchRecords(userId) {
  if (!configured) return demoRead();
  const [t, b] = await Promise.all([
    supabase.from('transactions').select('id,kind,category,amount,note,transaction_date').eq('user_id', userId).order('transaction_date', { ascending: false }),
    supabase.from('budgets').select('id,month,limit_amount').eq('user_id', userId),
  ]);
  if (t.error) throw t.error;
  if (b.error) throw b.error;
  return { transactions: t.data, budgets: b.data };
}
export async function saveTransaction(userId, record, id) {
  if (!configured) {
    const data = demoRead();
    const next = { ...record, id: id || crypto.randomUUID() };
    data.transactions = id ? data.transactions.map(t => t.id === id ? next : t) : [next, ...data.transactions];
    demoWrite(data); return;
  }
  const query = id
    ? supabase.from('transactions').update(record).eq('id', id).eq('user_id', userId).select('id')
    : supabase.from('transactions').insert({ ...record, user_id: userId }).select('id');
  const { data, error } = await query.single();
  if (error) throw error;
  if (!data) throw new Error('Transaction could not be saved.');
}
export async function removeTransaction(userId, id) {
  if (!configured) { const data = demoRead(); data.transactions = data.transactions.filter(t => t.id !== id); demoWrite(data); return; }
  const { data, error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('Transaction was not found or permission was denied.');
}
export async function saveBudget(userId, month, value) {
  const first = `${month}-01`;
  if (!configured) { const data = demoRead(); data.budgets = data.budgets.filter(b => b.month !== first).concat([{ month: first, limit_amount: value }]); demoWrite(data); return; }
  const { error } = await supabase.from('budgets').upsert({ user_id: userId, month: first, limit_amount: value }, { onConflict: 'user_id,month' });
  if (error) throw error;
}
