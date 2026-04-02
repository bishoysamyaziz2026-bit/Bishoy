import { useState } from "react";
import { Download, Search, BookOpen, FileText, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase/provider";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TEMPLATE_PRICE = 25;
const TEMPLATES = [
  { id: "1", title: "عقد إيجار سكني موحد", description: "نموذج قانوني متوافق مع التعديلات الجديدة.", category: "عقاري" },
  { id: "2", title: "اتفاقية عدم إفصاح (NDA)", description: "حماية كاملة للأسرار التجارية.", category: "تجاري" },
  { id: "3", title: "توكيل قانوني عام", description: "صيغة رسمية للتمثيل أمام الجهات.", category: "عام" },
  { id: "4", title: "عقد عمل قطاع خاص", description: "نموذج يحفظ حقوق العامل وصاحب العمل.", category: "عمالي" },
  { id: "5", title: "مذكرة تفاهم (MoU)", description: "تحديد أطر التعاون والشراكات.", category: "تجاري" },
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
  const [data, setData] = useState({ name: "", idNumber: "" });
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
    } catch { toast({ variant: "destructive", title: "فشل الإصدار" }); }
    finally { setIsProcessing(null); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 pb-20" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="space-y-4">
          <div className="space-y-1">
            <div className="sovereign-badge"><BookOpen className="h-3 w-3" /> المكتبة القانونية</div>
            <h1 className="text-2xl font-black tracking-tight">الوثائق <span className="text-gradient">المعتمدة</span></h1>
          </div>
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input placeholder="ابحث في المكتبة..." className="input-clean pr-11 text-right text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </header>

        {/* Data Fields */}
        <div className="glass-panel rounded-2xl border border-border p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold">بيانات المستفيد</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={data.name} onChange={e => setData({ ...data, name: e.target.value })} placeholder="الاسم رباعي" className="input-clean text-sm text-right" />
            <input value={data.idNumber} onChange={e => setData({ ...data, idNumber: e.target.value })} placeholder="رقم الهوية" className="input-clean text-sm text-center font-mono tracking-wider" />
          </div>
          {profile && (
            <div className="flex justify-between items-center bg-accent p-3 rounded-xl">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">رصيدك</span>
              <span className="text-sm font-black text-primary tabular-nums">{profile.balance || 0} EGP</span>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary text-primary-foreground shadow-neon' : 'bg-accent text-muted-foreground hover:text-foreground'}`}>{cat}</button>
          ))}
        </div>

        {/* Templates */}
        <div className="space-y-3">
          {filtered.map(template => (
            <motion.div key={template.id} whileHover={{ scale: 1.01 }} className="glass-panel border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="text-right flex-1 space-y-1">
                <h4 className="text-sm font-bold text-foreground">{template.title}</h4>
                <p className="text-[10px] text-muted-foreground">{template.description}</p>
                <span className="text-[9px] font-bold text-primary uppercase">{template.category} • {TEMPLATE_PRICE} EGP</span>
              </div>
              <button onClick={() => handleDownload(template)} disabled={isProcessing === template.id} className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 btn-hover shadow-neon disabled:opacity-50 flex-shrink-0">
                {isProcessing === template.id ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />} إصدار
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
