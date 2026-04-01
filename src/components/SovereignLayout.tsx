import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, ArrowUp, Menu, Wallet, Crown, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@/firebase/provider';
import SovereignSidebar from '@/components/SovereignSidebar';
import { checkSovereignStatus, getBalance } from '@/lib/roles';

interface SovereignLayoutProps {
  children: React.ReactNode;
  activeId: string;
}

export default function SovereignLayout({ children, activeId }: SovereignLayoutProps) {
  const location = useLocation();
  const { profile, user, isUserLoading } = useUser();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const sovereign = checkSovereignStatus(user?.email);
  const balance = getBalance(profile);

  return (
    <div className="fixed inset-0 bg-background text-foreground font-sans overflow-hidden flex flex-col matte-black" dir="rtl">
      <div className="p-8 md:p-12 flex justify-between items-center relative z-50 w-full">
        <button onClick={() => setSidebarOpen(true)} className="w-20 h-20 glass-cosmic rounded-[2.5rem] flex items-center justify-center border border-border hover:bg-accent transition-all shadow-3xl">
          <Menu size={36} className="text-muted-foreground" />
        </button>
        <Link to="/pricing">
          <div className="glass-cosmic border border-border px-12 py-6 rounded-[3.5rem] flex items-center gap-10 shadow-3xl hover:bg-accent transition-all group">
            {sovereign.isOwner ? <Crown size={40} className="text-primary animate-pulse" /> : <Wallet size={40} className="text-muted-foreground" />}
            <div className="flex flex-col items-end">
              <span className={`text-6xl font-black tabular-nums leading-none ${sovereign.isOwner ? 'text-primary' : 'text-foreground'}`}>{balance}</span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] mt-2">{sovereign.isOwner ? 'SUPREME AUTHORITY' : 'SOVEREIGN UNITS'}</span>
            </div>
          </div>
        </Link>
      </div>

      <main className="flex-1 overflow-y-auto scrollbar-none pb-40">
        <div className="w-full h-full">
          {isUserLoading ? (
            <div className="h-full flex items-center justify-center opacity-20"><Loader2 className="animate-spin text-primary h-20 w-20" /></div>
          ) : children}
        </div>
      </main>

      <SovereignSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="fixed bottom-12 inset-x-0 z-50 px-10">
        <div className="max-w-3xl mx-auto glass-cosmic rounded-[5rem] p-5 flex items-center justify-between border border-border shadow-3xl">
          <DockItem href="/bot" active={location.pathname === '/bot'} icon={<MessageSquare size={44} />} />
          <DockItem href="/dashboard" active={location.pathname === '/dashboard'} icon={<User size={44} />} />
          {sovereign.isOwner && <DockItem href="/admin" active={location.pathname === '/admin'} icon={<Crown size={44} />} />}
          <DockItem href="/" active={location.pathname === '/'} icon={<ArrowUp size={44} />} />
        </div>
      </div>
    </div>
  );
}

function DockItem({ href, active, icon }: any) {
  return (
    <Link to={href} className="flex-1">
      <button className={`w-full h-28 rounded-[4rem] flex items-center justify-center transition-all duration-500 ${active ? 'bg-primary text-primary-foreground shadow-3xl scale-110' : 'text-muted-foreground hover:text-foreground'}`}>
        {icon}
      </button>
    </Link>
  );
}
