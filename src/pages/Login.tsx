import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Scale, Lock, Loader2, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth as useFirebaseAuth, useFirestore, useUser } from "@/firebase/provider";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { SOVEREIGN_ADMIN_EMAIL, roles as ROLES_LIST } from "@/lib/roles";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [resetEmail, setResetEmail] = useState("");

  const auth = useFirebaseAuth();
  const db = useFirestore();
  const { user, isUserLoading, signInWithGoogle } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isUserLoading && user) navigate("/", { replace: true });
  }, [user, isUserLoading, navigate]);

  const handleLogin = async () => {
    if (!auth || !db) return;
    setIsLoading(true);
    let loginEmail = identifier.trim();
    if (loginEmail.toLowerCase() === "king2026") loginEmail = SOVEREIGN_ADMIN_EMAIL;

    try {
      await signInWithEmailAndPassword(auth, loginEmail, password);
      toast({ title: "مرحباً بك", description: "تم تسجيل الدخول بنجاح." });
      navigate("/");
    } catch {
      if (identifier.toLowerCase() === "king2026") {
        // Admin override: try creating account first, if exists send password reset
        try {
          const cred = await createUserWithEmailAndPassword(auth, loginEmail, "king@2026");
          await updateProfile(cred.user, { displayName: "king2026" });
          await setDoc(doc(db, "users", cred.user.uid), {
            id: cred.user.uid, email: loginEmail, fullName: "king2026", balance: 999999,
            role: ROLES_LIST.ADMIN, createdAt: new Date().toISOString(), isBanned: false
          });
          toast({ title: "تم تأسيس حساب المدير" });
          navigate("/");
        } catch {
          // Account exists but password is wrong - send reset link
          try {
            await sendPasswordResetEmail(auth, SOVEREIGN_ADMIN_EMAIL);
            toast({ title: "⚠️ كلمة المرور غير متطابقة", description: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك. أعد تعيينها إلى king@2026 ثم سجل الدخول مرة أخرى، أو استخدم 'متابعة مع Google' للدخول فوراً." });
          } catch {
            toast({ variant: "destructive", title: "فشل", description: "استخدم 'متابعة مع Google' لتسجيل الدخول فوراً." });
          }
        }
      } else {
        toast({ variant: "destructive", title: "خطأ في البيانات", description: "البريد أو كلمة المرور غير صحيحة. جرّب 'متابعة مع Google'." });
      }
    } finally { setIsLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!auth || !resetEmail.trim()) {
      toast({ variant: "destructive", title: "أدخل بريدك الإلكتروني" });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      toast({ title: "تم إرسال رابط الاستعادة", description: "تحقق من بريدك الإلكتروني." });
      setMode('login');
    } catch {
      toast({ variant: "destructive", title: "خطأ", description: "لم نتمكن من إرسال الرابط. تحقق من البريد." });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="glass-panel p-8 rounded-3xl border border-border shadow-3xl space-y-8">
          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto border border-primary/20 neon-glow">
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">المستشار <span className="text-primary">AI</span></h1>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                {mode === 'forgot' ? 'استعادة كلمة المرور' : 'تسجيل الدخول'}
              </p>
            </div>
          </div>

          {mode === 'forgot' ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground px-1">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} type="email" placeholder="your@email.com"
                    className="input-clean pr-11 text-right" />
                </div>
              </div>
              <button onClick={handleForgotPassword} disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-2xl shadow-neon btn-hover disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                إرسال رابط الاستعادة
              </button>
              <button onClick={() => setMode('login')} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> العودة لتسجيل الدخول
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Google Sign In */}
              <button onClick={() => signInWithGoogle()} className="w-full h-12 bg-accent text-foreground font-bold rounded-2xl border border-border btn-hover flex items-center justify-center gap-3 hover:bg-accent/80">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                متابعة مع Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">أو</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Email/Password */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground px-1">البريد أو المعرف</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="king2026 أو البريد"
                    className="input-clean pr-11 text-right" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground px-1">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="input-clean pr-11 pl-11 text-right" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setMode('forgot')} className="text-xs text-primary font-medium hover:underline">نسيت كلمة المرور؟</button>
              </div>

              <button onClick={handleLogin} disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-2xl shadow-neon btn-hover disabled:opacity-50 flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : null}
                تسجيل الدخول
              </button>
            </div>
          )}

          <div className="text-center pt-2">
            <Link to="/auth/signup" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              ليس لديك حساب؟ <span className="text-primary font-bold">أنشئ حساب جديد</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
