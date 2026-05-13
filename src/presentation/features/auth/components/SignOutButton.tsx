"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/infrastructure/supabase/browser-client";
import { ROUTES } from "@/lib/constants";

type Props = {
  className?: string;
};

export function SignOutButton({ className }: Props) {
  const router = useRouter();

  async function onSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(ROUTES.LOGIN);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void onSignOut()}
      className={className}
    >
      Sign out
    </button>
  );
}
