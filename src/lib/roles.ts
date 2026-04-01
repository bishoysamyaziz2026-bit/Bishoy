export const roles = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  CONSULTANT: "consultant",
  PENDING_EXPERT: "pending_expert",
  VIP: "vip",
  USER: "user",
} as const;

export type UserRole = (typeof roles)[keyof typeof roles];

export const SOVEREIGN_ADMIN_EMAIL = "bishoysamy390@gmail.com";

export interface RolePermissions {
  canManageUsers: boolean;
  canPromoteRoles: boolean;
  canManageSystem: boolean;
  canConsult: boolean;
  canChatAI: boolean;
  canGenerateDocs: boolean;
  canManageMoney: boolean;
  consultationDiscount: number;
}

export const checkSovereignStatus = (email: string | null | undefined) => {
  const normalizedEmail = email?.toLowerCase() || "";
  const isKing = normalizedEmail === SOVEREIGN_ADMIN_EMAIL;
  return {
    isOwner: isKing,
    hasInfiniteVault: isKing,
    permissions: isKing ? 'GOD_MODE' : 'CITIZEN'
  };
};

export const getPermissions = (role: UserRole | string | null | undefined, email?: string | null): RolePermissions => {
  const sovereign = checkSovereignStatus(email);
  if (role === roles.ADMIN || sovereign.isOwner) {
    return { canManageUsers: true, canPromoteRoles: true, canManageSystem: true, canConsult: true, canChatAI: true, canGenerateDocs: true, canManageMoney: true, consultationDiscount: 0 };
  }
  switch (role) {
    case roles.VIP:
      return { canManageUsers: false, canPromoteRoles: false, canManageSystem: false, canConsult: false, canChatAI: true, canGenerateDocs: true, canManageMoney: false, consultationDiscount: 0.5 };
    case roles.CONSULTANT:
      return { canManageUsers: false, canPromoteRoles: false, canManageSystem: false, canConsult: true, canChatAI: true, canGenerateDocs: true, canManageMoney: false, consultationDiscount: 0 };
    default:
      return { canManageUsers: false, canPromoteRoles: false, canManageSystem: false, canConsult: false, canChatAI: true, canGenerateDocs: true, canManageMoney: false, consultationDiscount: 0 };
  }
};

export const getBalance = (profile: any) => {
  const sovereign = checkSovereignStatus(profile?.email);
  if (sovereign.hasInfiniteVault) return "∞";
  return profile?.balance ?? 50;
};
