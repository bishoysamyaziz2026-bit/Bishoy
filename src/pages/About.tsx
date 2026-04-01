import { Scale, ShieldCheck, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 pb-20" dir="rtl">
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-lg mx-auto space-y-10 text-center">
        <motion.div variants={item} className="space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary neon-glow border border-primary/20 float-gentle">
            <Scale size={36} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">المستشار <span className="text-primary">AI</span></h1>
          <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-md mx-auto">منصة الاستشارات القانونية الذكية المدعومة بالذكاء الاصطناعي. نسعى لتقديم العدالة الرقمية للجميع.</p>
        </motion.div>
        <div className="grid gap-4">
          {[
            { icon: <ShieldCheck size={22} />, title: "حماية متقدمة", desc: "تشفير شامل لجميع البيانات والمحادثات." },
            { icon: <Users size={22} />, title: "خبراء معتمدون", desc: "نخبة من المحامين والمستشارين القانونيين." },
            { icon: <Zap size={22} />, title: "ذكاء اصطناعي", desc: "تحليل قانوني فوري بأحدث تقنيات AI." },
          ].map((feat) => (
            <motion.div key={feat.title} variants={item} className="glass-panel border border-border rounded-2xl p-5 flex items-center gap-4 text-right btn-hover">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 flex-shrink-0">{feat.icon}</div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{feat.title}</h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
