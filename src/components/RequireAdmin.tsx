import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { getAdminSession } from "@/lib/submissions-api";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isLoading, isError } = useQuery({
    queryKey: ["admin-session"],
    queryFn: getAdminSession,
    retry: false,
  });

  if (isLoading) {
    return (
      <AppShell contentClassName="flex items-center justify-center">
        <div className="glass-card max-w-md px-6 py-8 text-center text-sm text-muted-foreground">
          Проверяем доступ в админку...
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
