import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { api, type UserProfile, type AnalyticsData } from "@/lib/api";
import {
  LayoutDashboard,
  User,
  Zap,
  TrendingUp,
  Award,
  BookOpen,
  LogIn,
  UserPlus,
  BarChart3,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth modal state
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.getProfile(), api.getAnalytics()]).then(([profRes, analyticsRes]) => {
      if (isMounted) {
        setProfile(profRes);
        setAnalytics(analyticsRes);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg("");
    try {
      if (authMode === "register") {
        await api.registerUser({ email, username, password });
        setAuthMsg("Registration successful! Token generated.");
      } else {
        await api.loginUser({ username, password });
        setAuthMsg("Login successful! Welcome back.");
      }
      const updatedProf = await api.getProfile();
      setProfile(updatedProf);
    } catch {
      setAuthMsg("Authentication error. Using guest profile mode.");
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Dataset Telemetry & User System"
        title="Analytics & Researcher Portal"
        subtitle="Track IEEE MPI dataset search trends, popular plant interactions, system usage, and manage your researcher profile."
      />

      {loading && (
        <div className="py-20 text-center text-muted-foreground animate-pulse">
          Loading analytics metrics and user profile...
        </div>
      )}

      {!loading && (
        <div className="space-y-10">
          {/* User Profile Banner & Auth Box */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-strong rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border border-primary/30">
              <div className="grid size-20 place-items-center rounded-3xl bg-primary/20 text-primary">
                <User className="size-10" />
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="font-display text-2xl font-bold">{profile?.username}</h2>
                  <Badge variant="secondary" className="rounded-full">
                    <Shield className="mr-1 size-3 text-primary" /> {profile?.role}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>

                <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Zap className="size-4 fill-amber-400" /> Level {profile?.level} ({profile?.xp} XP)
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Award className="size-4" /> {profile?.quizzesCompleted} Quizzes Completed
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Auth Portal */}
            <div className="glass rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">JWT Authentication</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAuthMode("login")}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      authMode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthMode("register")}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      authMode === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {authMode === "register" && (
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                )}
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl bg-secondary/60 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90"
                >
                  {authMode === "register" ? "Create Account" : "Sign In"}
                </button>
              </form>

              {authMsg && <p className="text-[11px] text-emerald-400 text-center font-medium">{authMsg}</p>}
            </div>
          </div>

          {/* System Metrics Overview */}
          {analytics && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass p-5 rounded-3xl text-center space-y-1">
                  <span className="text-xs text-muted-foreground block">Total Plant Records</span>
                  <span className="text-3xl font-extrabold text-primary">{analytics.userStats.totalPlants}</span>
                </div>
                <div className="glass p-5 rounded-3xl text-center space-y-1">
                  <span className="text-xs text-muted-foreground block">Total API Searches</span>
                  <span className="text-3xl font-extrabold text-teal-400">{analytics.userStats.totalSearches}</span>
                </div>
                <div className="glass p-5 rounded-3xl text-center space-y-1">
                  <span className="text-xs text-muted-foreground block">Registered Researchers</span>
                  <span className="text-3xl font-extrabold text-amber-400">{analytics.userStats.totalUsers}</span>
                </div>
                <div className="glass p-5 rounded-3xl text-center space-y-1">
                  <span className="text-xs text-muted-foreground block">Quizzes Solved</span>
                  <span className="text-3xl font-extrabold text-purple-400">{analytics.userStats.totalQuizzes}</span>
                </div>
              </div>

              {/* Charts & Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Popular Plants */}
                <div className="glass rounded-3xl p-6 space-y-4">
                  <h3 className="font-display text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="size-5 text-emerald-400" /> Popular Plant Queries
                  </h3>
                  <div className="space-y-3">
                    {analytics.popularPlants.map((item, idx) => (
                      <div key={item.plantId} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-muted-foreground">{item.count} views</span>
                        </div>
                        <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, (item.count / 1300) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search Trends */}
                <div className="glass rounded-3xl p-6 space-y-4">
                  <h3 className="font-display text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="size-5 text-amber-400" /> Trending Search Keywords
                  </h3>
                  <div className="space-y-3">
                    {analytics.searchTrends.map((trend) => (
                      <div key={trend.term} className="glass p-3 rounded-2xl flex items-center justify-between">
                        <span className="text-xs font-semibold">{trend.term}</span>
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {trend.count} searches
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
