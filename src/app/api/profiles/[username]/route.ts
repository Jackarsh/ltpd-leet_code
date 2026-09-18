import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPublicStudentProfile } from "@/server/services/profile.service";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { username } = await params;
    const session = await auth();
    const profile = await getPublicStudentProfile(username, session?.user?.id);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found or inactive" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch student profile";
    console.error("Profile API error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}