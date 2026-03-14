import { redirect } from "next/navigation";

import { AuthPage } from "@/features/auth/auth-page";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/assignments");
  }

  return <AuthPage nextPath={next} />;
}
