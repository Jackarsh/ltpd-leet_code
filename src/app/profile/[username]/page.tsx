import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfileAliasPage({ params }: Props) {
  const { username } = await params;
  redirect(`/profiles/${encodeURIComponent(username)}`);
}