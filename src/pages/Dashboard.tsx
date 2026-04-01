import { useUser } from "@/firebase/provider";
import ProtectedRoute from "@/components/ProtectedRoute";
import SovereignLayout from "@/components/SovereignLayout";
import { ShieldCheck, Crown, Sparkles, FileText, Activity, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getBalance, roles as ROLES_LIST } from "@/lib/roles";
import RoyalWallet from "@/components/RoyalWallet";

export default function Dashboard() {
  const { user, profile, role } = useUser();
  const balance = getBalance(profile);

  return (
    <ProtectedRoute>
      <SovereignLayout activeId="bookings">
        <div className="min-h-screen p-8 lg:p-20 font-sans relative overflow-hidden">
          <div className="max-w-6xl mx-auto space-y-20 relative z-10">
            <header className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="text-center md:text-right space-y-6">
                <div className="sovereign-badge mx-auto md:mx-0 animate-pulse">
                  <ShieldCheck className="h-3 w-3" /> Citizen Identity Protocol Verified
                </div>
                <h1 className="text-6xl md:text-7xl font-black text-foreground tracking-tighter leading-tight">
                  مرحباً بك، <br />
                  <span className="text-gradient">سيادة {profile?.fullName?.split(' ')[0] || "المواطن"}</span>
                </h1>
                <p className="text-xl text-muted-foreground font-bold">
                  مركز القيادة المالية والقانونية للمعرف: <span className="font-mono text-primary bg-primary/5 px-4 py-1 rounded-lg">{user?.uid.substring(0, 8).toUpperCase()}</span>
                </p>
              </div>
              {role === ROLES_LIST.ADMIN && (
                <Link to="/admin">
                  <motion.button whileHover={{ scale: 1.05 }} className="bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 text-primary px-10 py-6 rounded-[2.5rem] font-black text-lg flex items-center gap-5 transition-all shadow-3xl group">
                    <Crown className="h-8 w-8 group-hover:rotate-12 transition-transform" /> غرفة القيادة العليا
                  </motion.button>
                </Link>
              )}
            </header>

            <section className="space-y-8">
              <div className="flex items-center gap-4 px-6">
                <div className="h-1 w-12 bg-primary rounded-full" />
                <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Sovereign Financial Hub</h3>
              </div>
              <RoyalWallet userRole={role} balance={balance} />
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              <NavBox href="/bot" title="البوت الذكي" desc="استشارات AI فورية" icon={<Sparkles />} color="blue" />
              <NavBox href="/consultants" title="مجلس الخبراء" desc="اتصال مرئي مشفر" icon={<Activity />} color="violet" />
              <NavBox href="/templates" title="المكتبة الرقمية" desc="وثائق وعقود معتمدة" icon={<FileText />} color="amber" />
            </div>
          </div>
        </div>
      </SovereignLayout>
    </ProtectedRoute>
  );
}

function NavBox({ href, title, desc, icon, color }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/5 hover:border-blue-500/30",
    violet: "text-violet-500 bg-violet-500/5 hover:border-violet-500/30",
    amber: "text-amber-500 bg-amber-500/5 hover:border-amber-500/30",
  };
  return (
    <Link to={href} className="group">
      <div className={`p-12 rounded-[4rem] border border-border transition-all duration-500 group-hover:scale-[1.02] space-y-8 shadow-2xl ${colors[color]}`}>
        <div className="h-20 w-20 rounded-[2rem] glass flex items-center justify-center border border-border group-hover:scale-110 transition-transform">{icon}</div>
        <div>
          <h4 className="text-3xl font-black tracking-tight">{title}</h4>
          <p className="text-muted-foreground font-bold text-lg mt-2">{desc}</p>
        </div>
        <ChevronLeft className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}
