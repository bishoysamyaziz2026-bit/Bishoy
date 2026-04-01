import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Scale, ShieldCheck, Loader2, User, Mail, Phone, Lock } from "lucide-react";
import { useAuth as useFirebaseAuth, useFirestore, useUser } from "@/firebase/provider";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import SovereignButton from "@/components/SovereignButton";
import { roles as ROLES_LIST } from "@/lib/roles";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isProfessional, setIsProfessional] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const auth = useFirebaseAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isUserLoading && user) navigate("/bot", { replace: true });
  }, [user, isUserLoading, navigate]);

  const handleSignup = async () => {
    if (!auth || !db) return;
    if (!email || !password || !fullName || !phone) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تعبئة كافة الحقول الأساسية للمتابعة." });
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      await updateProfile(newUser, { displayName: fullName });
      await setDoc(doc(db, "users", newUser.uid), {
        id: newUser.uid, email, fullName, phone, balance: 50,
        role: isProfessional ? ROLES_LIST.PENDING_EXPERT : ROLES_LIST.USER,
        createdAt: new Date().toISOString(), isBanned: false
      });
      toast({ title: isProfessional ? "بانتظار المراجعة السيادية ✅" : "مرحباً بك في الكوكب", description: isProfessional ? "سيتم مراجعة وثائقك." : "حصلت على ٥٠ EGP رصيد ترحيبي مجاني." });
      navigate("/bot");
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل إنشاء الحساب", description: error.message });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background py-20">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg px-6 z-10">
        <div className="glass-cosmic p-12 rounded-[4rem] border border-border shadow-3xl text-right space-y-10">
          <div className="text-center space-y-6">
            <div className="h-24 w-24 bg-primary/20 rounded-[2.5rem] flex items-center justify-center mx-auto border border-primary/20 shadow-inner float-sovereign">
              <Scale className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-black text-foreground">تأسيس هوية <span className="text-primary">سيادية</span></h1>
          </div>

          <div className="space-y-6">
            {[
              { label: "الاسم الكامل", icon: <User size={16} />, value: fullName, set: setFullName, type: "text" },
              { label: "البريد الإلكتروني", icon: <Mail size={16} />, value: email, set: setEmail, type: "email" },
              { label: "رقم الهاتف", icon: <Phone size={16} />, value: phone, set: setPhone, type: "tel" },
              { label: "رمز الولوج", icon: <Lock size={16} />, value: password, set: setPassword, type: "password" },
            ].map((field) => (
              <div key={field.label} className="space-y-2">
                <Label className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">{field.label}</Label>
                <input type={field.type} value={field.value} onChange={(e) => field.set(e.target.value)} className="w-full h-16 bg-accent border border-border rounded-3xl px-8 text-xl font-bold text-foreground text-right focus:ring-4 focus:ring-primary/10 transition-all outline-none" />
              </div>
            ))}

            <label className="flex items-center gap-4 p-6 glass rounded-3xl border border-border cursor-pointer">
              <input type="checkbox" checked={isProfessional} onChange={(e) => setIsProfessional(e.target.checked)} className="h-6 w-6 rounded-lg accent-primary" />
              <span className="text-sm font-bold text-muted-foreground">أنا محامٍ / مستشار قانوني معتمد</span>
            </label>

            <SovereignButton text={isLoading ? "جاري التأسيس..." : "تأسيس الهوية السيادية"} onClick={handleSignup} disabled={isLoading} icon={isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck />} />
          </div>

          <div className="text-center">
            <Link to="/auth/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-all">تملك هوية؟ تفعيل الدخول السيادي</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
