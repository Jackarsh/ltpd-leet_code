import { redirect } from "next/navigation";

interface LeaderboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const resolved = await searchParams;
  const params = new URLSearchParams();
  
  Object.entries(resolved).forEach(([key, val]) => {
    if (typeof val === "string") {
      params.set(key, val);
    }
  });

  const query = params.toString();
  redirect(query ? `/?${query}` : "/");
}
