import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, History, CreditCard, Settings, LogOut, ShieldCheck, LayoutDashboard, Sparkles } from 'lucide-react';
import { useUser } from '@/firebase/provider';
import { roles as ROLES_LIST, checkSovereignStatus } from '@/lib/roles';
import { Link } from 'react-router-dom';

interface SovereignSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SovereignSidebar({ isOpen, onClose }: SovereignSidebarProps) {
  const { user, profile, role, signOut } = useUser();
  const sovereign = checkSovereignStatus(user?.email);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] cursor-pointer" />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[320px] bg-card z-[70] border-r border-border shadow-3xl flex flex-col"
          >
            <div className="p-10 flex justify-between items-center border-b border-border bg-accent/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-lg">
                  {profile?.fullName?.charAt(0) || "S"}
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-foreground">{profile?.fullName || "مواطن"}</p>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{sovereign.isOwner ? "ROOT OWNER" : role}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-accent rounded-xl transition-all"><X size={20} className="text-muted-foreground" /></button>
            </div>

            <nav className="flex-1 p-6 space-y-2">
              <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="لوحة القيادة" onClose={onClose} />
              <SidebarLink to="/bot" icon={<Sparkles size={20} />} label="البوت الذكي" onClose={onClose} />
              <SidebarLink to="/consultants" icon={<User size={20} />} label="مجلس الخبراء" onClose={onClose} />
              <SidebarLink to="/templates" icon={<CreditCard size={20} />} label="المكتبة الرقمية" onClose={onClose} />
              <SidebarLink to="/pricing" icon={<History size={20} />} label="الباقات" onClose={onClose} />
              {sovereign.isOwner && <SidebarLink to="/admin" icon={<ShieldCheck size={20} />} label="غرفة السيطرة" onClose={onClose} />}
            </nav>

            <div className="p-6 border-t border-border">
              <button onClick={() => { signOut(); onClose(); }} className="w-full flex items-center gap-4 p-4 text-destructive hover:bg-destructive/10 rounded-xl transition-all">
                <LogOut size={20} />
                <span className="text-sm font-black">تسجيل الخروج</span>
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
    <Link to={to} onClick={onClose} className="flex items-center gap-4 p-4 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all">
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </Link>
  );
}
