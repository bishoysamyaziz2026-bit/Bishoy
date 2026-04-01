import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, Plus, Camera, FileText, X, Scale, Users } from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function BotPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isCapsuleOpen, setIsCapsuleOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "chatHistory"), orderBy("timestamp", "asc"), limit(100));
  }, [db, user]);
  const { data: messages } = useCollection(chatQuery);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isTyping || !db || !user) return;
    setInputText("");
    setIsTyping(true);
    setIsCapsuleOpen(false);
    try {
      await addDoc(collection(db, "users", user.uid, "chatHistory"), { role: "user", text, timestamp: serverTimestamp() });
      const aiResponse = `تحليل قانوني: "${text}" - هذا استفسار مهم. بناءً على القوانين المعمول بها، أنصحك بالتالي: يرجى استشارة خبير قانوني متخصص للحصول على رأي قانوني رسمي. يمكنك التواصل مع أحد خبرائنا من مجلس الخبراء.`;
      await addDoc(collection(db, "users", user.uid, "chatHistory"), { role: "ai", text: aiResponse, timestamp: serverTimestamp() });
    } catch { toast({ variant: "destructive", title: "فشل الإرسال" }); }
    finally { setIsTyping(false); }
  };

  return (
    <SovereignLayout activeId="bot">
      <div className="flex flex-col h-full relative w-full px-4">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-44 pt-4 scrollbar-none">
          <AnimatePresence mode="popLayout">
            {messages?.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center border border-primary/20 float-gentle neon-glow">
                  <Scale size={36} className="text-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-foreground tracking-tight">كيف أقدر أساعدك؟</h3>
                  <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">اشرح موقفك القانوني وسأقوم بالتحليل الفوري</p>
                </div>
              </motion.div>
            )}
            {messages?.map((m: any) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl max-w-[85%] text-sm font-medium leading-relaxed ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground mr-auto rounded-br-md' : 'glass-panel text-foreground border border-border ml-auto rounded-bl-md'
                }`}>
                {m.text}
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex gap-1.5 px-4 opacity-40">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
          )}
        </div>

        {/* Input Area with Action Capsule */}
        <div className="absolute bottom-20 inset-x-0 z-40 px-4">
          <div className="max-w-2xl mx-auto relative">
            <AnimatePresence>
              {isCapsuleOpen && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="absolute bottom-full mb-3 inset-x-0 glass-panel rounded-2xl p-3 grid grid-cols-3 gap-2 border border-border shadow-3xl">
                  <CapsuleTool icon={<Camera size={20} />} label="Vision Scan" href="/bot" color="primary" />
                  <CapsuleTool icon={<FileText size={20} />} label="Legal Vault" href="/templates" color="amber" />
                  <CapsuleTool icon={<Users size={20} />} label="Live Expert" href="/consultants" color="violet" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="glass-panel rounded-2xl p-2 flex items-center gap-2 border border-border shadow-3xl">
              <button onClick={() => setIsCapsuleOpen(!isCapsuleOpen)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isCapsuleOpen ? 'bg-primary/15 text-primary rotate-45' : 'bg-accent text-muted-foreground hover:text-foreground'}`}>
                {isCapsuleOpen ? <X size={18} /> : <Plus size={18} />}
              </button>
              <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اكتب استفسارك القانوني..." className="flex-1 bg-transparent border-none outline-none px-2 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 text-right" />
              <button onClick={handleSend} disabled={!inputText.trim() || isTyping}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${inputText.trim() && !isTyping ? 'bg-primary text-primary-foreground shadow-neon' : 'bg-accent text-muted-foreground opacity-50'}`}>
                {isTyping ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} className="rotate-180" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SovereignLayout>
  );
}

function CapsuleTool({ icon, label, href, color }: any) {
  const colors: any = { primary: "text-primary hover:bg-primary/10", amber: "text-amber-400 hover:bg-amber-500/10", violet: "text-violet-400 hover:bg-violet-500/10" };
  return (
    <Link to={href}>
      <button className={`w-full flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-accent/50 transition-all btn-hover ${colors[color]}`}>
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{label}</span>
      </button>
    </Link>
  );
}
