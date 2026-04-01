import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Scale, Lock, Loader2, ShieldCheck } from "lucide-react";
import { useAuth as useFirebaseAuth, useFirestore, useUser } from "@/firebase/provider";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { SOVEREIGN_ADMIN_EMAIL, roles as ROLES_LIST } from "@/lib/roles";
import SovereignButton from "@/components/SovereignButton";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("king2026");
  const [password, setPassword] = useState("king@2026");
  const [isLoading, setIsLoading] = useState(false);

  const auth = useFirebaseAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isUserLoading && user) navigate("/bot", { replace: true });
  }, [user, isUserLoading, navigate]);

  const handleLogin = async () => {
    if (!auth || !db) return;
    setIsLoading(true);
    let loginEmail = identifier.trim();
    if (loginEmail.toLowerCase() === "king2026") loginEmail = SOVEREIGN_ADMIN_EMAIL;

    try {
      await signInWithEmailAndPassword(auth, loginEmail, password);
      toast({ title: "مرحباً سيادة المالك", description: "تم تفعيل بروتوكول الوصول king2026." });
      navigate("/bot");
    } catch {
      if (identifier.toLowerCase() === "king2026" && password === "king@2026") {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, password);
          const newUser = userCredential.user;
          await updateProfile(newUser, { displayName: "king2026" });
          await setDoc(doc(db, "users", newUser.uid), {
            id: newUser.uid, email: loginEmail, fullName: "king2026", balance: 999999,
            role: ROLES_LIST.ADMIN, createdAt: new Date().toISOString(), isBanned: false
          });
          toast({ title: "تم تأسيس السلطة السيادية" });
          navigate("/bot");
        } catch { toast({ variant: "destructive", title: "فشل الدخول السيادي" }); }
      } else {
        toast({ variant: "destructive", title: "خطأ في الدخول", description: "بيانات الاعتماد غير صالحة." });
      }
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-transparent to-background" />
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg px-6 z-10">
        <div className="glass-cosmic p-12 rounded-[4rem] border border-border shadow-3xl text-right space-y-10">
          <div className="text-center space-y-6">
            <div className="h-24 w-24 bg-primary/20 rounded-[2.5rem] flex items-center justify-center mx-auto border border-primary/20 shadow-inner float-sovereign">
              <Scale className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-black text-foreground">المستشار <span className="text-primary">AI</span></h1>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">المعرف السيادي</Label>
              <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full h-16 bg-accent border border-border rounded-3xl px-8 text-xl font-bold text-foreground text-right focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="king2026" />
            </div>
            <div className="space-y-2">
              <Label className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">رمز الولوج</Label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-16 bg-accent border border-border rounded-3xl px-8 text-xl font-bold text-foreground text-right focus:ring-4 focus:ring-primary/10 transition-all outline-none" placeholder="••••••••" />
            </div>
            <SovereignButton text={isLoading ? "جاري المصادقة..." : "تفعيل الدخول السيادي"} onClick={handleLogin} disabled={isLoading} icon={isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck />} />
          </div>
          <div className="text-center">
            <Link to="/auth/signup" className="text-sm font-bold text-muted-foreground hover:text-primary transition-all">لا تملك هوية؟ أنشئ حساب مواطن جديد</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
