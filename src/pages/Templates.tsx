import { useState } from "react";
import { Download, Search, BookOpen, FileText, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase/provider";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import SovereignButton from "@/components/SovereignButton";

const TEMPLATE_PRICE = 25;
const TEMPLATES = [
  { id: "1", title: "عقد إيجار سكني موحد", description: "نموذج قانوني متوافق مع تعديلات قانون الإيجار الجديد.", category: "عقاري" },
  { id: "2", title: "اتفاقية عدم إفصاح (NDA)", description: "حماية كاملة للأسرار التجارية والملكية الفكرية.", category: "تجاري" },
  { id: "3", title: "توكيل قانوني عام", description: "صيغة رسمية للتمثيل أمام الجهات الحكومية والمحاكم.", category: "عام" },
  { id: "4", title: "عقد عمل قطاع خاص", description: "نموذج يحفظ حقوق العامل وصاحب العمل.", category: "عمالي" },
  { id: "5", title: "مذكرة تفاهم (MoU)", description: "تحديد أطر التعاون المبدئي والشراكات.", category: "تجاري" },
  { id: "6", title: "عريضة دعوى طلاق للضرر", description: "الصيغة المعتمدة لمحاكم الأسرة.", category: "أحوال شخصية" },
  { id: "7", title: "عقد تأسيس شركة LLC", description: "نموذج تأسيس شركة ذات مسؤولية محدودة.", category: "تجاري" },
  { id: "8", title: "إنذار رسمي على يد محضر", description: "صيغة الإنذار القانوني الرسمي.", category: "قضائي" },
];

export default function TemplatesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState({ name: "", idNumber: "", details: "" });
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const userDocRef = useMemoFirebase(() => user && db ? doc(db, "users", user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userDocRef);
  const categories = ["الكل", "عقاري", "تجاري", "أحوال شخصية", "عمالي", "قضائي"];
  const filtered = TEMPLATES.filter(t => t.title.includes(searchTerm) && (activeCategory === "الكل" || t.category === activeCategory));

  const handleDownload = async (template: typeof TEMPLATES[0]) => {
    if (!user) { toast({ variant: "destructive", title: "يرجى الدخول" }); navigate("/auth/login"); return; }
    if (!data.name || !data.idNumber) { toast({ variant: "destructive", title: "بيانات الهوية ناقصة" }); return; }
    const currentBalance = profile?.balance || 0;
    if (currentBalance < TEMPLATE_PRICE && profile?.role !== 'admin') { toast({ variant: "destructive", title: "الرصيد غير كافٍ" }); navigate("/pricing"); return; }
    setIsProcessing(template.id);
    try {
      if (profile?.role !== 'admin') await updateDoc(doc(db!, "users", user.uid), { balance: increment(-TEMPLATE_PRICE) });
      const pdf = new jsPDF();
      pdf.setFont("helvetica", "bold");
      pdf.text("ALMUSTASHAR AI - CERTIFIED DOCUMENT", 105, 20, { align: "center" });
      pdf.line(20, 25, 190, 25);
      pdf.setFontSize(14);
      pdf.text(`Type: ${template.title}`, 20, 45);
      pdf.text(`Beneficiary: ${data.name}`, 20, 60);
      pdf.text(`ID: ${data.idNumber}`, 20, 75);
      pdf.save(`${template.title.replace(/\s/g, '_')}_certified.pdf`);
      toast({ title: "تم إصدار الوثيقة بنجاح ✅" });
    } catch { toast({ variant: "destructive", title: "فشل البروتوكول" }); }
    finally { setIsProcessing(null); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 lg:p-20 font-sans" dir="rtl">
      <header className="max-w-7xl mx-auto mb-24 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 text-right">
          <div className="space-y-6">
            <div className="sovereign-badge"><BookOpen className="h-3 w-3" /> الأرشيف القانوني السيادي</div>
            <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter leading-none">مكتبة <br /><span className="text-gradient">الوثائق</span></h1>
          </div>
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Input placeholder="ابحث في المكتبة السيادية..." className="bg-accent border-border h-20 rounded-[2rem] pr-16 text-xl font-bold shadow-3xl text-right" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-4 space-y-8">
          <Card className="rounded-[3.5rem] border-border shadow-2xl bg-card p-10 sticky top-32">
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-right">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/10"><FileText className="h-6 w-6" /></div>
                <div><h3 className="text-xl font-black">بيانات المصادقة</h3><p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Sovereign Meta-Data</p></div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2"><Label className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">الاسم رباعي</Label><Input value={data.name} onChange={e => setData({ ...data, name: e.target.value })} className="h-14 rounded-2xl bg-accent border-border font-bold" /></div>
                <div className="space-y-2"><Label className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">رقم الهوية</Label><Input value={data.idNumber} onChange={e => setData({ ...data, idNumber: e.target.value })} className="h-14 rounded-2xl bg-accent border-border font-black tracking-widest text-center" /></div>
              </div>
              <div className="pt-6 border-t border-border">
                <div className="flex justify-between items-center bg-accent p-5 rounded-3xl shadow-inner">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">رصيدك</span>
                  <span className="text-2xl font-black text-primary tabular-nums">{profile?.balance || 0} EGP</span>
                </div>
              </div>
            </div>
          </Card>
        </aside>
        <main className="lg:col-span-8 space-y-10">
          <ScrollArea className="w-full pb-4" dir="rtl">
            <div className="flex gap-3">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-primary text-primary-foreground shadow-xl scale-105' : 'bg-accent text-muted-foreground hover:bg-accent/80'}`}>{cat}</button>
              ))}
            </div>
          </ScrollArea>
          <div className="grid gap-6">
            {filtered.map(template => (
              <motion.div key={template.id} whileHover={{ scale: 1.01 }} className="glass-cosmic border border-border rounded-[3rem] p-10 flex items-center justify-between group">
                <div className="text-right space-y-2 flex-1">
                  <h4 className="text-2xl font-black text-foreground">{template.title}</h4>
                  <p className="text-muted-foreground font-bold">{template.description}</p>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{template.category} • {TEMPLATE_PRICE} EGP</span>
                </div>
                <button onClick={() => handleDownload(template)} disabled={isProcessing === template.id} className="bg-primary text-primary-foreground px-8 py-5 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl disabled:opacity-50">
                  {isProcessing === template.id ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />} إصدار
                </button>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
