import { motion } from "framer-motion";
import { Zap, ShieldCheck, Crown, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const PLANS = [
  { id: "starter", name: "المواطن", price: 50, features: ["5 استشارات AI", "وثيقة واحدة مجانية", "دعم أساسي"], color: "text-blue-500", border: "border-blue-500/20" },
  { id: "pro", name: "VIP السيادي", price: 200, features: ["استشارات AI غير محدودة", "10 وثائق مجانية", "أولوية في مجلس الخبراء", "تقرير مالي PDF"], color: "text-primary", border: "border-primary/20", featured: true },
  { id: "enterprise", name: "المؤسسة", price: 500, features: ["كل مزايا VIP", "API خاص", "مدير حساب مخصص", "دعم 24/7"], color: "text-violet-500", border: "border-violet-500/20" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 lg:p-20 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-20">
        <header className="text-center space-y-6">
          <div className="sovereign-badge mx-auto"><Crown className="h-3 w-3" /> باقات الخدمة السيادية</div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter">اختر <span className="text-gradient">باقتك</span></h1>
          <p className="text-xl text-muted-foreground font-bold max-w-2xl mx-auto">كل باقة مصممة لتمنحك أقصى قيمة قانونية بأقل تكلفة.</p>
        </header>
        <div className="grid md:grid-cols-3 gap-10">
          {PLANS.map((plan) => (
            <motion.div key={plan.id} whileHover={{ y: -10 }}
              className={`glass-cosmic border ${plan.border} rounded-[4rem] p-12 space-y-10 ${plan.featured ? 'ring-2 ring-primary/30 shadow-3xl scale-105' : 'shadow-2xl'}`}>
              <div className="space-y-4">
                <h3 className={`text-3xl font-black ${plan.color}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground font-bold">EGP / شهرياً</span>
                </div>
              </div>
              <div className="space-y-4">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3"><CheckCircle2 size={16} className={plan.color} /><span className="text-muted-foreground font-bold">{f}</span></div>
                ))}
              </div>
              <button className={`w-full h-20 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 transition-all hover:scale-105 ${plan.featured ? 'bg-primary text-primary-foreground shadow-3xl' : 'bg-accent text-foreground border border-border'}`}>
                <Zap size={24} /> اشتراك الآن
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
