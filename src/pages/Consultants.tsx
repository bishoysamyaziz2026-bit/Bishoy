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
      <div className="space-y-10 py-4 px-6">
        <header className="space-y-4">
          <h1 className="text-4xl font-black text-foreground tracking-tight">مجلس الخبراء</h1>
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input placeholder="ابحث عن خبير.." className="w-full bg-card border border-border h-14 rounded-2xl pr-12 pl-4 text-sm font-bold text-foreground outline-none focus:border-primary/30"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </header>
        <main className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-20 opacity-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <p className="text-2xl font-black text-muted-foreground">لا يوجد خبراء متاحين حالياً</p>
              <p className="text-sm text-muted-foreground">سيتم إضافة الخبراء قريباً</p>
            </div>
          ) : (
            filtered?.map((c: any) => (
              <motion.div key={c.id} whileHover={{ scale: 1.01 }} className="glass-cosmic border border-border rounded-[2rem] p-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl border border-primary/20">{c.name?.charAt(0)}</div>
                  <div className="text-right">
                    <p className="text-xl font-black text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground font-bold">{c.specialty || "خبير قانوني"}</p>
                    <div className="flex items-center gap-1 mt-1">{[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < (c.rating || 4) ? "text-amber-500 fill-amber-500" : "text-muted-foreground"} />)}</div>
                  </div>
                </div>
                <Link to={`/consultants/${c.id}/call`}>
                  <button className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-xl">
                    <Video size={16} /> اتصال
                  </button>
                </Link>
              </motion.div>
            ))
          )}
        </main>
      </div>
    </SovereignLayout>
  );
}
