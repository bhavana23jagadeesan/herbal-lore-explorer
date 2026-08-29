import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PlantCard } from "@/components/PlantCard";
import { plants } from "@/data/plants";
import {
  Search,
  Sparkles,
  Compass,
  MessageCircle,
  Camera,
  Share2,
  Gamepad2,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Dna,
} from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate({ to: "/explore", search: { q: searchTerm } });
    }
  };

  return (
    <AppShell>
      {/* Hero Section */}
      <div className="relative overflow-hidden py-12 sm:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl px-4"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" /> IEEE MPI Dataset Grounded
          </span>

          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            AI-Powered Interactive <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400">
              Medicinal Plant Heritage
            </span>
          </h1>

          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Explore centuries of botanical wisdom backed by scientific research, Siddha pharmacology,
            and neural vision intelligence.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearch} className="mt-8 mx-auto max-w-xl">
            <div className="glass-strong flex items-center rounded-full p-2 shadow-lg focus-within:ring-2 focus-within:ring-primary">
              <Search className="ml-3 size-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search plants (e.g. Tulsi, Cough, Eugenol, Tamil Nadu)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
              >
                Search <ArrowRight className="size-4" />
              </button>
            </div>
          </form>

          {/* Key Quick Tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Popular:</span>
            {["Tulsi", "Neem", "Ashwagandha", "Fever", "Adaptogen"].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate({ to: "/explore", search: { q: tag } })}
                className="rounded-full bg-secondary/80 px-3 py-1 text-foreground transition-colors hover:bg-secondary"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Feature Cards Grid */}
      <div className="my-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/explore"
          className="glass lift group flex flex-col justify-between rounded-3xl p-6 transition-all hover:border-primary/50"
        >
          <div>
            <div className="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Compass className="size-6" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold">Plant Search Engine</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Filter by botanical name, regional names, medicinal uses, diseases, and regional distribution.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
            Browse Dataset <ArrowRight className="ml-1 size-3.5" />
          </div>
        </Link>

        <Link
          to="/chat"
          className="glass lift group flex flex-col justify-between rounded-3xl p-6 transition-all hover:border-primary/50"
        >
          <div>
            <div className="grid size-12 place-items-center rounded-2xl bg-teal-500/10 text-teal-400">
              <MessageCircle className="size-6" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold">MPI AI Assistant</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Ask botanical questions answered by Nemotron-3 Ultra LLM grounded strictly in IEEE MPI dataset.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
            Ask Assistant <ArrowRight className="ml-1 size-3.5" />
          </div>
        </Link>

        <Link
          to="/identify"
          className="glass lift group flex flex-col justify-between rounded-3xl p-6 transition-all hover:border-primary/50"
        >
          <div>
            <div className="grid size-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-400">
              <Camera className="size-6" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold">Neural Plant Identifier</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload plant photos to classify species in real-time with MobileNetV2 computer vision.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
            Upload Image <ArrowRight className="ml-1 size-3.5" />
          </div>
        </Link>

        <Link
          to="/graph"
          className="glass lift group flex flex-col justify-between rounded-3xl p-6 transition-all hover:border-primary/50"
        >
          <div>
            <div className="grid size-12 place-items-center rounded-2xl bg-purple-500/10 text-purple-400">
              <Share2 className="size-6" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold">Knowledge Graph</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore interconnected networks between Plants, Diseases, Bio-active Compounds, and Regions.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
            View Graph <ArrowRight className="ml-1 size-3.5" />
          </div>
        </Link>

        <Link
          to="/play"
          className="glass lift group flex flex-col justify-between rounded-3xl p-6 transition-all hover:border-primary/50"
        >
          <div>
            <div className="grid size-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-400">
              <Gamepad2 className="size-6" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold">Interactive Quiz & XP</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Test your botanical knowledge, earn XP points, level up, and unlock achievements.
            </p>
          </div>
          <div className="mt-6 flex items-center text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
            Start Quiz <ArrowRight className="ml-1 size-3.5" />
          </div>
        </Link>

        <div className="glass flex flex-col justify-between rounded-3xl p-6">
          <div>
            <div className="grid size-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-400">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold">Scientific & Siddha Provenance</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Peer-reviewed trial evidence combined with traditional Tamil Siddha medicinal formulations.
            </p>
          </div>
          <div className="mt-6 text-xs text-muted-foreground">
            Curated from IEEE MPI standard records.
          </div>
        </div>
      </div>

      {/* Featured Plants Section */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Featured Medicinal Flora</h2>
            <p className="text-sm text-muted-foreground">Highlighted species from the IEEE MPI database</p>
          </div>
          <Link to="/explore" className="text-sm font-semibold text-primary hover:underline">
            View All Plants →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plants.slice(0, 3).map((plant, index) => (
            <PlantCard key={plant.id} plant={plant} index={index} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
