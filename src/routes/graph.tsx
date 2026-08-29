import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { api, type KnowledgeGraphData } from "@/lib/api";
import { Share2, Filter, Info, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/graph")({
  component: KnowledgeGraphPage,
});

function KnowledgeGraphPage() {
  const [data, setData] = useState<KnowledgeGraphData | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getKnowledgeGraph().then((res) => {
      if (isMounted) {
        setData(res);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredNodes = data
    ? data.nodes.filter((n) => filterType === "all" || n.type === filterType)
    : [];

  const getNodeColor = (type: string) => {
    switch (type) {
      case "plant":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "disease":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      case "compound":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "region":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      default:
        return "bg-secondary text-foreground border-border";
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Network Intelligence"
        title="Knowledge Graph Explorer"
        subtitle="Visual relationships mapping Plant ↔ Disease, Plant ↔ Active Compound, and Plant ↔ Geographical Region."
      />

      <div className="glass rounded-3xl p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Filter Network:</span>
          {["all", "plant", "disease", "compound", "region"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`capitalize px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                filterType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-400" /> Plant
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-400" /> Disease
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-400" /> Compound
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-400" /> Region
          </span>
        </div>
      </div>

      {loading && (
        <div className="py-20 text-center text-muted-foreground animate-pulse">
          Building Knowledge Graph network from PostgreSQL IEEE MPI records...
        </div>
      )}

      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visual Nodes Canvas / Grid */}
          <div className="lg:col-span-2 glass rounded-3xl p-6 min-h-[480px] space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Interactive Graph Nodes ({filteredNodes.length})
              </span>
              <span className="text-xs text-muted-foreground">Click node for connection details</span>
            </div>

            <div className="flex flex-wrap gap-3 p-4 bg-secondary/30 rounded-2xl min-h-[380px] items-center justify-center">
              {filteredNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`border px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all transform hover:scale-105 shadow-sm ${getNodeColor(
                    node.type
                  )} ${selectedNode?.id === node.id ? "ring-2 ring-primary ring-offset-2" : ""}`}
                >
                  <span className="capitalize text-[10px] opacity-70 block">{node.type}</span>
                  {node.label}
                </button>
              ))}
            </div>
          </div>

          {/* Node Details Inspector */}
          <div className="glass rounded-3xl p-6 space-y-4">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              <Info className="size-5 text-primary" /> Entity Relationships
            </h3>

            {selectedNode ? (
              <div className="space-y-4 pt-2">
                <div className={`p-4 rounded-2xl border ${getNodeColor(selectedNode.type)}`}>
                  <span className="text-xs capitalize font-semibold opacity-80 block">{selectedNode.type} Entity</span>
                  <h4 className="text-xl font-bold">{selectedNode.label}</h4>
                  <p className="text-xs opacity-75 mt-1">ID: {selectedNode.id}</p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Connected Relationships
                  </h5>
                  <div className="space-y-2">
                    {data.edges
                      .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map((edge, i) => (
                        <div key={i} className="text-xs glass p-3 rounded-xl flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            {edge.source === selectedNode.id ? edge.target : edge.source}
                          </span>
                          <Badge variant="secondary" className="capitalize text-[10px]">
                            {edge.relationship}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Select any plant, disease, compound, or region node to inspect connected relationships.
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
