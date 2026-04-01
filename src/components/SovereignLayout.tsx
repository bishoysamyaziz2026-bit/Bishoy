import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Scale, Menu, Wallet, Crown, Loader2, Briefcase, Users } from 'lucide-react';
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
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden flex flex-col matte-black" dir="rtl">
      {/* Top Bar */}
      <div className="px-4 py-3 flex justify-between items-center relative z-50 w-full">
        <button onClick={() => setSidebarOpen(true)} className="w-11 h-11 glass-panel rounded-xl flex items-center justify-center border border-border hover:bg-accent transition-all">
          <Menu size={18} className="text-muted-foreground" />
        </button>
        <Link to="/pricing">
          <div className="glass-panel border border-border px-4 py-2 rounded-2xl flex items-center gap-3 btn-hover">
            {sovereign.isOwner ? <Crown size={16} className="text-primary animate-pulse" /> : <Wallet size={16} className="text-muted-foreground" />}
            <div className="flex items-baseline gap-1.5">
              <span className={`text-lg font-black tabular-nums ${sovereign.isOwner ? 'text-primary neon-text' : 'text-foreground'}`}>{balance}</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">{sovereign.isOwner ? 'ADMIN' : 'EGP'}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-none pb-24">
        <div className="w-full h-full">
          {isUserLoading ? (
            <div className="h-full flex items-center justify-center opacity-20"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>
          ) : children}
        </div>
      </main>

      <SovereignSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Floating Dock - iOS Style */}
      <div className="fixed bottom-5 inset-x-0 z-50 px-4">
        <div className="max-w-sm mx-auto floating-dock rounded-[2rem] p-2 flex items-center justify-around">
          <DockItem href="/" active={location.pathname === '/'} icon={<Scale size={18} />} label="الرئيسية" />
          <DockItem href="/bot" active={location.pathname === '/bot'} icon={<MessageSquare size={18} />} label="البوت" />
          <DockItem href="/dashboard" active={location.pathname === '/dashboard'} icon={<Briefcase size={18} />} label="حسابي" />
          <DockItem href="/consultants" active={location.pathname === '/consultants'} icon={<Users size={18} />} label="الخبراء" />
          {sovereign.isOwner && <DockItem href="/admin" active={location.pathname === '/admin'} icon={<Crown size={18} />} label="الإدارة" />}
        </div>
      </div>
    </div>
  );
}

function DockItem({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link to={href} className="flex-1">
      <button className={`w-full py-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'bg-primary/15 text-primary shadow-neon' : 'text-muted-foreground hover:text-foreground'}`}>
        {icon}
        <span className="text-[9px] font-bold">{label}</span>
      </button>
    </Link>
  );
}
