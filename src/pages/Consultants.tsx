import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, Video, Star } from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import { motion } from "framer-motion";

export default function ConsultantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const db = useFirestore();
  const { data: consultants, isLoading } = useCollection(useMemoFirebase(() => db ? collection(db, "consultants") : null, [db]));

  const filtered = consultants?.filter((c: any) => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <SovereignLayout activeId="consultants">
      <div className="space-y-4 py-2 px-4">
        <header className="space-y-3">
          <h1 className="text-2xl font-black text-foreground tracking-tight">الخبراء</h1>
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input placeholder="ابحث عن خبير.." className="input-clean pr-11 text-right text-sm"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </header>
        <main className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-16 opacity-20"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-lg font-bold text-muted-foreground">لا يوجد خبراء متاحين حالياً</p>
              <p className="text-xs text-muted-foreground">سيتم إضافة الخبراء قريباً</p>
            </div>
          ) : (
            filtered?.map((c: any) => (
              <motion.div key={c.id} whileHover={{ scale: 1.01 }} className="glass-panel border border-border rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">{c.name?.charAt(0)}</div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.specialty || "خبير قانوني"}</p>
                    <div className="flex items-center gap-0.5 mt-1">{[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < (c.rating || 4) ? "text-amber-400 fill-amber-400" : "text-muted"} />)}</div>
                  </div>
                </div>
                <button className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 btn-hover shadow-neon">
                  <Video size={14} /> اتصال
                </button>
              </motion.div>
            ))
          )}
        </main>
      </div>
    </SovereignLayout>
  );
}
