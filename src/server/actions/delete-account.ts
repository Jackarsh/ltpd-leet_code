"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertWillNotCauseLockout } from "@/server/auth/rbac";

export async function deleteAccount() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Check if user is the last super admin before allowing deletion
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === "SUPER_ADMIN") {
      try {
        await assertWillNotCauseLockout(userId);
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "Cannot delete the last Super Admin." };
      }
    }

    // Delete user
    await db.user.delete({
      where: { id: userId },
    });

    return { success: true };
  } catch (error) {
    console.error("[deleteAccount]", error);
    return { error: "Failed to delete account. Please try again." };
  }
}
