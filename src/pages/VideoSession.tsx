import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SovereignLayout from "@/components/SovereignLayout";
import { getVideoSessionById, VideoSession } from "@/lib/advancedUtils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Video } from "lucide-react";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VideoSessionPage() {
  const { user } = useAuth();
  const toast = useToast();
  const query = useQuery();
  const navigate = useNavigate();
  const [session, setSession] = useState<VideoSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = query.get("sessionId");

    if (!sessionId) {
      toast.toast({ variant: "destructive", title: "خطأ", description: "رقم الجلسة غير موجود" });
      navigate("/council");
      return;
    }

    const loadSession = async () => {
      setLoading(true);
      const sessionData = await getVideoSessionById(sessionId);
      if (!sessionData) {
        toast.toast({ variant: "destructive", title: "خطأ", description: "لم يتم العثور على الجلسة" });
        navigate("/council");
      } else {
        setSession(sessionData);
      }
      setLoading(false);
    };

    loadSession();
  }, [query, navigate, toast]);

  if (loading) {
    return (
      <SovereignLayout activeId="council">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin" />
        </div>
      </SovereignLayout>
    );
  }

  if (!session) {
    return null;
  }

  const room = session.jitsiRoomName || "SovereignCouncil-DefaultRoom";
  const name = user?.email?.split("@")[0] || "مستخدم";
  const jitsiUrl = `https://meet.jit.si/${room}#userInfo.displayName=${encodeURIComponent(name)}`;

  return (
    <SovereignLayout activeId="council">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Video size={20} /> جلسة فيديو مباشرة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Room: {room}</p>
            <p className="text-sm text-muted-foreground">مستخدم: {user?.email}</p>
            <p className="text-sm text-muted-foreground">موعد: {new Date(session.startTime || session.createdAt).toLocaleString("ar")}</p>
            <div className="mt-4">
              <Button variant="outline" onClick={() => window.open(jitsiUrl, "_blank")}>افتح في نافذة جديدة</Button>
            </div>
          </CardContent>
        </Card>

        <div className="aspect-video border border-border rounded-lg overflow-hidden">
          <iframe
            title="Jitsi Video Session"
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-full"
          />
        </div>

        <Button onClick={() => navigate("/council")}>العودة إلى مجلس الخبراء</Button>
      </div>
    </SovereignLayout>
  );
}
