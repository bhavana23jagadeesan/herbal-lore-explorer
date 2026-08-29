import { useCallback, useEffect, useState } from "react";

export type Progress = {
  xp: number;
  streak: number;
  viewed: string[];
  favourites: string[];
  quizzes: { date: string; correct: number; total: number }[];
  badges: string[];
};

const KEY = "mpi-progress";

const seed: Progress = {
  xp: 320,
  streak: 4,
  viewed: ["tulsi", "neem", "turmeric", "amla"],
  favourites: ["tulsi", "nilavembu"],
  quizzes: [
    { date: "Mon", correct: 4, total: 5 },
    { date: "Tue", correct: 3, total: 5 },
    { date: "Wed", correct: 5, total: 5 },
    { date: "Thu", correct: 4, total: 5 },
    { date: "Fri", correct: 5, total: 5 },
  ],
  badges: ["First Sprout", "Siddha Scholar"],
};

export const ALL_BADGES = [
  { id: "First Sprout", desc: "Opened your first plant record", xp: 20 },
  { id: "Siddha Scholar", desc: "Read 3 Siddha profiles", xp: 60 },
  { id: "Quiz Streak", desc: "Five correct answers in a row", xp: 100 },
  { id: "Field Botanist", desc: "Identified a plant from a photo", xp: 80 },
  { id: "Graph Walker", desc: "Explored the knowledge graph", xp: 40 },
  { id: "Herbarium Master", desc: "Viewed every plant in the dataset", xp: 250 },
];

function read(): Progress {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...seed, ...(JSON.parse(raw) as Progress) } : seed;
  } catch {
    return seed;
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(seed);

  useEffect(() => setProgress(read()), []);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const addXp = useCallback((amount: number) => update((p) => ({ ...p, xp: p.xp + amount })), [
    update,
  ]);

  const markViewed = useCallback(
    (id: string) =>
      update((p) => (p.viewed.includes(id) ? p : { ...p, viewed: [...p.viewed, id], xp: p.xp + 10 })),
    [update],
  );

  const toggleFavourite = useCallback(
    (id: string) =>
      update((p) => ({
        ...p,
        favourites: p.favourites.includes(id)
          ? p.favourites.filter((f) => f !== id)
          : [...p.favourites, id],
      })),
    [update],
  );

  const awardBadge = useCallback(
    (id: string) => update((p) => (p.badges.includes(id) ? p : { ...p, badges: [...p.badges, id] })),
    [update],
  );

  return { progress, addXp, markViewed, toggleFavourite, awardBadge, update };
}

export const levelOf = (xp: number) => Math.floor(xp / 250) + 1;
export const levelProgress = (xp: number) => ((xp % 250) / 250) * 100;
