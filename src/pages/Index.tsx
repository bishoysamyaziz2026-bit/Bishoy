import { Scale, Zap, ArrowLeft, Loader2, ShieldCheck, MessageSquare, FileText, Users, Activity, Newspaper, Bot, TrendingUp, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/firebase/provider';
import { Link } from 'react-router-dom';
import { getBalance } from '@/lib/roles';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } };

const NEWS = [
  { title: "تعديلات قانون الإيجار الجديد 2026", tag: "عقاري", time: "منذ ساعتين" },
  { title: "حكم نقض جديد في قضايا العمل", tag: "عمالي", time: "منذ 5 ساعات" },
  { title: "تحديث إجراءات التوثيق الإلكتروني", tag: "إداري", time: "اليوم" },
];

export default function MissionControl() {
  const { user, profile, isUserLoading, signInWithGoogle } = useUser();
  const balance = getBalance(profile);

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-10 w-10 opacity-30" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-md w-full space-y-16">
          <div className="space-y-8">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto neon-glow border border-primary/20 float-gentle">
              <Scale size={40} strokeWidth={1.5} className="text-primary" />
            </div>
            <div className="space-y-3">
              <h1 className="text-5xl font-black tracking-tighter text-foreground">المستشار <span className="text-primary neon-text">AI</span></h1>
              <p className="text-muted-foreground font-medium text-sm tracking-wider uppercase">Legal Intelligence Platform</p>
            </div>
          </div>

          <div className="space-y-10">
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">منصة الاستشارات القانونية الذكية.<br/>احصل على تحليل فوري ووثائق معتمدة.</p>
            <div className="inline-flex items-center gap-3 bg-success/5 px-6 py-2.5 rounded-full border border-success/15">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span className="text-xs font-bold text-success uppercase tracking-widest">50 EGP رصيد ترحيبي مجاني</span>
            </div>
          </div>

          <div className="space-y-4">
            <button onClick={() => signInWithGoogle()} className="w-full h-14 bg-primary text-primary-foreground font-bold text-base rounded-2xl shadow-neon btn-hover flex items-center justify-center gap-3">
              <Zap size={20} fill="currentColor" /> ابدأ مع Google
            </button>
            <Link to="/auth/login" className="block">
              <button className="w-full h-14 bg-accent text-muted-foreground font-bold text-base rounded-2xl border border-border btn-hover flex items-center justify-center gap-3 hover:text-foreground">
                تسجيل دخول بالبريد
              </button>
            </Link>
          </div>

          <p className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-[0.5em]">Almustashar AI • Secure Legal Platform</p>
        </motion.div>
      </div>
    );
  }

  // === MISSION CONTROL DASHBOARD ===
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-6 pb-32 space-y-6">
        {/* Header */}
        <motion.header variants={container} initial="hidden" animate="show" className="space-y-1 pt-2">
          <motion.p variants={item} className="text-muted-foreground text-sm font-medium">مرحباً بعودتك</motion.p>
          <motion.h1 variants={item} className="text-3xl font-black tracking-tight">
            {profile?.fullName?.split(' ')[0] || 'المستخدم'} <span className="text-primary">👋</span>
          </motion.h1>
        </motion.header>

        {/* Balance Card */}
        <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
          <Link to="/pricing">
            <div className="glass-panel rounded-3xl p-6 border border-border neon-border group btn-hover">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">الرصيد المتاح</p>
                  <p className={`text-4xl font-black tabular-nums ${balance === '∞' ? 'text-primary neon-text' : 'text-foreground'}`}>
                    {balance} <span className="text-sm text-muted-foreground font-bold">EGP</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <TrendingUp size={20} className="text-primary" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
          <QuickAction href="/bot" icon={<Bot size={22} />} title="البوت الذكي" desc="استشارة AI فورية" color="primary" />
          <QuickAction href="/consultants" icon={<Users size={22} />} title="الخبراء" desc="استشارة مباشرة" color="violet" />
          <QuickAction href="/templates" icon={<FileText size={22} />} title="الوثائق" desc="عقود ونماذج" color="amber" />
          <QuickAction href="/dashboard" icon={<Activity size={22} />} title="لوحة التحكم" desc="حسابك الشخصي" color="emerald" />
        </motion.div>

        {/* AI Status */}
        <motion.div variants={item} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
          <div className="glass-panel rounded-3xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_12px_hsl(var(--success))]" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AI Status</span>
              </div>
              <span className="text-[10px] font-bold text-success uppercase">Online</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatusCard label="الاستجابة" value="< 2s" />
              <StatusCard label="الدقة" value="97%" />
              <StatusCard label="الجلسات" value="∞" />
            </div>
          </div>
        </motion.div>

        {/* Legal News */}
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Newspaper size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">آخر الأخبار القانونية</h3>
          </div>
          {NEWS.map((n, i) => (
            <motion.div key={i} variants={item} className="glass-panel rounded-2xl p-4 border border-border btn-hover cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <p className="text-sm font-bold text-foreground leading-snug">{n.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{n.tag}</span>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                </div>
                <ArrowLeft size={14} className="text-muted-foreground mt-1 flex-shrink-0" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Floating Dock */}
      <div className="fixed bottom-6 inset-x-0 z-50 px-4">
        <div className="max-w-sm mx-auto floating-dock rounded-[2rem] p-2 flex items-center justify-around">
          <DockBtn href="/" active icon={<Scale size={20} />} label="الرئيسية" />
          <DockBtn href="/bot" icon={<MessageSquare size={20} />} label="البوت" />
          <DockBtn href="/dashboard" icon={<Briefcase size={20} />} label="حسابي" />
          <DockBtn href="/consultants" icon={<Users size={20} />} label="الخبراء" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, title, desc, color }: any) {
  const colorMap: any = {
    primary: "text-primary bg-primary/8 border-primary/15 hover:border-primary/30",
    violet: "text-violet-400 bg-violet-500/8 border-violet-500/15 hover:border-violet-500/30",
    amber: "text-amber-400 bg-amber-500/8 border-amber-500/15 hover:border-amber-500/30",
    emerald: "text-emerald-400 bg-emerald-500/8 border-emerald-500/15 hover:border-emerald-500/30",
  };
  return (
    <motion.div variants={item}>
      <Link to={href}>
        <div className={`rounded-3xl p-5 border transition-all duration-300 btn-hover space-y-3 ${colorMap[color]}`}>
          <div className="w-10 h-10 rounded-xl glass-frost flex items-center justify-center border border-border">{icon}</div>
          <div>
            <h4 className="text-base font-black text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground font-medium">{desc}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-accent rounded-xl p-3 text-center">
      <p className="text-lg font-black text-foreground">{value}</p>
      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{label}</p>
    </div>
  );
}

function DockBtn({ href, icon, label, active }: any) {
  return (
    <Link to={href} className="flex-1">
      <button className={`w-full py-3 rounded-2xl flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
        {icon}
        <span className="text-[9px] font-bold">{label}</span>
      </button>
    </Link>
  );
}
