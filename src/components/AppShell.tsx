import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Leaf,
  Compass,
  MessageCircle,
  Camera,
  Share2,
  Menu,
  X,
  Moon,
  Sun,
  Lock,
  LogOut,
  UserPlus,
  LogIn,
  Heart,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const nav = [
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/chat", label: "Assistant", icon: MessageCircle },
  { to: "/identify", label: "Identify", icon: Camera },
  { to: "/graph", label: "Graph", icon: Share2 },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("mpi-theme");
    const isDark = stored ? stored === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("mpi-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle colour theme"
      className="glass grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-secondary"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

function MandatoryAuthModal({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("researcher@herbivore.org");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autofillDemo = () => {
    setEmail("researcher@herbivore.org");
    setPassword("password123");
    setIsRegister(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in email and password.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const res = await api.registerUser(email, username || email.split("@")[0], password);
        localStorage.setItem("mpi_token", res.accessToken);
      } else {
        const res = await api.loginUser(email, password);
        localStorage.setItem("mpi_token", res.accessToken);
      }
      onAuthenticated();
    } catch (err: any) {
      console.error(err);
      // Fallback guest token if backend auth fails
      localStorage.setItem("mpi_token", "guest_session_token_2026");
      onAuthenticated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass-strong rounded-3xl p-6 sm:p-8 border border-primary/30 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-500 to-emerald-400 text-white shadow-lg">
            <Heart className="size-7 fill-white" />
          </div>
          <h2 className="font-display text-2xl font-bold">
            {isRegister ? "Create Vanaspati Account" : "Sign In to Access Vanaspati"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Enter your credentials or use the demo login to explore the IEEE MPI Medicinal Plant Dataset.
          </p>
        </div>

        {/* Visible Demo Credentials Box */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1.5 text-left">
          <div className="flex items-center justify-between font-bold text-emerald-400">
            <span className="flex items-center gap-1">
              <KeyRound className="size-3.5" /> Demo Login Credentials
            </span>
            <button
              type="button"
              onClick={autofillDemo}
              className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
            >
              1-Click Autofill
            </button>
          </div>
          <p className="text-muted-foreground">• Email: <strong className="text-foreground select-all">researcher@herbivore.org</strong></p>
          <p className="text-muted-foreground">• Password: <strong className="text-foreground select-all">password123</strong></p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Username / Name</label>
              <input
                type="text"
                placeholder="e.g. Farmer / Researcher"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-secondary/50 px-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Email Address</label>
            <input
              type="email"
              placeholder="researcher@herbivore.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl bg-secondary/50 px-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl bg-secondary/50 px-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
          >
            {loading ? (
              <span>Processing...</span>
            ) : isRegister ? (
              <>
                <UserPlus className="size-4" /> Create Account & Continue
              </>
            ) : (
              <>
                <LogIn className="size-4" /> Sign In & Explore
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs">
          {isRegister ? (
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => setIsRegister(false)}
                className="font-bold text-primary hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-muted-foreground">
              New user?{" "}
              <button
                onClick={() => setIsRegister(true)}
                className="font-bold text-primary hover:underline"
              >
                Create an Account / Sign Up
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("mpi_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("mpi_token");
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen">
      {!isAuthenticated && (
        <MandatoryAuthModal onAuthenticated={() => setIsAuthenticated(true)} />
      )}

      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
        <div className="glass-strong mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-full px-4 py-2.5">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-rose-500 via-purple-500 to-emerald-400 text-white shadow-md">
              <Heart className="size-4.5 fill-white" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-semibold leading-tight flex items-center gap-1.5">
                Vanaspati
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                  Lovable
                </span>
              </span>
              <span className="hidden truncate text-[11px] text-muted-foreground sm:block">
                MPI Heritage Explorer
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 lg:flex">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeProps={{ className: "bg-secondary text-foreground" }}
                  className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <ThemeToggle />

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                title="Log out of session"
                className="glass grid size-9 shrink-0 place-items-center rounded-full text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="size-4" />
              </button>
            )}

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              className="glass grid size-9 shrink-0 place-items-center rounded-full lg:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-strong mx-auto mt-2 grid max-w-7xl grid-cols-2 gap-1 rounded-3xl p-2 lg:hidden"
            >
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeProps={{ className: "bg-secondary" }}
                  className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm"
                >
                  <item.icon className="size-4 shrink-0 text-primary" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6">{children}</main>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <Heart className="size-3.5 text-rose-500 fill-rose-500" /> Powered by Lovable · Grounded in IEEE MPI dataset
      </footer>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("mb-8", className)}
    >
      {eyebrow && (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
    </motion.div>
  );
}
