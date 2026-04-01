import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Crown, CheckCircle2 } from "lucide-react";
import { useUser } from "@/firebase/provider";
import { checkSovereignStatus } from "@/lib/roles";

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const PLANS = [
  { id: "starter", name: "الأساسي", price: 50, features: ["5 استشارات AI", "وثيقة مجانية", "دعم أساسي"], color: "primary", featured: false },
  { id: "pro", name: "VIP", price: 200, features: ["استشارات غير محدودة", "10 وثائق مجانية", "أولوية الخبراء", "تقرير PDF"], color: "primary", featured: true },
  { id: "enterprise", name: "المؤسسات", price: 500, features: ["كل مزايا VIP", "API خاص", "مدير حساب", "دعم 24/7"], color: "violet", featured: false },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const sovereign = checkSovereignStatus(user?.email);

  useEffect(() => {
    if (sovereign.isOwner) navigate("/supreme-office", { replace: true });
  }, [sovereign.isOwner, navigate]);

  if (sovereign.isOwner) return null;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pb-20" dir="rtl">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-lg mx-auto space-y-8">
        <motion.header variants={item} className="text-center space-y-3">
          <div className="sovereign-badge mx-auto"><Crown className="h-3 w-3" /> الباقات</div>
          <h1 className="text-3xl font-black tracking-tighter">اختر <span className="text-gradient">باقتك</span></h1>
          <p className="text-sm text-muted-foreground font-medium">كل باقة مصممة لتمنحك أقصى قيمة قانونية.</p>
        </motion.header>

        <div className="space-y-4">
          {PLANS.map((plan) => (
            <motion.div key={plan.id} variants={item}
              className={`glass-panel border rounded-3xl p-6 space-y-5 btn-hover ${plan.featured ? 'border-primary/30 neon-border' : 'border-border'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-black ${plan.featured ? 'text-primary' : 'text-foreground'}`}>{plan.name}</h3>
                {plan.featured && <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md uppercase">الأكثر شعبية</span>}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground font-medium">EGP / شهرياً</span>
              </div>
              <div className="space-y-2.5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary flex-shrink-0" /><span className="text-xs text-muted-foreground font-medium">{f}</span></div>
                ))}
              </div>
              <button className={`w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all btn-hover ${plan.featured ? 'bg-primary text-primary-foreground shadow-neon' : 'bg-accent text-foreground border border-border hover:bg-accent/80'}`}>
                <Zap size={16} /> اشتراك
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
