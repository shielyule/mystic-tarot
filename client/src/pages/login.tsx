import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

function getNextPath(search: string): string {
  const params = new URLSearchParams(search);
  const next = params.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/decks";
  return next;
}

export default function Login() {
  const { toast } = useToast();
  const { login, register } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextPath = getNextPath(typeof window !== "undefined" ? window.location.search : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
        toast({ title: "Access granted", description: "Welcome back, operator." });
      } else {
        await register(email.trim(), password, displayName.trim() || undefined);
        toast({ title: "Account created", description: "Members area unlocked." });
      }
      navigate(nextPath);
    } catch (err) {
      let message = mode === "login" ? "Login failed." : "Registration failed.";
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message.replace(/^\d+:\s*/, "")) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {
          message = err.message;
        }
      }
      toast({ title: "Authentication error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 pb-24 pt-10 sm:pt-16">
      <div className="mb-8 border-l-4 border-red-600 pl-4">
        <p className="font-label-caps text-[10px] tracking-[0.35em] text-red-600">SECURE_CHANNEL</p>
        <h1 className="font-headline-md mt-2 text-2xl font-bold text-white sm:text-3xl">
          {mode === "login" ? "OPERATOR_ACCESS" : "CREW_REGISTRATION"}
        </h1>
        <p className="mt-2 font-mono-data text-xs text-white/60">
          Monolith and Telemetry require authenticated clearance.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 border-2 py-2 font-label-caps text-[10px] tracking-widest ${
            mode === "login"
              ? "border-red-600 bg-red-600 text-black"
              : "border-white/20 text-white/50 hover:border-white/40"
          }`}
        >
          LOGIN
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 border-2 py-2 font-label-caps text-[10px] tracking-widest ${
            mode === "register"
              ? "border-red-600 bg-red-600 text-black"
              : "border-white/20 text-white/50 hover:border-white/40"
          }`}
        >
          REGISTER
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 border-2 border-white/15 bg-black/40 p-6">
        {mode === "register" ? (
          <div>
            <label className="font-label-caps mb-2 block text-[10px] text-white/60" htmlFor="display-name">
              DISPLAY_NAME
            </label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-none border-white/25 bg-black font-mono-data text-white"
              placeholder="Optional callsign"
              autoComplete="nickname"
            />
          </div>
        ) : null}

        <div>
          <label className="font-label-caps mb-2 block text-[10px] text-white/60" htmlFor="email">
            EMAIL_ADDRESS
          </label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-none border-white/25 bg-black font-mono-data text-white"
            placeholder="operator@discovery.one"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="font-label-caps mb-2 block text-[10px] text-white/60" htmlFor="password">
            PASSWORD
          </label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-none border-white/25 bg-black font-mono-data text-white"
            placeholder={mode === "register" ? "Min. 8 characters" : "••••••••"}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="red-glow-btn w-full border-2 border-red-600 bg-black py-4 font-label-caps tracking-[0.3em] text-red-600 transition-none hover:bg-red-600 hover:text-black disabled:opacity-40"
        >
          {submitting ? "TRANSMITTING…" : mode === "login" ? "INITIATE_LOGIN" : "CREATE_ACCOUNT"}
        </button>
      </form>

      <p className="mt-6 text-center font-mono-data text-[10px] text-white/45">
        <Link href="/" className="text-red-500 hover:text-red-400">
          ← Return to Starchild (guest access)
        </Link>
      </p>
    </div>
  );
}
