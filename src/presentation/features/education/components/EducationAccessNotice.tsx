import Link from "next/link";
import { ROUTES } from "@/lib/constants";

type Props = {
  message: string;
};

export function EducationAccessNotice({ message }: Props) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950">
      <h2 className="text-lg font-semibold mb-2">Education admin access</h2>
      <p className="text-sm mb-4">{message}</p>
      <p className="text-sm text-amber-900/80 mb-4">
        After running the education migration, grant access with the Supabase
        SQL editor (service role):{" "}
        <code className="rounded bg-white/80 px-1 py-0.5 text-xs">
          insert into admin_users (user_id, role, email) values
          (&apos;YOUR_AUTH_USER_ID&apos;, &apos;education_admin&apos;,
          &apos;admin@example.com&apos;);
        </code>
      </p>
      <Link
        href={ROUTES.HOME}
        className="text-sm font-medium text-amber-900 underline"
      >
        Back to home
      </Link>
    </div>
  );
}
