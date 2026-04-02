import { Zap, FileText, Crown, Percent, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { roles as ROLES_LIST } from '@/lib/roles';
import { Link } from 'react-router-dom';

interface RoyalWalletProps {
  userRole: string;
  balance: number | string;
}

export default function RoyalWallet({ userRole, balance }: RoyalWalletProps) {
  const isAdmin = userRole === ROLES_LIST.ADMIN;

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {/* Main Balance */}
      <div className="glass-panel border border-border p-6 rounded-3xl relative overflow-hidden neon-border">
        <div className="absolute top-0 right-0 w-60 h-60 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Available Balance</p>
          </div>
          <div className="flex items-baseline gap-3">
            <span className={`text-6xl font-black tabular-nums ${balance === '∞' ? 'text-primary neon-text' : 'text-foreground'}`}>
              {balance === "∞" ? "∞" : typeof balance === 'number' ? balance.toLocaleString() : balance}
            </span>
            <span className="text-lg text-primary font-bold uppercase tracking-wider">Units</span>
          </div>
          <div className="flex gap-3 pt-2">
            <Link to="/pricing" className="flex-1">
              <button className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-2xl btn-hover shadow-neon flex items-center justify-center gap-2">
                <Zap size={18} /> {isAdmin ? 'إدارة الأصول' : 'شحن المحفظة'}
              </button>
            </Link>
            <button className="h-12 px-5 bg-accent text-muted-foreground font-bold rounded-2xl border border-border btn-hover hover:text-foreground flex items-center gap-2">
              <FileText size={16} /> تقرير PDF
            </button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div whileHover={{ y: -4 }} className="glass-panel border border-primary/15 p-5 rounded-2xl space-y-3 btn-hover">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-primary" />
            <span className="text-xs font-bold text-foreground">VIP</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium">أولوية في مجلس الخبراء</p>
          <button className="w-full h-9 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-all">تفعيل</button>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="glass-panel border border-violet-500/15 p-5 rounded-2xl space-y-3 btn-hover">
          <div className="flex items-center gap-2">
            <Percent size={16} className="text-violet-400" />
            <span className="text-xs font-bold text-foreground">التقسيط</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium">خصم شهري للقضايا الكبرى</p>
          <button className="w-full h-9 bg-violet-500/10 text-violet-400 text-xs font-bold rounded-xl hover:bg-violet-500/20 transition-all">تفعيل</button>
        </motion.div>
      </div>
    </div>
  );
}
