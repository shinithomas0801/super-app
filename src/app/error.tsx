"use client";

import { useEffect } from "react";
import { Button } from "@/components/Button/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-center text-sm">
        {error.message || "An unexpected error occurred."}
      </p>
      <Button onClick={reset} variant="primary">
        Try again
      </Button>
    </div>
  );
}
