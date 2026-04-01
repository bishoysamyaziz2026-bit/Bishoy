import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, Plus, Camera, FileText, X, Scale, Users, Save } from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseClient } from "@/lib/supabaseClient";

interface Message {
  id: string;
  role: string;
  text: string;
  timestamp?: string;
}

const LEGAL_EXPERT_PROMPT = `أنت "المستشار AI"، خبير قانوني مصري كبير متخصص في القانون المصري والقانون الدولي. لديك خبرة 25 سنة في العمل القانوني.
- تقدم استشارات قانونية دقيقة ومفصلة
- تشرح المواد القانونية والقوانين بوضوح
- تساعد في تحليل الحالات القانونية المعقدة
- تقدم حلولاً قانونية عملية
- تستخدم اللغة العربية الفصحى مع تبسيط المفاهيم
- تحافظ على سرية المعلومات وتؤكد أهمية التشاور مع محامٍ مرخص
تذكر: أنت مستشار قانوني ذكي وليس محاميًا، فقدم المساعدة والتوجيه الأفضل.`;

export default function BotPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isCapsuleOpen, setIsCapsuleOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const chatQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "chatHistory"), orderBy("timestamp", "asc"), limit(100));
  }, [db, user]);
  const { data: messages } = useCollection(chatQuery);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping, localMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: inputText,
      timestamp: new Date().toISOString(),
    };

    setInputText("");
    setIsTyping(true);
    setLocalMessages([...localMessages, userMessage]);

    try {
      // Save user message to Firestore
      const docRef = await addDoc(
        collection(db, "users", user.uid, "chatHistory"),
        {
          role: "user",
          text: inputText,
          timestamp: serverTimestamp(),
        }
      );

      // Prepare conversation history
      const conversationHistory = [
        { role: "user", parts: [{ text: LEGAL_EXPERT_PROMPT }] },
        ...(messages || []).map((m: Message) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        })),
        { role: "user", parts: [{ text: inputText }] },
      ];

      // Stream response from Gemini
      let fullResponse = "";
      const result = await model.generateContentStream({
        contents: conversationHistory,
      });

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        setLocalMessages((prev) => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.role === "assistant") {
            updated[updated.length - 1].text = fullResponse;
          } else {
            updated.push({
              id: `stream-${Date.now()}`,
              role: "assistant",
              text: fullResponse,
              timestamp: new Date().toISOString(),
            });
          }
          return updated;
        });
      }

      // Save assistant message to Firestore
      await addDoc(
        collection(db, "users", user.uid, "chatHistory"),
        {
          role: "assistant",
          text: fullResponse,
          timestamp: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error("خطأ في معالجة الرسالة:", error);
      toast({ variant: "destructive", title: "حدث خطأ، حاول مرة أخرى" });
      setLocalMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSaveCase = async () => {
    if ((!messages || messages.length === 0) && localMessages.length === 0) return;
    if (!user) return;
    try {
      const caseData = {
        userId: user.uid,
        title: `قضية ${new Date().toLocaleDateString('ar')}`,
        messages: [...(messages || []), ...localMessages],
        createdAt: new Date().toISOString(),
      };
      await supabaseClient.from('cases').insert(caseData);
      toast({ title: "تم حفظ القضية بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل حفظ القضية" });
    }
  };

  return (
    <SovereignLayout activeId="bot">
      <div className="flex flex-col h-full relative w-full px-4">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-44 pt-4 scrollbar-none">
          <AnimatePresence mode="popLayout">
            {(!messages || messages.length === 0) && localMessages.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center border border-primary/20 float-gentle neon-glow">
                  <Scale size={36} className="text-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-foreground tracking-tight">المستشار AI</h3>
                  <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">اشرح موقفك القانوني وسأقوم بالتحليل الفوري</p>
                </div>
              </motion.div>
            )}
            {(messages || []).concat(localMessages).map((m: Message) => (
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
              <button onClick={handleSaveCase} disabled={(!messages || messages.length === 0) && localMessages.length === 0}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${(messages && messages.length > 0) || localMessages.length > 0 ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25' : 'bg-accent text-muted-foreground opacity-50'}`}>
                <Save size={16} />
              </button>
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

function CapsuleTool({ icon, label, href, color }: { icon: React.ReactNode; label: string; href: string; color: string }) {
  const colors: Record<string, string> = { primary: "text-primary hover:bg-primary/10", amber: "text-amber-400 hover:bg-amber-500/10", violet: "text-violet-400 hover:bg-violet-500/10" };
  return (
    <Link to={href}>
      <button className={`w-full flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-accent/50 transition-all btn-hover ${colors[color]}`}>
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{label}</span>
      </button>
    </Link>
  );
}
