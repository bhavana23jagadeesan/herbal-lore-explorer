/**
 * API integration layer.
 *
 * Every screen talks to these functions only. When a real MPI backend is
 * available, set VITE_API_BASE_URL and each call transparently switches from
 * the bundled dataset to the live service.
 */
import axios from "axios";
import { plants, getPlant, similarPlants, type Plant } from "@/data/plants";

const baseURL = import.meta.env["VITE_API_BASE_URL"] as string | undefined;

export const http = axios.create({
  baseURL: baseURL ?? "/api",
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

const LIVE = Boolean(baseURL);

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function local<T>(value: T, ms = 420): Promise<T> {
  await delay(ms);
  return value;
}

export type PlantQuery = {
  q?: string;
  field?: "all" | "name" | "botanical" | "disease" | "compound" | "region";
  region?: string;
  disease?: string;
  part?: string;
  sort?: "popular" | "name" | "botanical" | "evidence";
};

export function filterPlants(query: PlantQuery): Plant[] {
  const q = (query.q ?? "").trim().toLowerCase();
  const field = query.field ?? "all";

  let list = plants.filter((p) => {
    if (query.region && !p.regions.includes(query.region)) return false;
    if (query.disease && !p.diseases.includes(query.disease)) return false;
    if (query.part && !p.parts.includes(query.part)) return false;
    if (!q) return true;

    const hay: Record<string, string> = {
      name: [p.name, ...p.commonNames.map((c) => c.name)].join(" "),
      botanical: `${p.botanicalName} ${p.family}`,
      disease: [...p.diseases, ...p.uses].join(" "),
      compound: [...p.constituents, ...p.pharmacology].join(" "),
      region: p.regions.join(" "),
    };
    const target = field === "all" ? Object.values(hay).join(" ") : hay[field];
    return target.toLowerCase().includes(q);
  });

  const sort = query.sort ?? "popular";
  list = [...list].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "botanical") return a.botanicalName.localeCompare(b.botanicalName);
    if (sort === "evidence") return b.research.length - a.research.length;
    return b.popularity - a.popularity;
  });

  return list;
}

export const api = {
  async listPlants(query: PlantQuery = {}): Promise<Plant[]> {
    if (LIVE) return (await http.get("/plants", { params: query })).data;
    return local(filterPlants(query));
  },

  async getPlant(id: string): Promise<Plant> {
    if (LIVE) return (await http.get(`/plants/${id}`)).data;
    const plant = getPlant(id);
    if (!plant) throw new Error(`No MPI record found for "${id}"`);
    return local(plant, 300);
  },

  async getSimilar(id: string): Promise<Plant[]> {
    if (LIVE) return (await http.get(`/plants/${id}/similar`)).data;
    const plant = getPlant(id);
    return local(plant ? similarPlants(plant) : [], 300);
  },

  async getStats() {
    if (LIVE) return (await http.get("/stats")).data;
    const byFamily = Object.entries(
      plants.reduce<Record<string, number>>((acc, p) => {
        acc[p.family] = (acc[p.family] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const byDisease = Object.entries(
      plants.reduce<Record<string, number>>((acc, p) => {
        p.diseases.forEach((d) => (acc[d] = (acc[d] ?? 0) + 1));
        return acc;
      }, {}),
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);

    const byEvidence = Object.entries(
      plants.reduce<Record<string, number>>((acc, p) => {
        p.research.forEach((r) => (acc[r.evidenceLevel] = (acc[r.evidenceLevel] ?? 0) + 1));
        return acc;
      }, {}),
    ).map(([name, value]) => ({ name, value }));

    return local({
      plants: plants.length,
      compounds: new Set(plants.flatMap((p) => p.constituents)).size,
      diseases: new Set(plants.flatMap((p) => p.diseases)).size,
      studies: plants.reduce((n, p) => n + p.research.length, 0),
      byFamily,
      byDisease,
      byEvidence,
    });
  },

  /** Retrieval step of the RAG pipeline: rank MPI records against a question. */
  retrieve(question: string, k = 3): Plant[] {
    const tokens = question
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((t) => t.length > 3);
    return plants
      .map((p) => {
        const doc = [
          p.name,
          p.botanicalName,
          p.family,
          ...p.commonNames.map((c) => c.name),
          ...p.uses,
          ...p.diseases,
          ...p.constituents,
          ...p.pharmacology,
          ...p.regions,
          p.siddha.note,
          p.morphology,
        ]
          .join(" ")
          .toLowerCase();
        return { p, score: tokens.reduce((n, t) => n + (doc.includes(t) ? 1 : 0), 0) };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((x) => x.p);
  },

  /** Grounded answer stream. Falls back to dataset-only synthesis offline. */
  async *streamAnswer(question: string): AsyncGenerator<string> {
    const sources = this.retrieve(question);
    let text: string;

    if (sources.length === 0) {
      text = `I could not ground that question in the MPI dataset. Try naming a plant (Tulsi, Neem, Nilavembu), a condition (fever, arthritis, asthma) or a compound (curcumin, azadirachtin).`;
    } else {
      const s = sources[0];
      text =
        `Based on ${sources.length} matching MPI record${sources.length > 1 ? "s" : ""}:\n\n` +
        `**${s.name}** (*${s.botanicalName}*, family ${s.family}) is documented for ${s.uses
          .slice(0, 3)
          .join(", ")
          .toLowerCase()}. The parts used are ${s.parts.join(", ").toLowerCase()}, and the recorded active constituents are ${s.constituents.join(", ")}.\n\n` +
        `In Siddha it is **${s.siddha.name}** — suvai ${s.siddha.suvai}, veeryam ${s.siddha.veeryam}. ${s.siddha.note}\n\n` +
        (s.research[0]
          ? `Evidence: *${s.research[0].title}* (${s.research[0].journal}, ${s.research[0].year}, ${s.research[0].evidenceLevel}) — ${s.research[0].finding}\n\n`
          : "") +
        (sources[1]
          ? `Related records worth comparing: ${sources
              .slice(1)
              .map((p) => `${p.name} (${p.botanicalName})`)
              .join(", ")}.`
          : "");
    }

    const words = text.split(" ");
    for (let i = 0; i < words.length; i += 3) {
      await delay(28);
      yield words.slice(i, i + 3).join(" ") + " ";
    }
  },

  /** Image classifier endpoint. Offline: deterministic pseudo-prediction. */
  async identify(file: File) {
    if (LIVE) {
      const form = new FormData();
      form.append("image", file);
      const { data } = await http.post("/identify", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data as { predictions: { plant: Plant; confidence: number }[] };
    }
    await delay(1800);
    const seed = (file.name.length * 31 + Math.round(file.size / 997)) % plants.length;
    const pick = (n: number) => plants[(seed + n) % plants.length];
    return {
      predictions: [
        { plant: pick(0), confidence: 0.86 + ((file.size % 90) / 1000) },
        { plant: pick(3), confidence: 0.41 },
        { plant: pick(7), confidence: 0.19 },
      ],
    };
  },
};

export type Stats = Awaited<ReturnType<typeof api.getStats>>;
