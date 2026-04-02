import React from 'react';
import { motion } from 'framer-motion';

interface SovereignButtonProps {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function SovereignButton({ text, onClick, type = "button", disabled = false, className = "", icon }: SovereignButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px hsl(var(--primary) / 0.5)" }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-6 rounded-[2.5rem] bg-gradient-to-r from-primary via-[#4f46e5] to-primary text-primary-foreground font-black text-xl shadow-2xl transition-all duration-500 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-5 relative overflow-hidden group border-t border-white/20 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      <span className="relative z-10 flex items-center gap-5">
        {text}
        {icon && <span className="shrink-0 group-hover:rotate-12 transition-transform">{icon}</span>}
      </span>
    </motion.button>
  );
}
