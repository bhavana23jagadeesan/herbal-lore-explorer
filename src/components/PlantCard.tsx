import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { FlaskConical, MapPin } from "lucide-react";
import type { Plant } from "@/data/plants";
import { PlantVisual } from "@/components/PlantVisual";
import { Badge } from "@/components/ui/badge";

export function PlantCard({ plant, index = 0 }: { plant: Plant; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.4), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/plants/$plantId"
        params={{ plantId: plant.id }}
        className="glass lift group block h-full rounded-3xl p-3"
      >
        <PlantVisual hue={plant.hue} name={plant.name} className="h-36 w-full" />
        <div className="space-y-3 p-3">
          <div>
            <h3 className="text-lg font-semibold leading-tight">{plant.name}</h3>
            <p className="text-sm italic text-muted-foreground">{plant.botanicalName}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {plant.uses.slice(0, 2).map((u) => (
              <Badge key={u} variant="secondary" className="rounded-full font-normal">
                {u}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{plant.regions[0]}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <FlaskConical className="size-3" />
              {plant.constituents.length} compounds
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function PlantRow({ plant }: { plant: Plant }) {
  return (
    <Link
      to="/plants/$plantId"
      params={{ plantId: plant.id }}
      className="glass lift grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl p-3 sm:flex"
    >
      <PlantVisual hue={plant.hue} name={plant.name} className="size-16 shrink-0" compact />
      <div className="min-w-0 sm:flex-1">
        <h3 className="truncate font-semibold">{plant.name}</h3>
        <p className="truncate text-sm italic text-muted-foreground">{plant.botanicalName}</p>
      </div>
      <div className="col-span-2 flex flex-wrap gap-1.5 sm:col-auto sm:justify-end">
        {plant.diseases.slice(0, 3).map((d) => (
          <Badge key={d} variant="outline" className="rounded-full font-normal">
            {d}
          </Badge>
        ))}
      </div>
    </Link>
  );
}
