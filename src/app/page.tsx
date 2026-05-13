import { ROUTES } from "@/lib/constants";
import { AdminLoginForm } from "@/presentation/features/auth/components/AdminLoginForm";

export const dynamic = "force-dynamic";

export default function Home() {
  return <AdminLoginForm nextPath={ROUTES.EDUCATION} />;
}
