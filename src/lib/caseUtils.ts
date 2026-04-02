import { supabaseClient } from "./supabaseClient";

/**
 * Get cases for current user (with privacy filtering)
 * Regular users see only their own cases
 * Admin (bishoysamy390@gmail.com) sees all cases
 */
export async function getUserCases(
  userId: string,
  userEmail: string | null,
  limit: number = 50
) {
  try {
    const baseQuery = supabaseClient.from("cases").select("*").order("createdAt", { ascending: false }).limit(limit);

    // Privacy filter: regular users only see their cases
    const query =
      userEmail !== "bishoysamy390@gmail.com"
        ? baseQuery.eq("userId", userId)
        : baseQuery;

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("خطأ في جلب الحالات:", error);
    return [];
  }
}

/**
 * Get single case with privacy check
 */
export async function getCase(caseId: string, userId: string, userEmail: string | null) {
  try {
    const query = supabaseClient.from("cases").select("*").eq("id", caseId).single();

    const { data, error } = await query;

    if (error) throw error;

    // Privacy check
    if (userEmail !== "bishoysamy390@gmail.com" && data?.userId !== userId) {
      throw new Error("غير مصرح بالوصول لهذه الحالة");
    }

    return data;
  } catch (error) {
    console.error("خطأ في جلب الحالة:", error);
    return null;
  }
}

/**
 * Log activity to database
 */
export async function logActivity(
  userId: string,
  action: string,
  details: string
) {
  try {
    const { error } = await supabaseClient.from("activity_logs").insert({
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error("خطأ في تسجيل النشاط:", error);
  }
}

/**
 * Get activity logs (admin only)
 */
export async function getActivityLogs(userEmail: string | null, limit: number = 50) {
  try {
    // Only admin can see activity logs
    if (userEmail !== "bishoysamy390@gmail.com") {
      throw new Error("غير مصرح بالوصول");
    }

    const { data, error } = await supabaseClient
      .from("activity_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("خطأ في جلب سجلات النشاط:", error);
    return [];
  }
}
