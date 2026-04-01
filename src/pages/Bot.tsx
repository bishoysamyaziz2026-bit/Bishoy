import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, Plus, Camera, FileText, X, Scale } from "lucide-react";
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
      // Simulate AI response since API routes don't exist in Vite
      const aiResponse = `تحليل قانوني: "${text}" - هذا استفسار مهم. بناءً على القوانين المعمول بها، أنصحك بالتالي: يرجى استشارة خبير قانوني متخصص للحصول على رأي قانوني رسمي. يمكنك التواصل مع أحد خبرائنا من مجلس الخبراء.`;
      await addDoc(collection(db, "users", user.uid, "chatHistory"), { role: "ai", text: aiResponse, timestamp: serverTimestamp() });
    } catch { toast({ variant: "destructive", title: "فشل الإرسال السيادي" }); }
    finally { setIsTyping(false); }
  };

  return (
    <SovereignLayout activeId="bot">
      <div className="flex flex-col h-full relative w-full px-4 md:px-10 lg:px-20">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-16 pb-64 pt-10 scrollbar-none">
          <AnimatePresence mode="popLayout">
            {messages?.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="text-center py-32 space-y-12">
                <div className="w-40 h-40 bg-primary/10 rounded-[4rem] mx-auto flex items-center justify-center border border-primary/20 float-sovereign shadow-3xl">
                  <Scale size={80} className="text-primary" />
                </div>
                <div className="space-y-6">
                  <h3 className="text-6xl font-black text-foreground tracking-tighter">أنا بانتظار أوامرك..</h3>
                  <p className="text-2xl font-bold text-muted-foreground italic">اشرح موقفك القانوني وسأقوم بالتحليل الفوري.</p>
                </div>
              </motion.div>
            )}
            {messages?.map((m: any) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`p-12 rounded-[4rem] max-w-[80%] text-2xl font-bold shadow-3xl transition-all ${
                  m.role === 'user' ? 'bg-card text-foreground self-end mr-auto rounded-tr-none border border-border' : 'bg-transparent text-muted-foreground self-start border border-border glass-cosmic'
                }`}>
                {m.text}
                <p className="text-[10px] mt-6 opacity-20 uppercase font-black tracking-[0.4em]">{m.role === 'user' ? 'Citizen Protocol' : 'AI Strategic Analysis'}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex gap-3 px-12 opacity-30">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
          )}
        </div>

        <div className="absolute bottom-24 inset-x-0 z-40 px-4 md:px-10 lg:px-20">
          <div className="max-w-6xl mx-auto relative">
            <AnimatePresence>
              {isCapsuleOpen && (
                <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.9 }}
                  className="absolute bottom-full mb-10 inset-x-0 glass-cosmic rounded-[5rem] p-12 grid grid-cols-3 gap-10 border border-border shadow-3xl">
                  <Tool icon={<Camera size={48} />} label="Vision Scan" href="/bot" color="blue" />
                  <Tool icon={<FileText size={48} />} label="Legal Vault" href="/templates" color="amber" />
                  <Tool icon={<Sparkles size={48} />} label="Live Expert" href="/consultants" color="violet" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="glass-cosmic rounded-[5rem] p-6 flex items-center gap-6 border border-border shadow-3xl">
              <button onClick={() => setIsCapsuleOpen(!isCapsuleOpen)}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-inner ${isCapsuleOpen ? 'bg-accent text-primary rotate-45' : 'bg-card text-muted-foreground hover:text-foreground'}`}>
                {isCapsuleOpen ? <X size={40} /> : <Plus size={40} />}
              </button>
              <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="أصدر أوامرك القانونية أو اشرح قضيتك.." className="flex-1 bg-transparent border-none outline-none px-8 text-2xl font-bold text-foreground placeholder:text-muted-foreground/30" />
              <button onClick={handleSend} disabled={!inputText.trim() || isTyping}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${inputText.trim() && !isTyping ? 'bg-primary text-primary-foreground shadow-3xl scale-110' : 'bg-accent text-muted-foreground opacity-50'}`}>
                {isTyping ? <Loader2 className="animate-spin" size={40} /> : <Send size={40} className="rotate-180" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SovereignLayout>
  );
}

function Tool({ icon, label, href, color }: any) {
  const colors: any = { blue: "text-blue-500 hover:bg-blue-500/5", amber: "text-amber-500 hover:bg-amber-500/5", violet: "text-violet-500 hover:bg-violet-500/5" };
  return (
    <Link to={href} className="flex-1">
      <button className={`w-full flex flex-col items-center gap-8 p-12 bg-card rounded-[4rem] border border-border transition-all group ${colors[color]}`}>
        <div className="group-hover:scale-125 transition-transform duration-500">{icon}</div>
        <span className="text-xs font-black uppercase tracking-[0.5em] opacity-40">{label}</span>
      </button>
    </Link>
  );
}
