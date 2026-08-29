import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Leaf,
  Compass,
  MessageCircle,
  Camera,
  Share2,
  Gamepad2,
  LayoutDashboard,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/chat", label: "Assistant", icon: MessageCircle },
  { to: "/identify", label: "Identify", icon: Camera },
  { to: "/graph", label: "Graph", icon: Share2 },
  { to: "/play", label: "Play", icon: Gamepad2 },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
        <div className="glass-strong mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-full px-4 py-2.5">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Leaf className="size-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-semibold leading-tight">
                Vanaspati
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

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        Grounded in the IEEE MPI dataset · Educational use only, not medical advice
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
