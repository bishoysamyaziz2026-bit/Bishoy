import { Scale, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function Loading() {
  return (
    <div className="fixed inset-0 bg-background z-[500] flex flex-col items-center justify-center gap-8">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="h-24 w-24 rounded-[2rem] bg-primary flex items-center justify-center shadow-3xl border border-white/10"
      >
        <Scale className="h-12 w-12 text-primary-foreground" />
      </motion.div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.5em] animate-pulse">Sovereign Protocol Loading</p>
        <Loader2 className="h-5 w-5 text-primary animate-spin opacity-20" />
      </div>
    </div>
  );
}
