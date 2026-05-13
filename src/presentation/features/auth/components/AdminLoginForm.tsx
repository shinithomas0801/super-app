"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/infrastructure/supabase/browser-client";
import { ROUTES } from "@/lib/constants";

type Props = {
  nextPath: string;
};

export function AdminLoginForm({ nextPath }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim();
    setError(null);

    if (!cleanEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    setPending(true);
    const supabase = getSupabaseBrowserClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    setPending(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(nextPath.startsWith("/") ? nextPath : ROUTES.EDUCATION);
    router.refresh();
  }

  async function onSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Admin login</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in using your email and password.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Please wait..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-end text-sm">
          <button
            type="button"
            onClick={onSignOut}
            className="text-gray-600 underline"
          >
            Sign out current session
          </button>
        </div>
      </div>
    </main>
  );
}
