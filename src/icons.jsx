import React from 'react';

const shapes = {
  Activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
  ArrowDownLeft: <><path d="m17 7-10 10"/><path d="M17 17H7V7"/></>,
  ArrowRight: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
  ArrowUpRight: <><path d="M7 17 17 7"/><path d="M7 7h10v10"/></>,
  BarChart3: <><path d="M3 3v18h18"/><path d="M8 16v-4"/><path d="M13 16V8"/><path d="M18 16V5"/></>,
  CalendarDays: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>,
  Check: <path d="m4 12 5 5L20 6"/>,
  CircleDollarSign: <><circle cx="12" cy="12" r="10"/><path d="M16 8h-5a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H8M12 6v2M12 16v2"/></>,
  CreditCard: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></>,
  Edit3: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4Z"/></>,
  LayoutDashboard: <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>,
  LockKeyhole: <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4M12 15v2"/></>,
  LogOut: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></>,
  Menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  Plus: <path d="M12 5v14M5 12h14"/>,
  Search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
  Settings2: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="white"/><circle cx="15" cy="17" r="2" fill="white"/></>,
  ShieldCheck: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
  Trash2: <><path d="M3 6h18M8 6V4h8v2M5 6l1 15h12l1-15M10 11v6M14 11v6"/></>,
  Wallet: <><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 8V5a2 2 0 0 1 2-2h13"/><path d="M16 14h5"/></>,
  X: <path d="M18 6 6 18M6 6l12 12"/>,
};
function icon(name) {
  return function Icon({ size=24, className, ...rest }) {
    return <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>{shapes[name]}</svg>;
  };
}
export const Activity=icon('Activity'), ArrowDownLeft=icon('ArrowDownLeft'), ArrowRight=icon('ArrowRight'), ArrowUpRight=icon('ArrowUpRight'), BarChart3=icon('BarChart3'), CalendarDays=icon('CalendarDays'), Check=icon('Check'), CircleDollarSign=icon('CircleDollarSign'), CreditCard=icon('CreditCard'), Edit3=icon('Edit3'), LayoutDashboard=icon('LayoutDashboard'), LockKeyhole=icon('LockKeyhole'), LogOut=icon('LogOut'), Menu=icon('Menu'), Plus=icon('Plus'), Search=icon('Search'), Settings2=icon('Settings2'), ShieldCheck=icon('ShieldCheck'), Trash2=icon('Trash2'), Wallet=icon('Wallet'), X=icon('X');
