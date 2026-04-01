import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ShieldAlert, Loader2, CheckCircle2, XCircle, Clock,
  Users, Plus, Pencil, Trash2, Star, FileText, Download, Crown,
  BadgeCheck, IdCard
} from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase/provider";
import { useToast } from "@/hooks/use-toast";
import { checkSovereignStatus } from "@/lib/roles";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, query, serverTimestamp
} from "firebase/firestore";
import jsPDF from "jspdf";

const TABS = [
  { id: "verification", label: "التحقق من الهوية", icon: <IdCard size={15} /> },
  { id: "experts", label: "إدارة الخبراء", icon: <Users size={15} /> },
  { id: "documents", label: "إصدار الوثائق", icon: <FileText size={15} /> },
];

const TEMPLATES = [
  { id: "1", title: "توكيل رسمي", category: "عقاري" },
  { id: "2", title: "عقد إيجار", category: "عقاري" },
  { id: "3", title: "إفادة قانونية", category: "قضائي" },
  { id: "4", title: "عقد عمل", category: "عمالي" },
  { id: "5", title: "إخلاء طرف", category: "تجاري" },
];

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

export default function SupremeOfficePage() {
  const { user, isUserLoading } = useUser();
  const sovereign = checkSovereignStatus(user?.email);
  const [activeTab, setActiveTab] = useState("verification");

  if (isUserLoading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary h-8 w-8" />
    </div>
  );

  if (!sovereign.isOwner) return (
    <div className="h-screen bg-background flex flex-col items-center justify-center text-destructive gap-4 p-6" dir="rtl">
      <ShieldAlert size={48} className="animate-pulse" />
      <h1 className="text-xl font-black uppercase tracking-widest">غير مصرح بالدخول</h1>
      <p className="text-xs text-muted-foreground text-center">هذا المكتب مخصص للمالك فقط.</p>
    </div>
  );

  return (
    <SovereignLayout activeId="supreme-office">
      <div className="w-full space-y-5 pb-32 px-4 py-2" dir="rtl">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="sovereign-badge"><Crown size={10} /> المكتب السيادي</div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">مركز التحكم</h1>
          <p className="text-xs text-muted-foreground">صلاحيات كاملة · وصول فوري لكل الميزات</p>
        </motion.header>

        {/* Tab Bar */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-neon"
                  : "glass-panel border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "verification" && <VerificationHub key="ver" />}
          {activeTab === "experts" && <ExpertManagement key="exp" />}
          {activeTab === "documents" && <DocumentGeneration key="doc" />}
        </AnimatePresence>
      </div>
    </SovereignLayout>
  );
}

/* ─── VERIFICATION HUB ─────────────────────────────────────────────────────── */
function VerificationHub() {
  const db = useFirestore();
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);

  const verificationsQuery = useMemoFirebase(
    () => db ? collection(db, "verification_requests") : null,
    [db]
  );
  const { data: requests, isLoading } = useCollection(verificationsQuery);

  const handleDecision = async (reqId: string, status: "approved" | "rejected") => {
    if (!db) return;
    setProcessing(reqId);
    try {
      await updateDoc(doc(db, "verification_requests", reqId), {
        status,
        reviewedAt: serverTimestamp(),
      });
      toast({ title: status === "approved" ? "تمت الموافقة ✅" : "تم الرفض ❌" });
    } catch {
      toast({ variant: "destructive", title: "فشل التنفيذ" });
    } finally {
      setProcessing(null);
    }
  };

  const statusBadge = (status: string) => {
    if (status === "approved") return <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle2 size={10} />موافق</span>;
    if (status === "rejected") return <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-md flex items-center gap-1"><XCircle size={10} />مرفوض</span>;
    return <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md flex items-center gap-1"><Clock size={10} />قيد المراجعة</span>;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-4">
      <motion.div variants={item} className="glass-panel rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 mb-1">
          <BadgeCheck size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">طلبات التحقق من الهوية</h3>
        </div>
        <p className="text-[10px] text-muted-foreground">مراجعة وثائق الهوية وبطاقات نقابة المحامين</p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-12 opacity-30"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
      ) : requests.length === 0 ? (
        <motion.div variants={item} className="text-center py-16 space-y-3">
          <BadgeCheck size={32} className="text-muted-foreground/30 mx-auto" />
          <p className="text-sm font-bold text-muted-foreground">لا توجد طلبات معلقة</p>
          <p className="text-[10px] text-muted-foreground">ستظهر هنا طلبات التحقق من المستخدمين</p>
        </motion.div>
      ) : (
        requests.map((req: any) => (
          <motion.div key={req.id} variants={item} className="glass-panel border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                  {req.fullName?.charAt(0) || "؟"}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{req.fullName || "—"}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">{req.email || "—"}</p>
                </div>
              </div>
              {statusBadge(req.status || "pending")}
            </div>

            <div className="grid grid-cols-2 gap-2 text-right">
              <div className="bg-accent rounded-xl p-3 space-y-1">
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">نوع الطلب</p>
                <p className="text-xs font-bold text-foreground">{req.type === "lawyer" ? "بطاقة نقابة" : "بطاقة هوية"}</p>
              </div>
              <div className="bg-accent rounded-xl p-3 space-y-1">
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">رقم الهوية</p>
                <p className="text-xs font-bold text-foreground font-mono">{req.idNumber || "—"}</p>
              </div>
            </div>

            {req.documentUrl && (
              <a href={req.documentUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary text-xs font-bold hover:underline">
                <FileText size={12} /> عرض الوثيقة المرفوعة
              </a>
            )}

            {(req.status === "pending" || !req.status) && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  data-testid={`btn-approve-${req.id}`}
                  disabled={!!processing}
                  onClick={() => handleDecision(req.id, "approved")}
                  className="h-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  {processing === req.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  موافقة
                </button>
                <button
                  data-testid={`btn-reject-${req.id}`}
                  disabled={!!processing}
                  onClick={() => handleDecision(req.id, "rejected")}
                  className="h-10 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:bg-red-500/20 disabled:opacity-50"
                >
                  {processing === req.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                  رفض
                </button>
              </div>
            )}
          </motion.div>
        ))
      )}
    </motion.div>
  );
}

