import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, CreditCard, LogOut, ShieldCheck, LayoutDashboard, Sparkles, FileText, Scale, Crown, Info } from 'lucide-react';
import { useUser } from '@/firebase/provider';
import { roles as ROLES_LIST, checkSovereignStatus, getBalance } from '@/lib/roles';
import { Link } from 'react-router-dom';

interface SovereignSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SovereignSidebar({ isOpen, onClose }: SovereignSidebarProps) {
  const { user, profile, role, signOut } = useUser();
  const sovereign = checkSovereignStatus(user?.email);
  const balance = getBalance(profile);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[280px] bg-card z-[70] border-l border-border shadow-3xl flex flex-col"
          >
            {/* Profile Header */}
            <div className="p-5 flex justify-between items-center border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center text-primary font-black border border-primary/20">
                  {profile?.fullName?.charAt(0) || "U"}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{profile?.fullName || "مستخدم"}</p>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                    {sovereign.isOwner ? "Admin" : role}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-all"><X size={16} className="text-muted-foreground" /></button>
            </div>

            {/* Balance */}
            <div className="px-5 py-4 border-b border-border">
              <div className="bg-accent rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-bold">الرصيد</span>
                <span className={`text-xl font-black tabular-nums ${balance === '∞' ? 'text-primary neon-text' : 'text-foreground'}`}>{balance} <span className="text-[9px] text-muted-foreground">EGP</span></span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-none">
              <SidebarLink to="/" icon={<Scale size={16} />} label="الرئيسية" onClose={onClose} />
              <SidebarLink to="/dashboard" icon={<LayoutDashboard size={16} />} label="لوحة التحكم" onClose={onClose} />
              <SidebarLink to="/bot" icon={<Sparkles size={16} />} label="البوت الذكي" onClose={onClose} />
              <SidebarLink to="/consultants" icon={<User size={16} />} label="الخبراء" onClose={onClose} />
              <SidebarLink to="/templates" icon={<FileText size={16} />} label="الوثائق" onClose={onClose} />
              <SidebarLink to="/pricing" icon={<CreditCard size={16} />} label="الباقات" onClose={onClose} />
              <SidebarLink to="/about" icon={<Info size={16} />} label="عن المنصة" onClose={onClose} />
              {sovereign.isOwner && (
                <>
                  <div className="h-px bg-border my-3" />
                  <SidebarLink to="/admin" icon={<Crown size={16} />} label="لوحة الإدارة" onClose={onClose} />
                </>
              )}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border">
              <button onClick={() => { signOut(); onClose(); }} className="w-full flex items-center gap-3 p-3 text-destructive hover:bg-destructive/10 rounded-xl transition-all">
                <LogOut size={16} />
                <span className="text-sm font-bold">تسجيل الخروج</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function SidebarLink({ to, icon, label, onClose }: { to: string; icon: React.ReactNode; label: string; onClose: () => void }) {
  return (
    <Link to={to} onClick={onClose} className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all text-sm font-medium">
      {icon}
      <span>{label}</span>
    </Link>
  );
}
