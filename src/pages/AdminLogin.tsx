import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAdmin } from "@/lib/submissions-api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => loginAdmin(username, password),
    onSuccess: (session) => {
      queryClient.setQueryData(["admin-session"], session);
      navigate(location.state?.from || "/admin", { replace: true });
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось войти.");
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    loginMutation.mutate();
  };

  return (
    <AppShell contentClassName="flex items-center justify-center">
      <div className="glass-card-strong w-full max-w-md space-y-6 p-6">
        <div className="space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Вход в админку</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Защищенный доступ к анкетам, статусам клиентов и печатным картам приема.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-username">Логин</Label>
            <Input
              id="admin-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Пароль</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          <Button type="submit" className="w-full" size="lg" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Входим..." : "Войти"}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