/* ─── EXPERT MANAGEMENT ─────────────────────────────────────────────────────── */
const EMPTY_EXPERT = { name: "", specialty: "", rating: 5, phone: "", bio: "" };

function ExpertManagement() {
  const db = useFirestore();
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY_EXPERT);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const consultantsQuery = useMemoFirebase(() => db ? collection(db, "consultants") : null, [db]);
  const { data: consultants, isLoading } = useCollection(consultantsQuery);

  const openAdd = () => { setForm(EMPTY_EXPERT); setEditing(null); setShowForm(true); };
  const openEdit = (c: any) => { setForm({ name: c.name || "", specialty: c.specialty || "", rating: c.rating || 5, phone: c.phone || "", bio: c.bio || "" }); setEditing(c.id); setShowForm(true); };
  const cancel = () => { setShowForm(false); setEditing(null); setForm(EMPTY_EXPERT); };

  const handleSave = async () => {
    if (!db || !form.name.trim()) { toast({ variant: "destructive", title: "الاسم مطلوب" }); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, "consultants", editing), { ...form, updatedAt: serverTimestamp() });
        toast({ title: "تم تعديل الخبير ✅" });
      } else {
        await addDoc(collection(db, "consultants"), { ...form, createdAt: serverTimestamp() });
        toast({ title: "تم إضافة الخبير ✅" });
      }
      cancel();
    } catch { toast({ variant: "destructive", title: "فشل الحفظ" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "consultants", id));
      toast({ title: "تم الحذف" });
    } catch { toast({ variant: "destructive", title: "فشل الحذف" }); }
    finally { setDeleting(null); }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-4">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">الخبراء القانونيون</h3>
          <p className="text-[10px] text-muted-foreground">{consultants.length} خبير مسجل</p>
        </div>
        <button
          data-testid="btn-add-expert"
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-bold shadow-neon btn-hover"
        >
          <Plus size={14} /> إضافة خبير
        </button>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="glass-panel border border-primary/20 rounded-2xl p-5 space-y-4"
          >
            <h4 className="text-sm font-bold text-primary">{editing ? "تعديل الخبير" : "إضافة خبير جديد"}</h4>
            <div className="grid grid-cols-2 gap-3">
              <input
                data-testid="input-expert-name"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="الاسم الكامل *" className="input-clean text-sm text-right col-span-2"
              />
              <input
                data-testid="input-expert-specialty"
                value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })}
                placeholder="التخصص" className="input-clean text-sm text-right"
              />
              <input
                data-testid="input-expert-phone"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="رقم الهاتف" className="input-clean text-sm text-right"
              />
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] text-muted-foreground font-bold">التقييم: {form.rating}/5</label>
                <input
                  data-testid="input-expert-rating"
                  type="range" min={1} max={5} value={form.rating}
                  onChange={e => setForm({ ...form, rating: parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
              <textarea
                data-testid="input-expert-bio"
                value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                placeholder="نبذة تعريفية" rows={2}
                className="input-clean text-sm text-right col-span-2 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={cancel} className="h-10 border border-border text-muted-foreground rounded-xl text-xs font-bold hover:bg-accent transition-all">إلغاء</button>
              <button
                data-testid="btn-save-expert"
                onClick={handleSave} disabled={saving}
                className="h-10 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-neon btn-hover flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : null}
                {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12 opacity-30"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
      ) : consultants.length === 0 ? (
        <motion.div variants={item} className="text-center py-16 space-y-3">
          <Users size={32} className="text-muted-foreground/30 mx-auto" />
          <p className="text-sm font-bold text-muted-foreground">لا يوجد خبراء بعد</p>
          <p className="text-[10px] text-muted-foreground">ابدأ بإضافة أول خبير قانوني</p>
        </motion.div>
      ) : (
        consultants.map((c: any) => (
          <motion.div key={c.id} variants={item} className="glass-panel border border-border rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                {c.name?.charAt(0)}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.specialty || "خبير قانوني"}</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={9} className={i < (c.rating || 4) ? "text-amber-400 fill-amber-400" : "text-muted"} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                data-testid={`btn-edit-expert-${c.id}`}
                onClick={() => openEdit(c)}
                className="p-2 text-primary bg-primary/5 border border-primary/15 rounded-lg transition-all hover:bg-primary/15"
              >
                <Pencil size={13} />
              </button>
              <button
                data-testid={`btn-delete-expert-${c.id}`}
                onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                className="p-2 text-red-400 bg-red-500/5 border border-red-500/15 rounded-lg transition-all hover:bg-red-500/15 disabled:opacity-50"
              >
                {deleting === c.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}

/* ─── DOCUMENT GENERATION ───────────────────────────────────────────────────── */
function DocumentGeneration() {
  const { user, profile: authProfile } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: authProfile?.fullName || "", idNumber: "" });
  const [selected, setSelected] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleIssue = async () => {
    if (!form.name.trim() || !form.idNumber.trim()) {
      toast({ variant: "destructive", title: "يرجى إدخال الاسم ورقم الهوية" });
      return;
    }
    if (!selected) {
      toast({ variant: "destructive", title: "اختر نوع الوثيقة أولاً" });
      return;
    }
    const template = TEMPLATES.find(t => t.id === selected);
    if (!template) return;

    setProcessing(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      pdf.setFillColor(15, 15, 20);
      pdf.rect(0, 0, 210, 297, "F");

      pdf.setDrawColor(30, 120, 255);
      pdf.setLineWidth(1.2);
      pdf.rect(10, 10, 190, 277);

      pdf.setDrawColor(30, 120, 255, 0.3);
      pdf.setLineWidth(0.4);
      pdf.rect(13, 13, 184, 271);

      pdf.setTextColor(30, 120, 255);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("ALMUSTASHAR AI · CERTIFIED LEGAL DOCUMENT", 105, 24, { align: "center" });

      pdf.setDrawColor(30, 120, 255);
      pdf.setLineWidth(0.5);
      pdf.line(30, 28, 180, 28);

      pdf.setTextColor(220, 220, 230);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text(template.title, 105, 50, { align: "center" });

      pdf.setTextColor(30, 120, 255);
      pdf.setFontSize(8);
      pdf.text(`[ ${template.category} ]`, 105, 58, { align: "center" });

      pdf.setDrawColor(40, 40, 55);
      pdf.setFillColor(22, 22, 32);
      pdf.roundedRect(25, 68, 160, 55, 4, 4, "FD");

      pdf.setTextColor(120, 130, 160);
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "bold");
      pdf.text("BENEFICIARY", 38, 80);
      pdf.text("NATIONAL ID", 38, 98);
      pdf.text("DOCUMENT REF", 38, 116);

      pdf.setTextColor(220, 220, 230);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(form.name, 120, 80, { align: "right" });
      pdf.text(form.idNumber, 120, 98, { align: "right" });
      const refNum = `ALM-${Date.now().toString().slice(-8)}`;
      pdf.text(refNum, 120, 116, { align: "right" });

      pdf.setTextColor(80, 90, 120);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      const legalText = [
        "هذه الوثيقة صادرة من منصة المستشار AI وتحمل مرجعاً إلكترونياً موثقاً.",
        "تُعدّ هذه الوثيقة سارية المفعول وفقاً للأطر القانونية المعمول بها.",
        "لأي استفسار، يُرجى التواصل مع المنصة عبر القنوات الرسمية.",
        "This document is digitally certified by Almustashar AI Platform.",
      ];
      legalText.forEach((line, i) => {
        pdf.text(line, 105, 140 + i * 8, { align: "center" });
      });

      pdf.setDrawColor(30, 120, 255);
      pdf.setLineWidth(0.3);
      pdf.line(30, 178, 180, 178);

      pdf.setTextColor(30, 120, 255);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("OFFICIAL STAMP & VERIFICATION", 105, 188, { align: "center" });

      pdf.setDrawColor(30, 120, 255);
      pdf.setLineWidth(0.4);
      pdf.circle(105, 215, 22);

      pdf.setTextColor(30, 120, 255);
      pdf.setFontSize(6.5);
      pdf.text("ALMUSTASHAR", 105, 211, { align: "center" });
      pdf.text("AI PLATFORM", 105, 217, { align: "center" });
      pdf.setFontSize(5.5);
      pdf.text("CERTIFIED LEGAL DOC", 105, 223, { align: "center" });

      const issuedDate = new Date().toLocaleDateString("ar-EG");
      pdf.setTextColor(80, 90, 120);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text(`تاريخ الإصدار: ${issuedDate}`, 105, 260, { align: "center" });
      pdf.text(`المرجع: ${refNum}`, 105, 268, { align: "center" });

      pdf.setTextColor(30, 120, 255);
      pdf.setFontSize(6);
      pdf.text("www.almustashar.ai · جميع الحقوق محفوظة", 105, 278, { align: "center" });

      pdf.save(`${template.title.replace(/\s/g, "_")}_${refNum}.pdf`);
      toast({ title: `تم إصدار وثيقة "${template.title}" بنجاح ✅` });
    } catch {
      toast({ variant: "destructive", title: "فشل إصدار الوثيقة" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-4">
      <motion.div variants={item} className="glass-panel border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">بيانات المستفيد</h3>
        </div>
        <div className="space-y-3">
          <input
            data-testid="input-doc-name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="الاسم الرباعي الكامل"
            className="input-clean text-sm text-right w-full"
          />
          <input
            data-testid="input-doc-id"
            value={form.idNumber}
            onChange={e => setForm({ ...form, idNumber: e.target.value })}
            placeholder="رقم الهوية الوطنية"
            className="input-clean text-sm text-right w-full font-mono"
          />
        </div>
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        <h3 className="text-sm font-bold text-foreground px-1">اختر نوع الوثيقة</h3>
        <div className="grid grid-cols-1 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              data-testid={`btn-template-${t.id}`}
              onClick={() => setSelected(t.id)}
              className={`w-full p-4 rounded-2xl border text-right transition-all btn-hover flex items-center justify-between ${
                selected === t.id
                  ? "border-primary/40 bg-primary/8 text-primary"
                  : "glass-panel border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-sm font-bold">{t.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-accent px-2 py-1 rounded-md font-medium">{t.category}</span>
                {selected === t.id && <ShieldCheck size={14} className="text-primary" />}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <button
          data-testid="btn-issue-document"
          onClick={handleIssue}
          disabled={processing || !selected}
          className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-neon btn-hover flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {processing ? (
            <><Loader2 size={16} className="animate-spin" /> جاري الإصدار...</>
          ) : (
            <><Download size={16} /> إصدار الوثيقة الرسمية</>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
