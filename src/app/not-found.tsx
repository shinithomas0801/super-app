import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-semibold">404 – Page not found</h2>
      <p className="text-muted-foreground text-center text-sm">
        The page you’re looking for doesn’t exist or was moved.
      </p>
      <Link
        href={ROUTES.HOME}
        className="text-primary font-medium underline underline-offset-4 hover:no-underline"
      >
        Go home
      </Link>
    </div>
  );
}
