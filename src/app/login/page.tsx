import { ROUTES } from "@/lib/constants";
import { AdminLoginForm } from "@/presentation/features/auth/components/AdminLoginForm";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = params.next || ROUTES.EDUCATION;
  return <AdminLoginForm nextPath={nextPath} />;
}
