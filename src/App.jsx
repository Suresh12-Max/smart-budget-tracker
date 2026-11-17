import React, { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, BarChart3, CalendarDays, Check, CircleDollarSign, CreditCard, Edit3, LayoutDashboard, LockKeyhole, LogOut, Menu, Plus, Search, Settings2, ShieldCheck, Trash2, Wallet, X } from './icons.jsx';
import { configured, supabase, fetchRecords, saveTransaction, removeTransaction, saveBudget } from './data.js';
import { calculateSummary, categoryTotals, COLOURS, EXPENSE_CATEGORIES, INCOME_CATEGORIES, currentMonth, money, validateTransaction } from './math.mjs';

const MENU = [
  { id: 'overview', title: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', title: 'Transactions', icon: CreditCard },
  { id: 'budgets', title: 'My budget', icon: Wallet },
  { id: 'insights', title: 'Insights', icon: BarChart3 },
];
const monthLabel = month => new Date(`${month}-01T12:00:00`).toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' });
const dayLabel = date => new Date(`${date}T12:00:00`).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
const TODAY = () => new Date().toLocaleDateString('en-CA');

function Auth() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault(); setMessage(''); setBusy(true);
    try {
      const result = mode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      if (mode === 'register' && !result.data.session) setMessage('Account created. Check your email for the verification link, then sign in.');
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  return <div className="auth-shell">
    <div className="auth-info"><div className="brand brand-auth"><span className="brand-mark"><Activity size={24} /></span> Ledgerly<span className="brand-dot">.</span></div>
      <div><span className="eyebrow light">THE STUDENT MONEY COMPANION</span><h1>Know where your<br/><em>money goes.</em></h1><p>Keep your income, spending and monthly budget together in one secure, simple place.</p></div>
      <div className="auth-foot"><ShieldCheck size={18}/> Your financial records stay private to your account.</div>
    </div>
    <div className="auth-panel"><div className="auth-card"><span className="pill">LET'S GET STARTED</span><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p>{mode === 'login' ? 'Sign in to continue managing your money.' : 'Set up your personal budget workspace.'}</p>
      <form onSubmit={submit} className="form-col"><label>Email address<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@example.com" autoComplete="email" /></label>
        <label>Password<input type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete={mode==='login'?'current-password':'new-password'} /></label>
        {message && <p role="status" className="notice">{message}</p>}
        <button className="btn primary wide" disabled={busy}>{busy?'Please wait...':mode==='login'?'Sign in':'Create account'} <ArrowRight size={17}/></button>
      </form><div className="auth-switch">{mode==='login'?'New to Ledgerly?':'Already have an account?'} <button className="link-button" onClick={()=>{setMode(mode==='login'?'register':'login');setMessage('');}}>{mode==='login'?'Create an account':'Sign in'}</button></div>
      <p className="tiny-note">This is an assessment prototype. Use fictional financial entries, not sensitive banking information.</p>
    </div></div>
  </div>;
}

function TransactionModal({ initial, onClose, onSave }) {
  const [kind, setKind] = useState(initial?.kind || 'expense');
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  const [category, setCategory] = useState(initial?.category || 'Food');
  const [date, setDate] = useState(initial?.transaction_date || TODAY());
  const [note, setNote] = useState(initial?.note || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { const handler=e=>{if(e.key==='Escape')onClose();}; window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[onClose]);
  async function submit(event) {
    event.preventDefault();
    const record = { kind, amount, category, transaction_date: date, note: note.trim() };
    const validation = validateTransaction(record);
    if (validation) { setError(validation); return; }
    setSaving(true); setError('');
    try { await onSave({ ...record, amount: Number(amount) }, initial?.id); onClose(); }
    catch (err) { setError(err.message); } finally { setSaving(false); }
  }
  return <div className="modal-scrim" onMouseDown={e=>e.target===e.currentTarget && onClose()} role="presentation">
    <section className="modal" role="dialog" aria-modal="true" aria-label={initial?'Edit transaction':'Add transaction'}><div className="modal-head"><div><span className="eyebrow">YOUR MONEY</span><h2>{initial?'Edit transaction':'New transaction'}</h2></div><button className="icon-button" aria-label="Close" onClick={onClose}><X size={20}/></button></div>
      <form onSubmit={submit} className="form-col"><div className="toggle-row"><button type="button" className={kind==='expense'?'toggle active':'toggle'} onClick={()=>{setKind('expense');setCategory('Food');}}>Expense</button><button type="button" className={kind==='income'?'toggle active':'toggle'} onClick={()=>{setKind('income');setCategory('Wages');}}>Income</button></div>
        <label>Amount in NZD<input type="number" inputMode="decimal" min="0.01" max="99999999.99" step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" autoFocus /></label>
        <div className="form-grid"><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{(kind==='expense'?EXPENSE_CATEGORIES:INCOME_CATEGORIES).map(c=><option key={c}>{c}</option>)}</select></label>
          <label>Date<input type="date" required value={date} onChange={e=>setDate(e.target.value)}/></label></div>
        <label>Description (optional)<input maxLength={160} value={note} onChange={e=>setNote(e.target.value)} placeholder="What was this for?" /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={saving} className="btn primary wide">{saving?'Saving...':initial?'Save changes':'Add transaction'} <Check size={17}/></button>
      </form>
    </section>
  </div>;
}

function Stat({ title, value, hint, icon: Icon, tone }) {
  return <div className="stat"><div className="stat-title"><span>{title}</span><div className={`stat-icon ${tone}`}><Icon size={19}/></div></div><div className="stat-value">{value}</div><span className="stat-hint">{hint}</span></div>;
}
function SpendChart({ categories, total }) {
  const width=250, radius=82, circ=2*Math.PI*radius;
  let at=0;
  return <div className="spend-flex"><div className="donut-wrap"><svg className="donut" viewBox="0 0 250 250" aria-label="Expense distribution by category" role="img"><circle cx="125" cy="125" r={radius} fill="none" stroke="#e9edf4" strokeWidth="25" />
    {categories.map((item,i)=>{const length=total>0?item.amount/total*circ:0; const start=at; at+=length; return <circle key={item.category} cx="125" cy="125" r={radius} fill="none" stroke={COLOURS[item.category] || '#94a3b8'} strokeWidth="25" strokeDasharray={`${Math.max(0,length-2)} ${circ}`} strokeDashoffset={-start} transform="rotate(-90 125 125)"/>;})}</svg>
    <div className="donut-center"><span>Total spent</span><strong>{money(total)}</strong></div></div>
    <div className="legend">{categories.length===0?<p className="muted">No spending yet for this month.</p>:categories.map(item=><div className="legend-item" key={item.category}><span className="legend-name"><span className="legend-dot" style={{background:COLOURS[item.category]||'#94a3b8'}}/>{item.category}</span><strong>{Math.round(item.amount/total*100)}%</strong></div>)}</div></div>;
}
function Progress({ value, max, barColor }) { const pct=max>0?Math.min(100,value/max*100):0; return <div className="progress" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={Math.max(0,Math.round(max))}><div style={{width:`${pct}%`,background:barColor||'#4f46e5'}}/></div>; }

function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(!configured);
  const [page, setPage] = useState('overview');
  const [month, setMonth] = useState(currentMonth());
  const [rows, setRows] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(undefined);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [budgetValue, setBudgetValue] = useState('');
  const [budgetBusy, setBudgetBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const userId = session?.user?.id;

  useEffect(() => {
    if (!configured) return;
    supabase.auth.getSession().then(({data,error})=>{if(error)setError(error.message);setSession(data?.session||null);setAuthReady(true);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,newSession)=>{setSession(newSession);setAuthReady(true);});
    return ()=>subscription.unsubscribe();
  },[]);
  async function reload() {
    setLoading(true);setError('');
    try { const data=await fetchRecords(userId);setRows(data.transactions);setBudgets(data.budgets); }
    catch(err){setError(`Could not load your data: ${err.message}`);}finally{setLoading(false);}
  }
  useEffect(()=>{if(!configured || userId) reload();else{setRows([]);setBudgets([]);setLoading(false);}},[userId]);
  const budget=Number(budgets.find(b=>b.month===`${month}-01`)?.limit_amount||0);
  useEffect(()=>setBudgetValue(budget?String(budget):''),[budget,month]);
  const summary=useMemo(()=>calculateSummary(rows,month,budget),[rows,month,budget]);
  const categories=useMemo(()=>categoryTotals(rows,month),[rows,month]);
  const monthly=useMemo(()=>rows.filter(t=>t.transaction_date.startsWith(month)).sort((a,b)=>b.transaction_date.localeCompare(a.transaction_date)),[rows,month]);
  const filtered=monthly.filter(t=>(filter==='all'||t.kind===filter)&&`${t.category} ${t.note||''}`.toLowerCase().includes(search.toLowerCase()));
  const displayName=configured?(session?.user?.email?.split('@')[0]||'Student'):'Alex';
  const initial=displayName[0]?.toUpperCase()||'S';
  function flash(msg){setToast(msg);window.setTimeout(()=>setToast(''),3500);}
  async function saveRecord(record,id){await saveTransaction(userId,record,id);await reload();flash(id?'Transaction updated':'Transaction added');}
  async function deleteRecord(row){if(!window.confirm(`Delete this ${row.kind} record for ${money(row.amount)}?`))return;try{await removeTransaction(userId,row.id);await reload();flash('Transaction deleted');}catch(err){setError(err.message);}}
  async function submitBudget(event){event.preventDefault();const n=Number(budgetValue);if(!Number.isFinite(n)||n<0||n>99999999.99||!/^\d+(\.\d{1,2})?$/.test(budgetValue)){setError('Enter a valid budget amount (0 or more, max 2 decimals).');return;}setBudgetBusy(true);setError('');try{await saveBudget(userId,month,n);await reload();flash('Monthly budget saved');}catch(err){setError(err.message);}finally{setBudgetBusy(false);}}
  const tableRows=(items,limit)=> <div className="table-wrap"><table><thead><tr><th>Transaction</th><th>Date</th><th>Category</th><th className="align-right">Amount</th><th className="align-right">Actions</th></tr></thead><tbody>{items.slice(0,limit).map(t=><tr key={t.id}><td><div className="trans-main"><span className={`trans-icon ${t.kind}`}><>{t.kind==='income'?<ArrowDownLeft size={18}/>:<ArrowUpRight size={18}/>}</></span><div><strong>{t.note||t.category}</strong><small>{t.kind==='income'?'Income':'Expense'}</small></div></div></td><td>{dayLabel(t.transaction_date)}</td><td><span className="category-chip">{t.category}</span></td><td className={`align-right amount ${t.kind}`}>{t.kind==='income'?'+':'-'}{money(t.amount)}</td><td className="align-right"><div className="actions"><button className="mini-icon" aria-label={`Edit ${t.note||t.category}`} onClick={()=>setModal(t)}><Edit3 size={16}/></button><button className="mini-icon danger" aria-label={`Delete ${t.note||t.category}`} onClick={()=>deleteRecord(t)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table>{!items.length&&<div className="empty"><CreditCard size={28}/><h3>No transactions found</h3><p>Add a record or change the filters to see transactions here.</p></div>}</div>;

  if(!authReady) return <div className="center-loader">Checking your session...</div>;
  if(configured&&!session) return <Auth/>;
  return <div className="app-shell">
    {menuOpen&&<div className="mobile-overlay" onClick={()=>setMenuOpen(false)}/>}
    <aside className={`sidebar ${menuOpen?'show':''}`}><div className="brand"><span className="brand-mark"><Activity size={23}/></span>Ledgerly<span className="brand-dot">.</span></div><div className="workspace-label">WORKSPACE</div>
      <nav aria-label="Main navigation">{MENU.map(({id,title,icon:Icon})=><button key={id} onClick={()=>{setPage(id);setMenuOpen(false);}} className={page===id?'nav-item selected':'nav-item'}><Icon size={20}/>{title}{page===id&&<span className="nav-indicator"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><span className="tip-icon"><ShieldCheck size={19}/></span><strong>Every dollar counts.</strong><p>Small money habits make a big difference.</p></div><button className="profile" onClick={()=>setPage('settings')}><span className="avatar">{initial}</span><span><strong>{displayName}</strong><small>{configured?'Personal account':'Demo account'}</small></span><Settings2 size={17}/></button></div>
    </aside>
    <div className="main-area"><header className="topbar"><div className="top-left"><button className="mobile-menu icon-button" aria-label="Open menu" onClick={()=>setMenuOpen(true)}><Menu size={21}/></button><span className="breadcrumb">My workspace</span><span className="slash">/</span><strong>{MENU.find(item=>item.id===page)?.title||'Settings'}</strong></div><div className="top-right"><span className="today"><CalendarDays size={17}/>{new Date().toLocaleDateString('en-NZ',{day:'numeric',month:'short',year:'numeric'})}</span><span className="avatar small">{initial}</span></div></header>
      <main className="content">
        {!configured&&<div className="demo-alert"><LockKeyhole size={18}/><span><strong>Local demonstration mode.</strong> Sample and new entries are stored in this browser only. Connect Supabase to enable real accounts and secure cloud data.</span><span className="demo-label">DEMO</span></div>}
        {error&&<div role="alert" className="error-banner">{error}<button aria-label="Dismiss error" onClick={()=>setError('')}><X size={16}/></button></div>}
        {toast&&<div role="status" className="toast"><Check size={16}/>{toast}</div>}
        <div className="page-head"><div><span className="eyebrow">YOUR FINANCIAL SPACE</span><h1>{page==='overview'?`Hey, ${displayName.charAt(0).toUpperCase()+displayName.slice(1)}! 👋`:MENU.find(item=>item.id===page)?.title||'Account settings'}</h1><p>{page==='overview'?'Here is what your money is doing this month.':page==='transactions'?'Keep every incoming and outgoing dollar organised.':page==='budgets'?'Plan your monthly spending with confidence.':page==='insights'?'Understand your biggest spending categories.':'Manage your account and privacy.'}</p></div><div className="head-actions">{page!=='settings'&&<label className="month-input"><CalendarDays size={17}/><input aria-label="Select month" type="month" value={month} onChange={e=>setMonth(e.target.value||currentMonth())}/></label>}{page!=='settings'&&<button className="btn primary" onClick={()=>setModal(null)}><Plus size={18}/> Add transaction</button>}</div></div>
        {loading?<div className="center-loader">Loading your records...</div>:<>
          {page==='overview'&&<><div className="stats-grid"><Stat title="Total income" value={money(summary.income)} hint="Received this month" icon={ArrowDownLeft} tone="green"/><Stat title="Total expenses" value={money(summary.expenses)} hint="Spent this month" icon={ArrowUpRight} tone="red"/><Stat title="Available balance" value={money(summary.balance)} hint="Income minus expenses" icon={Wallet} tone="blue"/><Stat title="Budget left" value={budget?money(summary.remaining):'Not set'} hint={budget?summary.remaining<0?'Budget exceeded':`${summary.percent}% of budget used`:'Set a budget below'} icon={CircleDollarSign} tone="purple"/></div>
            <div className="two-col"><section className="panel"><div className="panel-head"><div><h2>Spending breakdown</h2><p>Where your money went in {monthLabel(month)}</p></div><button className="subtle-link" onClick={()=>setPage('insights')}>Insights <ArrowRight size={16}/></button></div><SpendChart categories={categories} total={summary.expenses}/></section>
            <section className="panel"><div className="panel-head"><div><h2>Monthly budget</h2><p>Stay on top of your limit</p></div><span className="soft-tag">{monthLabel(month)}</span></div><div className="budget-hero"><span>Budget remaining</span><strong>{budget?money(summary.remaining):'No budget yet'}</strong><p>{budget?`${money(summary.expenses)} spent out of ${money(budget)}`:'Set a monthly budget to track progress.'}</p></div><Progress value={summary.expenses} max={budget}/><div className="budget-summary"><span>0%</span><strong className={summary.percent>100?'over':''}>{budget?`${summary.percent}% used`:'Not set'}</strong><span>100%</span></div>{budget>0&&summary.percent>=80&&<div className="budget-warning">{summary.percent>100?'You are above your budget.':'You are approaching your budget limit.'}</div>}<button className="btn outline wide" onClick={()=>setPage('budgets')}>{budget?'Edit monthly budget':'Set monthly budget'} <ArrowRight size={17}/></button></section></div>
            <section className="panel table-panel"><div className="panel-head"><div><h2>Recent transactions</h2><p>Your latest activity for {monthLabel(month)}</p></div><button className="subtle-link" onClick={()=>setPage('transactions')}>View all <ArrowRight size={16}/></button></div>{tableRows(monthly,5)}</section></>}
          {page==='transactions'&&<section className="panel table-panel"><div className="panel-head"><div><h2>Transaction history</h2><p>{monthly.length} records in {monthLabel(month)}</p></div><div className="filters"><label className="searchbox"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search records" aria-label="Search records"/></label><select aria-label="Filter transactions" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select></div></div>{tableRows(filtered,1000)}</section>}
          {page==='budgets'&&<div className="two-col budgets-page"><section className="panel"><div className="panel-head"><div><h2>Set your spending limit</h2><p>{monthLabel(month)} budget</p></div><Wallet size={23} className="icon-muted"/></div><form onSubmit={submitBudget} className="budget-form"><label>Monthly expense budget (NZD)<input type="number" step="0.01" min="0" max="99999999.99" value={budgetValue} onChange={e=>setBudgetValue(e.target.value)} placeholder="e.g. 1000.00" required/></label><p className="small-text">This amount is your expense limit, independent of income. Use 0 to clear it.</p><button className="btn primary" disabled={budgetBusy}>{budgetBusy?'Saving...':'Save monthly budget'} <Check size={17}/></button></form></section>
              <section className="panel"><div className="panel-head"><div><h2>Budget health</h2><p>How you are tracking</p></div><span className="soft-tag">Live calculation</span></div><div className="budget-hero compact"><span>Your budget</span><strong>{money(summary.budget)}</strong><p>{money(summary.expenses)} spent this month</p></div><Progress value={summary.expenses} max={summary.budget}/><p className="budget-detail">{budget?`${money(Math.abs(summary.remaining))} ${summary.remaining>=0?'left to spend':'over budget'}`:'Set a budget to activate tracking.'}</p></section></div>}
          {page==='insights'&&<div className="two-col"><section className="panel"><div className="panel-head"><div><h2>Expenses by category</h2><p>{monthLabel(month)} breakdown</p></div></div><SpendChart categories={categories} total={summary.expenses}/></section><section className="panel"><div className="panel-head"><div><h2>Category ranking</h2><p>Highest spending first</p></div></div>{categories.length?categories.map(item=><div className="rank-row" key={item.category}><div><span className="rank-dot" style={{background:COLOURS[item.category]||'#94a3b8'}}/>{item.category}<strong>{money(item.amount)}</strong></div><Progress value={item.amount} max={summary.expenses} barColor={COLOURS[item.category]||'#94a3b8'}/></div>):<div className="empty"><BarChart3 size={28}/><p>No expense data yet.</p></div>}</section></div>}
          {page==='settings'&&<section className="panel settings-panel"><div className="panel-head"><div><h2>Account and data</h2><p>Information about this prototype</p></div><ShieldCheck size={24} className="icon-muted"/></div><div className="setting-line"><strong>Mode</strong><span>{configured?'Connected Supabase account':'Local demo - browser storage only'}</span></div><div className="setting-line"><strong>Account</strong><span>{session?.user?.email||'Demo user (no authentication)'}</span></div><div className="setting-line"><strong>Data policy</strong><span>Do not enter banking passwords or card information.</span></div>{configured&&<button className="btn outline" onClick={()=>supabase.auth.signOut()}><LogOut size={17}/> Sign out</button>}{!configured&&<p className="small-text">To activate sign-up and private database records, follow the setup guide included with the source files.</p>}</section>}
        </>}
        <footer className="footer">Ledgerly | COMP.6207 Special Topic prototype · NZD · For educational use</footer>
      </main>
    </div>
    {modal!==undefined&&<TransactionModal initial={modal} onClose={()=>setModal(undefined)} onSave={saveRecord}/ >}
  </div>;
}
export default App;
