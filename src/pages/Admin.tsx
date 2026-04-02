import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Zap, Ban, Star, Loader2, LogOut, ShieldAlert } from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase, UserProfile } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, doc, updateDoc, getDocs, increment } from "firebase/firestore";
import { roles as ROLES_LIST, checkSovereignStatus } from "@/lib/roles";

export default function AdminPage() {
  const { user, profile, isUserLoading, signOut } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [targetEmail, setTargetEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const sovereign = checkSovereignStatus(user?.email);

  const usersQuery = useMemoFirebase(() => {
    if (!db || !sovereign.isOwner) return null;
    return query(collection(db, "users"), where("email", "!=", user?.email));
  }, [db, user, sovereign.isOwner]);
  const { data: citizens, isLoading: citizensLoading } = useCollection(usersQuery);

  if (isUserLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;
  if (!sovereign.isOwner) return (
    <div className="h-screen bg-background flex flex-col items-center justify-center text-destructive gap-4 p-6">
      <ShieldAlert size={48} className="animate-pulse" />
      <h1 className="text-xl font-black uppercase tracking-widest">غير مصرح</h1>
    </div>
  );

  const handleAction = async (action: 'ban' | 'vip' | 'recharge', email?: string) => {
    const target = email || targetEmail;
    if (!target.trim() || !db) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", target.trim()));
      const snap = await getDocs(q);
      if (snap.empty) { toast({ variant: "destructive", title: "المستخدم غير مسجل." }); return; }
      const targetUser = snap.docs[0];
      const userRef = doc(db, "users", targetUser.id);
      if (action === 'ban') await updateDoc(userRef, { isBanned: true });
      else if (action === 'vip') await updateDoc(userRef, { role: ROLES_LIST.VIP });
      else if (action === 'recharge') await updateDoc(userRef, { balance: increment(500) });
      toast({ title: "تم تنفيذ الأمر بنجاح ✅" });
    } catch { toast({ variant: "destructive", title: "خطأ في التنفيذ" }); }
    finally { setIsProcessing(false); setTargetEmail(""); }
  };

  return (
    <SovereignLayout activeId="admin">
      <div className="w-full space-y-6 pb-32 px-4 py-2">
        <header className="space-y-2">
          <div className="sovereign-badge"><ShieldCheck size={10} /> Admin Panel</div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">لوحة الإدارة</h2>
        </header>

        {/* Quick Actions */}
        <div className="glass-panel p-5 rounded-2xl border border-border space-y-4">
          <label className="text-xs font-bold text-muted-foreground">إجراء سريع</label>
          <input value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} placeholder="بريد المستخدم"
            className="input-clean text-right text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <ActionBtn onClick={() => handleAction('recharge')} icon={<Zap size={14} />} label="شحن 500" color="emerald" />
            <ActionBtn onClick={() => handleAction('vip')} icon={<Star size={14} />} label="ترقية VIP" color="amber" />
          </div>
          <ActionBtn onClick={() => handleAction('ban')} icon={<Ban size={14} />} label="حظر المستخدم" color="red" />
        </div>

        {/* Citizens List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-foreground">المستخدمون</h3>
            <Users size={16} className="text-muted-foreground" />
          </div>
          {citizensLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground h-8 w-8" /></div>
          ) : citizens?.map((c: UserProfile) => (
            <div key={c.id} className="glass-panel border border-border p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center font-bold text-muted-foreground border border-border">{c.fullName?.charAt(0)}</div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{c.fullName}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{c.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-primary tabular-nums">{c.balance}</span>
                <button onClick={() => handleAction('ban', c.email)} className="p-2 bg-destructive/5 text-muted-foreground hover:text-destructive rounded-lg transition-all border border-transparent hover:border-destructive/20">
                  <Ban size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SovereignLayout>
  );
}

function ActionBtn({ icon, label, onClick, color }: { icon: React.ReactNode; label: string; onClick: () => void; color: string }) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-500/8 border-emerald-500/15 hover:bg-emerald-500/15",
    amber: "text-amber-400 bg-amber-500/8 border-amber-500/15 hover:bg-amber-500/15",
    red: "text-red-400 bg-red-500/8 border-red-500/15 hover:bg-red-500/15"
  };
  return (
    <button onClick={onClick} className={`w-full h-10 border rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all btn-hover ${colors[color]}`}>{icon} {label}</button>
  );
}
