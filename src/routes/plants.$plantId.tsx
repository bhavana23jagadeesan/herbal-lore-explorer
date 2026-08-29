import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PlantVisual } from "@/components/PlantVisual";
import { PlantCard } from "@/components/PlantCard";
import { api } from "@/lib/api";
import type { Plant } from "@/data/plants";
import {
  MapPin,
  FlaskConical,
  BookOpen,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  Share2,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/plants/$plantId")({
  component: PlantDetailPage,
});

function PlantDetailPage() {
  const { plantId } = Route.useParams();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [recommendations, setRecommendations] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([api.getPlantById(plantId), api.getRecommendations(plantId)]).then(
      ([plantRes, recsRes]) => {
        if (isMounted) {
          setPlant(plantRes);
          setRecommendations(recsRes);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [plantId]);

  if (loading) {
    return (
      <AppShell>
        <div className="py-20 text-center text-muted-foreground animate-pulse">
          Loading medicinal plant records...
        </div>
      </AppShell>
    );
  }

  if (!plant) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <p className="text-xl font-bold">Plant species not found.</p>
          <Link to="/explore" className="mt-4 inline-block text-primary underline">
            Return to Explorer
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Back button */}
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" /> Back to Explorer
      </Link>

      {/* Main Header Banner */}
      <div className="glass rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)] gap-8 items-center mb-10">
        <PlantVisual hue={plant.hue} name={plant.name} className="size-48 sm:size-56 mx-auto rounded-2xl" />

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {plant.family} Family
            </span>
            <Badge variant="outline" className="rounded-full">
              Conservation: {plant.conservation}
            </Badge>
          </div>

          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">{plant.name}</h1>
            <p className="text-base sm:text-lg italic text-muted-foreground">{plant.botanicalName}</p>
          </div>

          <p className="text-sm text-foreground/90 leading-relaxed">{plant.morphology}</p>

          {/* Regional Names */}
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Regional Names:</span>
            <div className="flex flex-wrap gap-2">
              {plant.commonNames.map((cn) => (
                <Badge key={cn.language + cn.name} variant="secondary" className="rounded-full">
                  <strong className="mr-1 font-semibold">{cn.language}:</strong> {cn.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left Column (Uses, Diseases, Constituents) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Medicinal Uses & Diseases Treated */}
          <div className="glass rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Medicinal Indications & Therapeutic Uses
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Therapeutic Uses</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {plant.uses.map((u) => (
                    <Badge key={u} className="bg-primary/10 text-primary border-primary/20 rounded-full px-3 py-1 text-xs">
                      {u}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Diseases Treated</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {plant.diseases.map((d) => (
                    <Badge key={d} variant="outline" className="rounded-full px-3 py-1 text-xs">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bio-active Constituents & Pharmacology */}
          <div className="glass rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <FlaskConical className="size-5 text-amber-400" /> Bio-Active Compounds & Pharmacology
            </h2>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase">Phytochemical Compounds</span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {plant.constituents.map((c) => (
                  <Badge key={c} variant="secondary" className="rounded-full text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase">Pharmacological Actions</span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {plant.pharmacology.map((p) => (
                  <Badge key={p} variant="outline" className="rounded-full text-xs">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Research Evidence */}
          <div className="glass rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <BookOpen className="size-5 text-blue-400" /> Scientific Research Evidence
            </h2>
            <div className="space-y-3">
              {plant.research.map((res, idx) => (
                <div key={idx} className="rounded-2xl bg-secondary/50 p-4 border border-border/50 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{res.journal} ({res.year})</span>
                    <Badge variant="secondary">{res.evidenceLevel}</Badge>
                  </div>
                  <h4 className="text-sm font-semibold">{res.title}</h4>
                  <p className="text-xs text-muted-foreground">{res.finding}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar (Siddha Info & Geography) */}
        <div className="space-y-8">
          {/* Siddha Information */}
          <div className="glass rounded-3xl p-6 space-y-4 border-l-4 border-amber-500">
            <h2 className="font-display text-lg font-semibold text-amber-500">Siddha Medicine Profile</h2>
            <div className="text-xs space-y-2">
              <div>
                <span className="text-muted-foreground">Siddha Name:</span>
                <p className="font-semibold text-sm">{plant.siddha.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Suvai (Taste):</span>
                <p className="font-semibold">{plant.siddha.suvai}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Veeryam (Potency):</span>
                <p className="font-semibold">{plant.siddha.veeryam}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Clinical Note:</span>
                <p className="mt-1 text-muted-foreground leading-relaxed">{plant.siddha.note}</p>
              </div>
            </div>
          </div>

          {/* Regional Distribution & Plant Parts */}
          <div className="glass rounded-3xl p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <MapPin className="size-4 text-emerald-400" /> Geographic Regions
            </h2>
            <div className="flex flex-wrap gap-2">
              {plant.regions.map((r) => (
                <Badge key={r} variant="secondary" className="rounded-full">
                  {r}
                </Badge>
              ))}
            </div>

            <div className="pt-2">
              <span className="text-xs text-muted-foreground block mb-1">Medicinal Parts Used:</span>
              <div className="flex flex-wrap gap-1.5">
                {plant.parts.map((part) => (
                  <Badge key={part} variant="outline" className="rounded-full text-xs">
                    {part}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations / Related Plants */}
      {recommendations.length > 0 && (
        <div className="mt-16 pt-8 border-t border-border/60">
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-display">Recommended Similar Species</h2>
            <p className="text-sm text-muted-foreground">
              Calculated using TF-IDF & Cosine Similarity based on active compounds and therapeutic uses.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec, i) => (
              <PlantCard key={rec.id} plant={rec} index={i} />
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
