import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Star, Calendar, Video, Badge, Filter, Search, MessageCircle } from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { getExpertDirectory, bookVideoSession, Expert } from "@/lib/advancedUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export default function CouncilPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    try {
      setLoading(true);
      const data = await getExpertDirectory();
      setExperts(data as Expert[]);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل قائمة الخبراء" });
    } finally {
      setLoading(false);
    }
  };

  const filteredExperts = experts.filter((expert) => {
    const matchesSearch =
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.specialization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "verified" && expert.verified) ||
      (selectedFilter === "available" && expert.isAvailable) ||
      expert.specialization === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const handleBookSession = async (expert: Expert) => {
    if (!user) return;
    const scheduledAt = selectedDateTime || new Date().toISOString();

    try {
      const result = await bookVideoSession(expert.id, user.uid, scheduledAt);
      if (result) {
        toast({
          title: "تم الحجز بنجاح",
          description: `تم حجز جلسة مع ${expert.name}`,
        });

        const sessionId = result.id;
        navigate(`/video-session?sessionId=${sessionId}`);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حجز الجلسة" });
    }
  };

  const uniqueSpecializations = Array.from(
    new Set(experts.map((e) => e.specialization))
  );

  return (
    <SovereignLayout activeId="council">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users size={32} className="text-amber-400" />
            <h1 className="text-3xl font-black text-foreground">مجلس الخبراء القانونيين</h1>
          </div>
          <p className="text-muted-foreground">تواصل مع أفضل الخبراء القانونيين لاستشارة مباشرة</p>
        </div>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="ابحث عن خبير أو تخصص..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-accent/50 border border-border rounded-lg py-2 pr-10 pl-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-accent/50 border border-border rounded-lg py-2 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">جميع التخصصات</option>
            <option value="verified">الخبراء المعتمدون</option>
            <option value="available">متاحون الآن</option>
            {uniqueSpecializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Experts Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">جاري التحميل...</div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            <AnimatePresence>
              {filteredExperts.map((expert, index) => (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border border-border/50 hover:border-primary/50 transition-all overflow-hidden group">
                    <CardHeader className="space-y-3">
                      {/* Header with Avatar */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center">
                            <span className="text-white font-bold">{expert.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <h3 className="font-bold text-foreground">{expert.name}</h3>
                              {expert.verified && (
                                <Badge size={14} className="w-4 h-4 text-amber-400" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{expert.specialization}</p>
                          </div>
                        </div>
                      </div>

                      {/* Rating & Experience */}
                      <div className="space-y-1 border-t border-border/30 pt-2">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          <span className="text-sm font-medium">
                            {expert.rating.toFixed(1)} ({expert.reviews} تقييم)
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {expert.experience} سنة خبرة
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Bio */}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {expert.bio}
                      </p>

                      {/* Languages & Status */}
                      <div className="flex flex-wrap gap-1">
                        {expert.languages.map((lang) => (
                          <span
                            key={lang}
                            className="bg-primary/10 text-primary text-xs px-2 py-1 rounded"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            expert.isAvailable ? "bg-green-500" : "bg-gray-500"
                          }`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {expert.isAvailable ? "متاح الآن" : "غير متاح"}
                        </span>
                      </div>

                      {/* Price & Actions */}
                      <div className="space-y-2 border-t border-border/30 pt-3">
                        <p className="text-lg font-bold text-primary">
                          {expert.hourlyRate} ر.س <span className="text-xs text-muted-foreground">/ساعة</span>
                        </p>

                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="default"
                                className="flex-1 gap-2"
                                onClick={() => setSelectedExpert(expert)}
                              >
                                <Video size={14} />
                                جلسة فيديو
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>حجز جلسة فيديو</DialogTitle>
                                <DialogDescription>
                                  استشارة مباشرة مع {expert.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">وقت الجلسة</label>
                                  <input
                                    type="datetime-local"
                                    value={selectedDateTime}
                                    onChange={(e) => setSelectedDateTime(e.target.value)}
                                    className="w-full mt-2 bg-accent/50 border border-border rounded px-3 py-2"
                                  />
                                </div>
                                <Button
                                  className="w-full"
                                  onClick={() => {
                                    if (!selectedDateTime) {
                                      toast({ variant: "destructive", title: "خطأ", description: "اختر وقت الجلسة أولاً" });
                                      return;
                                    }

                                    handleBookSession(expert);
                                  }}
                                >
                                  تأكيد الحجز
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <MessageCircle size={14} />
                            تواصل
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredExperts.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">لا توجد نتائج مطابقة</p>
          </div>
        )}
      </div>
    </SovereignLayout>
  );
}
