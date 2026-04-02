import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Sparkles, Plus, Camera, FileText, X, Scale, Users, Save, Download, Upload, File } from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseClient } from "@/lib/supabaseClient";
import { logActivity } from "@/lib/caseUtils";
import * as pdfjsLib from 'pdfjs-dist';

interface Message {
  id: string;
  role: string;
  text: string;
  timestamp?: string;
  documentName?: string;
}

interface DocumentAnalysis {
  id: string;
  fileName: string;
  extractedText: string;
  uploadedAt: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentAnalysis[]>([]);

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

  // Document extraction from PDF/Image
  const extractTextFromDocument = async (file: File): Promise<string> => {
    try {
      if (file.type.includes("pdf")) {
        // PDF extraction using FileReader
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let extractedText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          extractedText += text.items
            .map((item: { str?: string }) => item.str || "")
            .join(" ");
        }
        return extractedText;
      } else if (file.type.includes("image")) {
        // For images, read as base64 and use Gemini's vision capability
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || "");
          reader.readAsDataURL(file);
        });
      }
      return "";
    } catch (error) {
      console.error("خطأ في استخراج النص:", error);
      throw error;
    }
  };

  // Handle document upload and analysis
  const handleDocumentUpload = async (file: File) => {
    if (!file || !user) return;

    setIsUploadingDocument(true);
    try {
      const extractedText = await extractTextFromDocument(file);
      
      // Add document to uploaded list
      const docAnalysis: DocumentAnalysis = {
        id: Date.now().toString(),
        fileName: file.name,
        extractedText: extractedText.substring(0, 500), // Store first 500 chars
        uploadedAt: new Date().toISOString(),
      };
      setUploadedDocuments([...uploadedDocuments, docAnalysis]);

      // Create analysis message
      const analysisPrompt = `تم تحميل مستند: "${file.name}"\n\nالمحتوى:\n${extractedText.substring(0, 1000)}...\n\nهل تريد تحليل هذا المستند؟`;
      
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        text: analysisPrompt,
        documentName: file.name,
        timestamp: new Date().toISOString(),
      };

      setLocalMessages([...localMessages, userMessage]);

      // Save to Firestore
      await addDoc(
        collection(db, "users", user.uid, "chatHistory"),
        {
          role: "user",
          text: analysisPrompt,
          documentName: file.name,
          timestamp: serverTimestamp(),
        }
      );

      // Log activity
      await logActivity(
        user.uid,
        "رفع_مستند",
        `تم رفع مستند: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`
      );

      toast({ title: "تم تحميل المستند", description: `تم تحليل ${file.name} بنجاح` });
    } catch (error) {
      console.error("خطأ في معالجة المستند:", error);
      toast({ variant: "destructive", title: "فشل تحميل المستند", description: "حاول مجدداً" });
    } finally {
      setIsUploadingDocument(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      const allMessages = [...(messages || []), ...localMessages];
      const caseData = {
        userId: user.uid,
        case_number: `CASE-${Date.now()}`,
        client_name: user.displayName || user.email || "عميل",
        opponent: "غير محدد",
        next_hearing_date: null,
        title: `قضية ${new Date().toLocaleDateString('ar')}`,
        messages: allMessages,
        createdAt: new Date().toISOString(),
      };
      
      const { data, error } = await supabaseClient.from('cases').insert(caseData).select();
      
      if (error) throw error;

      // Log activity
      await logActivity(
        user.uid,
        "حفظ_قضية",
        `تم حفظ قضية جديدة - ${caseData.case_number} بـ ${allMessages.length} رسالة`
      );

      toast({ title: "تم حفظ القضية بنجاح", description: `رقم القضية: ${caseData.case_number}` });
    } catch (error) {
      console.error("خطأ في حفظ القضية:", error);
      toast({ variant: "destructive", title: "فشل حفظ القضية" });
    }
  };

  // Generate and download PDF
  const generatePDF = async () => {
    if (!user) return;
    try {
      const allMessages = [...(messages || []), ...localMessages];
      if (allMessages.length === 0) {
        toast({ title: "لا توجد رسائل", description: "ابدأ محادثة أولاً" });
        return;
      }

      // Simple HTML to PDF generation
      const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>استشارة قانونية</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; direction: rtl; }
    h1 { color: #1a1a2e; border-bottom: 3px solid #16a34a; padding-bottom: 10px; }
    h3 { color: #16a34a; margin-top: 20px; }
    .message { margin: 15px 0; padding: 12px; border-radius: 8px; }
    .user-msg { background: #dcfce7; border-right: 4px solid #16a34a; }
    .assistant-msg { background: #f1f5f9; border-right: 4px solid #64748b; }
    .metadata { color: #666; font-size: 12px; margin-top: 5px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <h1>📋 استشارة قانونية - المستشار AI</h1>
  <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar')}</p>
  <p><strong>الوقت:</strong> ${new Date().toLocaleTimeString('ar')}</p>
  
  <h3>محتوى الاستشارة:</h3>
  ${allMessages
    .map((msg: Message) => `
    <div class="message ${msg.role === 'user' ? 'user-msg' : 'assistant-msg'}">
      <strong>${msg.role === 'user' ? 'أنت' : 'المستشار AI'}:</strong>
      <p>${msg.text}</p>
      ${msg.documentName ? `<div class="metadata">📄 مستند: ${msg.documentName}</div>` : ''}
      ${msg.timestamp ? `<div class="metadata">⏰ ${new Date(msg.timestamp).toLocaleString('ar')}</div>` : ''}
    </div>
  `)
    .join('')}

  <div class="footer">
    <p>⚖️ هذه الاستشارة معلومات قانونية فقط وليست بديل عن تمثيل قانوني مهني.</p>
    <p>تم إنشاؤها بواسطة منصة المستشار AI</p>
  </div>
</body>
</html>
      `;

      // Create blob and download
      const element = document.createElement('a');
      const file = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = `استشارة-قانونية-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast({ title: "تم التحميل", description: "تم تحميل الاستشارة بنجاح" });
    } catch (error) {
      console.error("خطأ في تحميل الملف:", error);
      toast({ variant: "destructive", title: "فشل التحميل" });
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
                  className="absolute bottom-full mb-3 inset-x-0 glass-panel rounded-2xl p-3 grid grid-cols-4 gap-2 border border-border shadow-3xl">
                  <CapsuleTool icon={<Camera size={20} />} label="Vision Scan" href="/bot" color="primary" />
                  <CapsuleTool icon={<FileText size={20} />} label="Legal Vault" href="/templates" color="amber" />
                  <CapsuleTool icon={<Users size={20} />} label="Live Expert" href="/consultants" color="violet" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingDocument}
                    className="w-full flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-accent/50 transition-all hover:bg-accent/75 text-rose-400 hover:text-rose-500"
                  >
                    <Upload size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Upload Doc</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleDocumentUpload(file);
              }}
              disabled={isUploadingDocument}
            />
            <div className="glass-panel rounded-2xl p-2 flex items-center gap-2 border border-border shadow-3xl">
              <button onClick={() => setIsCapsuleOpen(!isCapsuleOpen)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isCapsuleOpen ? 'bg-primary/15 text-primary rotate-45' : 'bg-accent text-muted-foreground hover:text-foreground'}`}>
                {isCapsuleOpen ? <X size={18} /> : <Plus size={18} />}
              </button>
              <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اكتب استفسارك القانوني..." className="flex-1 bg-transparent border-none outline-none px-2 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 text-right" />
              <button
                onClick={generatePDF}
                disabled={(!messages || messages.length === 0) && localMessages.length === 0}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${(messages && messages.length > 0) || localMessages.length > 0 ? 'bg-violet-500/15 text-violet-400 hover:bg-violet-500/25' : 'bg-accent text-muted-foreground opacity-50'}`}
                title="تحميل الاستشارة كـ PDF"
              >
                <Download size={16} />
              </button>
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
