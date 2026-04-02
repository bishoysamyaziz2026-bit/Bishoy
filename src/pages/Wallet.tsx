import { useState, useEffect } from "react";
import { Wallet as WalletIcon, CreditCard, ArrowDownRight, ArrowUpRight, Plus, MessageCircle, TrendingUp } from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUserWallet, getWalletTransactions, WalletTransaction, UserWallet } from "@/lib/advancedUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadWalletData();
    }
  }, [user?.uid]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const walletData = await getUserWallet(user!.uid);
      const transactionsData = await getWalletTransactions(user!.uid);

      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل بيانات المحفظة" });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppTopUp = () => {
    const phoneNumber = "966550000000"; // رقم المالك
    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته\n\nأود تعبئة رصيدي في محفظة المستشار AI\nرقم حسابي: ${user?.email}\n\nشاكراً`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <SovereignLayout activeId="wallet">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">جاري التحميل...</div>
        </div>
      </SovereignLayout>
    );
  }

  return (
    <SovereignLayout activeId="wallet">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <WalletIcon size={32} className="text-amber-400" />
            <h1 className="text-3xl font-black text-foreground">محفظتي</h1>
          </div>
          <p className="text-muted-foreground">إدارة رصيدك وسجل المعاملات</p>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-amber-500 to-primary opacity-10" />
          <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-amber-400/5 backdrop-blur">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Balance Display */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-primary">
                      {wallet?.balance.toFixed(2) || "0.00"}
                    </span>
                    <span className="text-2xl text-muted-foreground">{wallet?.currency || "ر.س"}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 border-t border-border/30 pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">إجمالي الإنفاق</p>
                    <p className="text-lg font-bold text-foreground">
                      {wallet?.totalSpent.toFixed(2) || "0.00"} ر.س
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">آخر تعبئة</p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {wallet?.lastTopUp
                        ? new Date(wallet.lastTopUp).toLocaleDateString("ar")
                        : "لم يتم تعبئة"}
                    </p>
                  </div>
                </div>

                {/* Top-up Buttons */}
                <div className="flex gap-2 pt-4 border-t border-border/30">
                  <Button
                    variant="default"
                    className="flex-1 gap-2"
                    onClick={handleWhatsAppTopUp}
                  >
                    <MessageCircle size={16} />
                    تعبئة عبر واتس آب
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <CreditCard size={16} />
                    بطاقة ائتمان
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transactions */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp size={20} className="text-amber-400" />
              سجل المعاملات
            </h2>
            <p className="text-sm text-muted-foreground">آخر 50 معاملة</p>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border border-border/30 hover:border-primary/30 transition-all">
                    <CardContent className="flex items-center justify-between py-4">
                      {/* Left: Icon & Details */}
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.type === "credit"
                              ? "bg-green-500/20"
                              : "bg-red-500/20"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <ArrowDownRight className="text-green-500" size={20} />
                          ) : (
                            <ArrowUpRight className="text-red-500" size={20} />
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{new Date(transaction.timestamp).toLocaleDateString('ar')}</span>
                            <span>•</span>
                            <span>{new Date(transaction.timestamp).toLocaleTimeString('ar')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount */}
                      <div className="text-right">
                        <p
                          className={`font-bold text-lg ${
                            transaction.type === "credit"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          {transaction.amount.toFixed(2)} ر.س
                        </p>
                        <p className="text-xs text-muted-foreground">
                          الرصيد: {transaction.balanceAfter.toFixed(2)} ر.س
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border border-dashed border-border/50">
              <CardContent className="text-center py-12">
                <WalletIcon size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">لا توجد معاملات بعد</p>
                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={handleWhatsAppTopUp}
                >
                  <Plus size={16} />
                  أول تعبئة
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Card */}
        <Card className="border border-border/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6 space-y-3">
            <div className="space-y-2">
              <h3 className="font-bold text-foreground">💡 معلومة مفيدة</h3>
              <p className="text-sm text-muted-foreground">
                استخدم محفظتك لدفع رسوم الاستشارات الفيديوية والدورات المتقدمة. السند الرقمي يتم حفظه تلقائياً.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SovereignLayout>
  );
}
