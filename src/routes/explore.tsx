import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { PlantCard, PlantRow } from "@/components/PlantCard";
import { PlantSkeleton } from "@/components/Skeletons";
import { api, type PaginatedPlants, type FilterOptions } from "@/lib/api";
import type { Plant } from "@/data/plants";
import { Search, LayoutGrid, List, ChevronLeft, ChevronRight, X } from "lucide-react";

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
    disease: (search.disease as string) || "",
    use: (search.use as string) || "",
    region: (search.region as string) || "",
  }),
});

function ExplorePage() {
  const searchParams = Route.useSearch();

  const [searchTerm, setSearchTerm] = useState(searchParams.q || "");
  const [diseaseFilter, setDiseaseFilter] = useState(searchParams.disease || "");
  const [useFilter, setUseFilter] = useState(searchParams.use || "");
  const [regionFilter, setRegionFilter] = useState(searchParams.region || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedPlants | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    diseases: ["Fever", "Cough", "Skin", "Pain", "Diabetes", "Piles", "Anxiety", "Dental"],
    uses: ["Cough", "Skin", "Stress", "Wound", "Digestion", "Fever", "Juice"],
    regions: ["Karnataka", "Kerala", "Tamil Nadu", "Maharashtra", "Andhra Pradesh", "Uttar Pradesh", "Pan-India"],
  });
  const [loading, setLoading] = useState(true);

  // Fetch dynamic filter options from dataset
  useEffect(() => {
    api.getFilterOptions().then((opts) => {
      if (opts) setFilterOptions(opts);
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .getPlants({
        plant_name: searchTerm,
        disease: diseaseFilter,
        medicinal_use: useFilter,
        region: regionFilter,
        page,
        limit: 9,
      })
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchTerm, diseaseFilter, useFilter, regionFilter, page]);

  const clearFilters = () => {
    setSearchTerm("");
    setDiseaseFilter("");
    setUseFilter("");
    setRegionFilter("");
    setPage(1);
  };

  const hasActiveFilters = searchTerm || diseaseFilter || useFilter || regionFilter;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Dataset Explorer"
        title="Plant Search & Catalog"
        subtitle="Search 200 IEEE MPI medicinal species by botanical name, active compounds, diseases treated, and native regions."
      />

      {/* Search & Filter Controls */}
      <div className="glass rounded-3xl p-4 sm:p-6 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by plant, botanical name, or constituent..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-2xl bg-secondary/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="glass p-2.5 rounded-2xl text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle View Mode"
            >
              {viewMode === "grid" ? <List className="size-5" /> : <LayoutGrid className="size-5" />}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-2.5 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <X className="size-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Disease Treated</label>
            <select
              value={diseaseFilter}
              onChange={(e) => {
                setDiseaseFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl bg-secondary/80 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Diseases</option>
              {filterOptions.diseases.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Medicinal Use</label>
            <select
              value={useFilter}
              onChange={(e) => {
                setUseFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl bg-secondary/80 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Medicinal Uses</option>
              {filterOptions.uses.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Region</label>
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl bg-secondary/80 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Regions</option>
              {filterOptions.regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PlantSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Data Results */}
      {!loading && data && data.items.length > 0 && (
        <>
          <div className="mb-4 text-xs text-muted-foreground flex justify-between items-center">
            <span>
              Showing {data.items.length} of {data.total} species records
            </span>
            <span>
              Page {data.page} of {data.pages}
            </span>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((plant: Plant, index: number) => (
                <PlantCard key={plant.id} plant={plant} index={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {data.items.map((plant: Plant) => (
                <PlantRow key={plant.id} plant={plant} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {data.pages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="glass p-2.5 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="size-5" />
              </button>
              <span className="text-sm font-semibold px-4">
                {page} / {data.pages}
              </span>
              <button
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="glass p-2.5 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && data && data.items.length === 0 && (
        <div className="text-center py-16 glass rounded-3xl space-y-3">
          <p className="text-lg font-semibold">No plants match your search selection.</p>
          <button
            onClick={clearFilters}
            className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}
    </AppShell>
  );
}
