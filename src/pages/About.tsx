import { Scale, ShieldCheck, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 lg:p-20 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="w-28 h-28 bg-primary/10 rounded-[3rem] flex items-center justify-center mx-auto text-primary shadow-3xl float-sovereign border border-primary/20">
            <Scale size={56} strokeWidth={1.5} />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter">المستشار <span className="text-primary">AI</span></h1>
          <p className="text-2xl text-muted-foreground font-bold max-w-2xl mx-auto leading-relaxed">منصة الاستشارات القانونية السيادية المدعومة بالذكاء الاصطناعي. نسعى لتقديم العدالة الرقمية للجميع.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { icon: <ShieldCheck size={40} />, title: "حماية سيادية", desc: "تشفير شامل لجميع البيانات والمحادثات القانونية." },
            { icon: <Users size={40} />, title: "مجلس الخبراء", desc: "نخبة من المحامين والمستشارين القانونيين المعتمدين." },
            { icon: <Zap size={40} />, title: "ذكاء اصطناعي", desc: "تحليل قانوني فوري مدعوم بأحدث تقنيات الـ AI." },
          ].map((item) => (
            <motion.div key={item.title} whileHover={{ y: -5 }} className="glass-cosmic border border-border rounded-[3rem] p-10 space-y-6">
              <div className="text-primary">{item.icon}</div>
              <h3 className="text-2xl font-black text-foreground">{item.title}</h3>
              <p className="text-muted-foreground font-bold">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
