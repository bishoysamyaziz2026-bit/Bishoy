import { supabaseClient } from "./supabaseClient";

// ============= EXPERT COUNCIL =============

export interface Expert {
  id: string;
  userId: string;
  name: string;
  specialization: string; // تخصص قانوني
  bio: string;
  hourlyRate: number;
  rating: number;
  reviews: number;
  verified: boolean;
  profileImage: string;
  experience: number; // سنوات الخبرة
  languages: string[];
  isAvailable: boolean;
  createdAt: string;
}

export async function getExpertDirectory() {
  try {
    const { data, error } = await supabaseClient
      .from("experts")
      .select("*")
      .eq("verified", true)
      .order("rating", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("خطأ في جلب قائمة الخبراء:", error);
    return [];
  }
}

export function generateJitsiRoomName(expertId: string, userId: string) {
  const safeExpert = expertId.replace(/[^a-zA-Z0-9]/g, "");
  const safeUser = userId.replace(/[^a-zA-Z0-9]/g, "");
  const timeSuffix = new Date().getTime();
  return `SovereignCouncil-${safeExpert}-${safeUser}-${timeSuffix}`;
}

export async function bookVideoSession(
  expertId: string,
  userId: string,
  scheduledTime: string
) {
  try {
    const jitsiRoomName = generateJitsiRoomName(expertId, userId);

    const { data, error } = await supabaseClient
      .from("video_sessions")
      .insert({
        expertId,
        userId,
        jitsiRoomName,
        scheduledTime,
        status: "scheduled",
        createdAt: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error("خطأ في حجز جلسة:", error);
    return null;
  }
}

export async function getVideoSessionById(sessionId: string): Promise<VideoSession | null> {
  try {
    const { data, error } = await supabaseClient
      .from("video_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  } catch (error) {
    console.error("خطأ في جلب جلسة الفيديو:", error);
    return null;
  }
}

// ============= WALLET SYSTEM =============

export interface WalletTransaction {
  id: string;
  userId: string;
  type: "credit" | "debit"; // إضافة أو خصم
  amount: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: string;
  paymentMethod?: string; // whatsapp, credit_card, etc
}

export interface UserWallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  totalSpent: number;
  lastTopUp?: string;
  createdAt: string;
}

export async function getUserWallet(userId: string): Promise<UserWallet | null> {
  try {
    const { data, error } = await supabaseClient
      .from("wallets")
      .select("*")
      .eq("userId", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
    return data;
  } catch (error) {
    console.error("خطأ في جلب المحفظة:", error);
    return null;
  }
}

export async function getWalletTransactions(
  userId: string,
  limit: number = 50
): Promise<WalletTransaction[]> {
  try {
    const { data, error } = await supabaseClient
      .from("wallet_transactions")
      .select("*")
      .eq("userId", userId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("خطأ في جلب المعاملات:", error);
    return [];
  }
}

export async function addWalletTransaction(
  userId: string,
  type: "credit" | "debit",
  amount: number,
  description: string,
  currentBalance: number
) {
  try {
    const newBalance = type === "credit" ? currentBalance + amount : currentBalance - amount;

    const { error } = await supabaseClient.from("wallet_transactions").insert({
      userId,
      type,
      amount,
      description,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      timestamp: new Date().toISOString(),
    });

    if (error) throw error;

    // Update wallet balance
    await supabaseClient
      .from("wallets")
      .update({ balance: newBalance })
      .eq("userId", userId);

    return true;
  } catch (error) {
    console.error("خطأ في إضافة معاملة:", error);
    return false;
  }
}

// ============= DIGITAL LIBRARY =============

export interface LegalDocument {
  id: string;
  title: string;
  category: string; // عام, عقود, قانون إداري, إلخ
  description: string;
  content: string;
  embedding?: number[]; // For vector search
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export async function searchLegalDocuments(query: string): Promise<LegalDocument[]> {
  try {
    // Simple text search (vector search can be added later)
    const { data, error } = await supabaseClient
      .from("legal_documents")
      .select("*")
      .or(
        `title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`
      )
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("خطأ في البحث:", error);
    return [];
  }
}

export async function getDocumentsByCategory(category: string): Promise<LegalDocument[]> {
  try {
    const { data, error } = await supabaseClient
      .from("legal_documents")
      .select("*")
      .eq("category", category)
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("خطأ في جلب المستندات:", error);
    return [];
  }
}

// ============= USER MANAGEMENT (ADMIN) =============

export interface UserProfile {
  id?: string;
  userId: string;
  email: string;
  fullName: string;
  role: "user" | "expert" | "admin";
  status: "active" | "banned" | "suspended";
  badges: ("verified" | "premium")[];
  services: {
    chatEnabled: boolean;
    videoEnabled: boolean;
    libraryEnabled: boolean;
  };
  createdAt?: string;
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("userId", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  } catch (error) {
    console.error("خطأ في جلب بيانات المستخدم:", error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
) {
  try {
    const { error } = await supabaseClient
      .from("user_profiles")
      .update(updates)
      .eq("userId", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("خطأ في تحديث بيانات المستخدم:", error);
    return false;
  }
}

export async function banUser(userId: string, reason: string) {
  try {
    await updateUserProfile(userId, { status: "banned" });
    
    // Log admin action
    await logAdminAction(
      "ban_user",
      `Ban user: ${userId} - ${reason}`
    );

    return true;
  } catch (error) {
    console.error("خطأ في حظر المستخدم:", error);
    return false;
  }
}

export async function toggleUserBadge(
  userId: string,
  badge: "verified" | "premium"
) {
  try {
    const user = await getUserById(userId);
    if (!user) return false;

    const badges = user.badges || [];
    const updated = badges.includes(badge)
      ? badges.filter((b) => b !== badge)
      : [...badges, badge];

    await updateUserProfile(userId, { badges: updated });
    return true;
  } catch (error) {
    console.error("خطأ في تحديث الشارة:", error);
    return false;
  }
}

export async function toggleUserService(
  userId: string,
  service: "chatEnabled" | "videoEnabled" | "libraryEnabled",
  enabled: boolean
) {
  try {
    const user = await getUserById(userId);
    if (!user) return false;

    const services = user.services || {
      chatEnabled: true,
      videoEnabled: true,
      libraryEnabled: true,
    };

    await updateUserProfile(userId, {
      services: { ...services, [service]: enabled },
    });

    await logAdminAction(
      "toggle_service",
      `Toggled ${service} to ${enabled} for user ${userId}`
    );

    return true;
  } catch (error) {
    console.error("خطأ في تبديل الخدمة:", error);
    return false;
  }
}

export async function updateUserBalance(userId: string, newBalance: number) {
  try {
    const wallet = await getUserWallet(userId);
    if (!wallet) return false;

    const difference = newBalance - wallet.balance;
    const type = difference > 0 ? "credit" : "debit";

    await addWalletTransaction(
      userId,
      type,
      Math.abs(difference),
      "Manual balance update by admin",
      wallet.balance
    );

    return true;
  } catch (error) {
    console.error("خطأ في تحديث الرصيد:", error);
    return false;
  }
}

// ============= ADMIN LOGGING =============

export async function logAdminAction(action: string, details: string) {
  try {
    await supabaseClient.from("admin_logs").insert({
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("خطأ في تسجيل إجراء المسؤول:", error);
  }
}

// ============= VIDEO SESSION MANAGEMENT =============

export interface VideoSession {
  id: string;
  expertId: string;
  userId: string;
  jitsiRoomName?: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  startTime?: string;
  endTime?: string;
  duration?: number; // بالدقائق
  recordingUrl?: string;
  summary?: string;
  createdAt: string;
}

export async function updateVideoSessionStatus(
  sessionId: string,
  status: VideoSession["status"],
  summary?: string
) {
  try {
    const updates: Partial<VideoSession> = { status };
    if (summary) updates.summary = summary;
    if (status === "completed") updates.endTime = new Date().toISOString();

    const { error } = await supabaseClient
      .from("video_sessions")
      .update(updates)
      .eq("id", sessionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("خطأ في تحديث جلسة الفيديو:", error);
    return false;
  }
}

export async function getUserVideoSessions(userId: string): Promise<VideoSession[]> {
  try {
    const { data, error } = await supabaseClient
      .from("video_sessions")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("خطأ في جلب الجلسات:", error);
    return [];
  }
}
