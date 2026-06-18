import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";

type ProtectedRouteProps = {
  component: React.ComponentType;
};

export default function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      const next = encodeURIComponent(location);
      navigate(`/login?next=${next}`);
    }
  }, [isLoading, user, location, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-red-600" />
          <p className="font-mono-data text-sm text-white/70">Verifying credentials…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <Component />;
}
