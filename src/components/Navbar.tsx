import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Scale, User, LogOut, LayoutDashboard, Crown } from 'lucide-react';
import { roles as ROLES_LIST } from '@/lib/roles';

export default function Navbar() {
  const { user, profile, signOut, role } = useAuth();
  const location = useLocation();

  if (location.pathname === "/auth/login" || location.pathname === "/auth/signup") return null;

  return (
    <nav className="flex flex-col border-b border-border glass-cosmic sticky top-0 z-[100] shadow-3xl">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center p-4 px-6 md:px-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-[#4f46e5] flex items-center justify-center shadow-lg text-primary-foreground font-black border border-white/10 group-hover:scale-110 transition-all">
            <Scale className="h-6 w-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-xl tracking-tighter leading-none text-foreground">المستشار <span className="text-primary">AI</span></h1>
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">Sovereign Law Planet</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-8 text-xs font-black uppercase tracking-widest text-muted-foreground">
            <Link to="/bot" className="hover:text-primary transition-colors">البوت الذكي</Link>
            <Link to="/consultants" className="hover:text-primary transition-colors">مجلس الخبراء</Link>
            <Link to="/templates" className="hover:text-primary transition-colors">المكتبة</Link>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/bot" className="text-xs font-black flex items-center gap-3 bg-gradient-to-r from-primary to-[#4f46e5] text-primary-foreground px-5 py-3 rounded-xl border-none hover:scale-105 transition-all shadow-xl">
                {role === ROLES_LIST.ADMIN ? <Crown className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                <span className="hidden xs:inline">{profile?.fullName?.split(' ')[0] || "القيادة"}</span>
              </Link>
              <button onClick={() => signOut()} className="p-2.5 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-all border border-destructive/10" title="تسجيل خروج">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link to="/auth/login">
              <button className="text-xs font-black bg-primary text-primary-foreground px-8 py-3 rounded-xl shadow-xl hover:scale-105 transition-all">دخول سيادي</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
