import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Users, Zap, Ban, Star, Loader2, LogOut, ShieldAlert, Gavel } from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, doc, updateDoc, getDocs, increment } from "firebase/firestore";
import { roles as ROLES_LIST, checkSovereignStatus } from "@/lib/roles";
import { Link } from "react-router-dom";

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
    <div className="h-screen bg-background flex flex-col items-center justify-center text-destructive gap-6">
      <ShieldAlert size={80} className="animate-pulse" /><h1 className="text-4xl font-black uppercase tracking-[0.5em]">Authority Denied</h1>
    </div>
  );

  const handleAction = async (action: 'ban' | 'vip' | 'recharge', email?: string) => {
    const target = email || targetEmail;
    if (!target.trim() || !db) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", target.trim()));
      const snap = await getDocs(q);
      if (snap.empty) { toast({ variant: "destructive", title: "المواطن غير مسجل." }); return; }
      const targetUser = snap.docs[0];
      const userRef = doc(db, "users", targetUser.id);
      if (action === 'ban') await updateDoc(userRef, { isBanned: true });
      else if (action === 'vip') await updateDoc(userRef, { role: ROLES_LIST.VIP });
      else if (action === 'recharge') await updateDoc(userRef, { balance: increment(500) });
      toast({ title: "تم تنفيذ الأمر السيادي بنجاح ✅" });
    } catch { toast({ variant: "destructive", title: "خطأ في التنفيذ" }); }
    finally { setIsProcessing(false); setTargetEmail(""); }
  };

  return (
    <SovereignLayout activeId="admin">
      <div className="w-full min-h-screen space-y-16 pb-40 px-8">
        <header className="flex justify-between items-center border-b border-border pb-12">
          <div className="text-right space-y-4">
            <div className="sovereign-badge"><ShieldCheck size={12} /> Supreme Command HUB</div>
            <h2 className="text-7xl font-black text-foreground tracking-tighter">غرفة <span className="text-primary">السيطرة</span></h2>
          </div>
          <div className="flex gap-4">
            <Link to="/admin/consultants"><button className="p-6 bg-accent text-foreground rounded-[2rem] border border-border hover:bg-accent/80 transition-all flex items-center gap-3 font-bold"><Gavel size={24} className="text-primary" /> مراجعة الخبراء</button></Link>
            <button onClick={() => signOut()} className="p-6 bg-destructive/10 text-destructive rounded-[2rem] border border-destructive/10 hover:bg-destructive hover:text-destructive-foreground transition-all"><LogOut size={24} /></button>
          </div>
        </header>
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-cosmic p-12 rounded-[4rem] border border-border space-y-10 shadow-3xl">
              <div className="space-y-4 text-right">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-4">تنفيذ استراتيجي فوري</label>
                <input value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} placeholder="citizen@domain.com"
                  className="w-full h-20 bg-background p-8 rounded-[2.5rem] text-foreground text-xl font-bold outline-none border border-border focus:border-primary transition-all text-right shadow-inner" />
              </div>
              <div className="grid gap-4">
                <div className="flex gap-4">
                  <ActionButton onClick={() => handleAction('recharge')} icon={<Zap size={20} />} label="شحن رصيد" color="emerald" />
                  <ActionButton onClick={() => handleAction('vip')} icon={<Star size={20} />} label="ترقية VIP" color="amber" />
                </div>
                <ActionButton onClick={() => handleAction('ban')} icon={<Ban size={20} />} label="إصدار حظر عالمي" color="red" wide />
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-8">
              <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">سجل المواطنين</h3>
              <Users size={24} className="text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {citizensLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground h-12 w-12" /></div>
              ) : citizens?.map((citizen: any) => (
                <div key={citizen.id} className="glass-cosmic border border-border p-10 rounded-[3.5rem] flex items-center justify-between group hover:bg-accent transition-all">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-accent flex items-center justify-center font-black text-muted-foreground text-2xl border border-border">{citizen.fullName?.charAt(0)}</div>
                    <div className="text-right">
                      <p className="text-xl font-black text-foreground leading-none">{citizen.fullName}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2">{citizen.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Balance</p>
                      <p className="text-3xl font-black text-primary tabular-nums">{citizen.balance} <span className="text-[10px] opacity-40">EGP</span></p>
                    </div>
                    <button onClick={() => handleAction('ban', citizen.email)} className="p-4 bg-destructive/5 text-muted-foreground hover:text-destructive transition-all rounded-2xl border border-transparent hover:border-destructive/20"><Ban size={24} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SovereignLayout>
  );
}

function ActionButton({ icon, label, onClick, color, wide }: any) {
  const colors: any = {
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10",
    amber: "text-amber-500 bg-amber-500/5 border-amber-500/10 hover:bg-amber-500/10",
    red: "text-red-500 bg-red-500/5 border-red-500/10 hover:bg-red-500/10"
  };
  return (
    <button onClick={onClick} className={`${wide ? 'w-full' : 'flex-1'} h-20 border rounded-[2rem] flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest transition-all ${colors[color]}`}>{icon} {label}</button>
  );
}
