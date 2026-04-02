import { useState, useEffect } from "react";
import { Users, FileText, Database, LogOut, Lock, Activity, Settings, BarChart3, Loader2 } from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useToast } from "@/hooks/use-toast";
import { supabaseClient } from "@/lib/supabaseClient";
import { getActivityLogs, getUserCases } from "@/lib/caseUtils";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface SystemStats {
  users: number;
  cases: number;
  loading: boolean;
}

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
}

interface Permission {
  id: string;
  userId: string;
  role: string;
  permissions: string[];
  grantedAt: string;
}

export default function SystemControlPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<SystemStats>({ users: 0, cases: 0, loading: true });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);

  // Verify user is admin
  useEffect(() => {
    if (user?.email !== "bishoysamy390@gmail.com") {
      toast({ variant: "destructive", title: "وصول مرفوع", description: "أنت غير مخول للوصول لهذه الصفحة" });
      navigate("/dashboard");
    }
  }, [user, navigate, toast]);

  // Load stats from Supabase
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true }));

        const [usersRes, casesRes] = await Promise.all([
          supabaseClient.from("profiles").select("id", { count: "exact" }),
          supabaseClient.from("cases").select("id", { count: "exact" }),
        ]);

        setStats({
          users: usersRes.count || 0,
          cases: casesRes.count || 0,
          loading: false,
        });
      } catch (error) {
        console.error("خطأ في تحميل الإحصائيات:", error);
        toast({ variant: "destructive", title: "خطأ في تحميل البيانات" });
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    loadStats();
  }, [toast]);

  // Load activity logs
  const loadActivityLogs = async () => {
    try {
      const logs = await getActivityLogs(user?.email);
      setActivityLogs(logs as any);
    } catch (error) {
      console.error("خطأ في تحميل السجلات:", error);
      toast({ variant: "destructive", title: "فشل تحميل السجلات" });
    }
  };

  // Load permissions
  const loadPermissions = async () => {
    try {
      const { data, error } = await supabaseClient
        .from("user_permissions")
        .select("*")
        .order("grantedAt", { ascending: false });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error("خطأ في تحميل الأذونات:", error);
      toast({ variant: "destructive", title: "فشل تحميل الأذونات" });
    }
  };

  return (
    <SovereignLayout activeId="system-control">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-foreground">التحكم في النظام</h1>
          <p className="text-muted-foreground">لوحة تحكم النظام للمسؤولين فقط - مراقبة واحصائيات شاملة</p>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Users size={16} className="text-primary" />
                  عدد المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="text-2xl font-bold">جاري...</span>
                  </div>
                ) : (
                  <p className="text-3xl font-black text-primary">{stats.users}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <FileText size={16} className="text-amber-400" />
                  عدد الحالات
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="text-2xl font-bold">جاري...</span>
                  </div>
                ) : (
                  <p className="text-3xl font-black text-amber-400">{stats.cases}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Database size={16} className="text-violet-400" />
                  حالة النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-lg font-bold text-green-500">يعمل بكفاءة</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Management Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-start gap-3"
                onClick={loadActivityLogs}
              >
                <div className="flex items-center gap-2">
                  <Activity size={20} className="text-primary" />
                  <span className="font-bold">سجلات النشاط</span>
                </div>
                <span className="text-xs text-muted-foreground">عرض جميع أنشطة النظام والمستخدمين</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>سجلات النشاط</DialogTitle>
                <DialogDescription>آخر 10 أنشطة في النظام</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activityLogs.length > 0 ? (
                  activityLogs.map((log: any) => (
                    <div key={log.id} className="p-3 rounded-lg bg-accent/50 border border-border/30 text-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-foreground">{log.action}</span>
                        <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString('ar')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">👤 {log.userId}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">لا توجد سجلات نشاط حالياً</p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col items-start gap-3"
                onClick={loadPermissions}
              >
                <div className="flex items-center gap-2">
                  <Lock size={20} className="text-amber-400" />
                  <span className="font-bold">إدارة الأذونات</span>
                </div>
                <span className="text-xs text-muted-foreground">تعديل صلاحيات المستخدمين</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إدارة الأذونات</DialogTitle>
                <DialogDescription>جميع أذونات المستخدمين في النظام</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {permissions.length > 0 ? (
                  permissions.map((perm) => (
                    <div key={perm.id} className="p-3 rounded-lg bg-accent/50 border border-border/30">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-foreground">{perm.role}</span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">{perm.permissions.length} أذونات</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {perm.permissions.map((p) => (
                          <span key={p} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">لا توجد أذونات محددة حالياً</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Additional Control Options */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} className="text-violet-400" />
              خيارات النظام الإضافية
            </CardTitle>
            <CardDescription>تحكم متقدم بإعدادات النظام</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="secondary" className="w-full justify-start" disabled>
              <BarChart3 size={16} className="mr-2" />
              تقارير مفصلة (قريباً)
            </Button>
            <Button variant="secondary" className="w-full justify-start" disabled>
              <Database size={16} className="mr-2" />
              نسخة احتياطية (قريباً)
            </Button>
            <Button variant="secondary" className="w-full justify-start" disabled>
              <LogOut size={16} className="mr-2" />
              تسجيل الخروج (قريباً)
            </Button>
          </CardContent>
        </Card>
      </div>
    </SovereignLayout>
  );
}