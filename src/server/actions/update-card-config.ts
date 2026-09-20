"use server";

import { auth } from "@/lib/auth";
import { updateCardConfig } from "@/server/services/card-svg.service";
import type { UpdateCardConfigInput } from "@/types/profile-card";
import { revalidatePath } from "next/cache";

export async function saveCardConfigAction(input: UpdateCardConfigInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to customize your profile card." };
  }

  try {
    const updated = await updateCardConfig(session.user.id, input);
    revalidatePath("/studio/card");
    return { success: true, config: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update profile card settings.";
    return { error: message };
  }
}
