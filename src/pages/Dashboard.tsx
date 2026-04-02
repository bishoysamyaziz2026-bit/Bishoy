import { useUser } from "@/firebase/provider";
import ProtectedRoute from "@/components/ProtectedRoute";
import SovereignLayout from "@/components/SovereignLayout";
import { Crown, Sparkles, FileText, Activity, Wallet, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getBalance, checkSovereignStatus, roles as ROLES_LIST } from "@/lib/roles";

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function Dashboard() {
  const { user, profile, role } = useUser();
  const balance = getBalance(profile);
  const sovereign = checkSovereignStatus(user?.email);

  return (
    <ProtectedRoute>
      <SovereignLayout activeId="dashboard">
        <div className="px-4 py-4 space-y-6 pb-8">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {/* Header */}
            <motion.header variants={item} className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium">لوحة التحكم</p>
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                مرحباً، <span className="text-primary">{profile?.fullName?.split(' ')[0] || "المستخدم"}</span>
              </h1>
              {sovereign.isOwner && (
                <div className="sovereign-badge mt-2">
                  <Shield className="h-3 w-3" /> Root Admin
                </div>
              )}
            </motion.header>

            {/* Balance Card */}
            <motion.div variants={item}>
              <div className="glass-panel rounded-3xl p-6 border border-border neon-border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Wallet size={16} className="text-primary" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">الرصيد المتاح</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className={`text-5xl font-black tabular-nums ${balance === '∞' ? 'text-primary neon-text' : 'text-foreground'}`}>{balance}</span>
                    <span className="text-sm text-muted-foreground font-bold">EGP</span>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Link to="/pricing" className="flex-1">
                      <button className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-neon btn-hover flex items-center justify-center gap-2">
                        <TrendingUp size={16} /> شحن الرصيد
                      </button>
                    </Link>
                    <button className="h-11 px-4 bg-accent text-muted-foreground font-bold text-sm rounded-xl border border-border btn-hover hover:text-foreground flex items-center gap-2">
                      <FileText size={14} /> تقرير PDF
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={item} className="grid grid-cols-3 gap-3">
              <ActionCard href="/bot" icon={<Sparkles size={20} />} title="البوت" color="primary" />
              <ActionCard href="/consultants" icon={<Activity size={20} />} title="الخبراء" color="violet" />
              <ActionCard href="/templates" icon={<FileText size={20} />} title="الوثائق" color="amber" />
            </motion.div>

            {/* Admin Access */}
            {role === ROLES_LIST.ADMIN && (
              <motion.div variants={item}>
                <Link to="/admin">
                  <div className="glass-panel border border-primary/20 rounded-2xl p-5 flex items-center justify-between btn-hover group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20">
                        <Crown size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">لوحة الإدارة</p>
                        <p className="text-[10px] text-muted-foreground">إدارة المستخدمين والنظام</p>
                      </div>
                    </div>
                    <span className="text-xs text-primary font-bold group-hover:translate-x-[-4px] transition-transform">←</span>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Account Info */}
            <motion.div variants={item} className="glass-panel rounded-2xl border border-border p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground">معلومات الحساب</h3>
              <div className="space-y-3">
                <InfoRow label="البريد" value={user?.email || "—"} />
                <InfoRow label="الاسم" value={profile?.fullName || "—"} />
                <InfoRow label="الحالة" value={role === ROLES_LIST.ADMIN ? "مدير" : role === ROLES_LIST.VIP ? "VIP" : "مستخدم"} highlight />
                <InfoRow label="المعرف" value={user?.uid?.substring(0, 12)?.toUpperCase() || "—"} mono />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </SovereignLayout>
    </ProtectedRoute>
  );
}

function ActionCard({ href, icon, title, color }: { href: string; icon: React.ReactNode; title: string; color: string }) {
  const colors: Record<string, string> = {
    primary: "text-primary bg-primary/8 border-primary/15",
    violet: "text-violet-400 bg-violet-500/8 border-violet-500/15",
    amber: "text-amber-400 bg-amber-500/8 border-amber-500/15",
  };
  return (
    <Link to={href}>
      <div className={`rounded-2xl p-4 border text-center space-y-2 btn-hover ${colors[color]}`}>
        <div className="mx-auto w-fit">{icon}</div>
        <p className="text-xs font-bold text-foreground">{title}</p>
      </div>
    </Link>
  );
}

function InfoRow({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className={`text-xs font-bold ${highlight ? 'text-primary' : 'text-foreground'} ${mono ? 'font-mono text-[10px]' : ''}`}>{value}</span>
    </div>
  );
}
