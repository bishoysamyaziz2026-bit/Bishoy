import { useState, useEffect, useMemo } from "react";
import { Search, BookOpen, Filter, Download, ExternalLink, Star, Tag } from "lucide-react";
import SovereignLayout from "@/components/SovereignLayout";
import { useToast } from "@/hooks/use-toast";
import { searchLegalDocuments, LegalDocument } from "@/lib/advancedUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const CATEGORIES = [
  "جميع التصنيفات",
  "العقود",
  "الدعاوى",
  "الاستشارات",
  "التشريعات",
  "أحكام قضائية",
  "صيغ وتوكيلات",
];

export default function LibraryPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("جميع التصنيفات");
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // Initially load all documents
      const results = await searchLegalDocuments("");
      setDocuments(results);
    } catch (error) {
      console.error("Failed to load documents:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل تحميل المكتبة الرقمية",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await searchLegalDocuments(query);
        setDocuments(results);
      } catch (error) {
        console.error("Search failed:", error);
      }
    } else {
      loadDocuments();
    }
  };

  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Category filter
    if (selectedCategory !== "جميع التصنيفات") {
      filtered = filtered.filter((doc) => doc.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          doc.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [documents, searchQuery, selectedCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <SovereignLayout activeId="library">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen size={32} className="text-amber-400" />
            <h1 className="text-3xl font-black text-foreground">المكتبة الرقمية</h1>
          </div>
          <p className="text-muted-foreground">
            ابحث في قاعدة تشريعات وأحكام قضائية شاملة
          </p>
        </div>

        {/* Search Bar */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 text-muted-foreground" size={20} />
            <Input
              placeholder="ابحث عن عقود، قوانين، أحكام..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-10 py-6 text-base"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredDocuments.length} وثيقة
            {searchQuery && ` تطابق البحث عن "${searchQuery}"`}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Filter size={16} />
            التصنيف: {selectedCategory}
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">جاري البحث...</div>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {filteredDocuments.map((doc) => (
              <motion.div key={doc.id} variants={itemVariants}>
                <Card className="border border-border/30 hover:border-primary/50 transition-all group h-full flex flex-col">
                  {/* Header */}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded">
                            {doc.category}
                          </span>
                        </div>
                        <CardTitle className="text-base line-clamp-2">
                          {doc.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Content */}
                  <CardContent className="flex-1 space-y-3">
                    <CardDescription className="line-clamp-2">
                      {doc.description}
                    </CardDescription>

                    {/* Tags */}
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-accent text-foreground/70 px-2 py-1 rounded flex items-center gap-1"
                          >
                            <Tag size={12} />
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground px-2">
                            +{doc.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
                      <span>{new Date(doc.createdAt).toLocaleDateString("ar")}</span>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span>محدث</span>
                      </div>
                    </div>
                  </CardContent>

                  {/* Footer */}
                  <div className="px-6 py-3 border-t border-border/30 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => {
                        toast({
                          title: "معاينة الوثيقة",
                          description: doc.title,
                        });
                      }}
                    >
                      <ExternalLink size={14} />
                      معاينة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => {
                        toast({
                          title: "تحميل الوثيقة",
                          description: `تم تحميل: ${doc.title}`,
                        });
                      }}
                    >
                      <Download size={14} />
                      تحميل
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="border border-dashed border-border/50">
            <CardContent className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">
                لم يتم العثور على وثائق تطابق البحث
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("جميع التصنيفات");
                }}
              >
                إعادة تعيين البحث
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border border-border/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6 space-y-3">
            <div className="space-y-2">
              <h3 className="font-bold text-foreground">💡 معلومة مفيدة</h3>
              <p className="text-sm text-muted-foreground">
                تحتوي المكتبة على آلاف الوثائق القانونية والتشريعية. استخدم البحث المتقدم مع الكلمات المفتاحية للحصول على أفضل النتائج.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SovereignLayout>
  );
}
