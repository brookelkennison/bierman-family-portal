"use client";

import { KidBubble } from "@/components/ui/KidBubble";
import type { Child } from "@/lib/data";

type KidPickerProps = {
  kids: Child[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

/** "All kids, Maya, Leo" card at the top of the dashboard (Figma 03). */
export function KidPicker({ kids, selectedId, onSelect }: KidPickerProps) {
  const selected = kids.find((k) => k.id === selectedId);
  return (
    <section
      aria-label="Choose a child"
      className="flex flex-col gap-4 rounded-card border border-line bg-white p-5 md:flex-row md:items-center md:justify-between md:px-7 md:py-6"
    >
      <div className="flex gap-3 overflow-x-auto md:gap-7">
        {kids.length > 1 && (
          <KidBubble
            detail={`${kids.length} children`}
            selected={selectedId === null}
            onClick={() => onSelect(null)}
          />
        )}
        {kids.map((kid) => (
          <KidBubble
            key={kid.id}
            firstName={kid.firstName}
            detail={`Age ${kid.age}`}
            selected={selectedId === kid.id || kids.length === 1}
            onClick={() => onSelect(kid.id)}
          />
        ))}
      </div>
      <div
        className="flex flex-col md:items-end md:text-right"
        aria-live="polite"
      >
        <p className="text-h3 text-navy">
          {selected ? `Showing ${selected.firstName}` : "Showing all kids"}
        </p>
        <p className="text-small text-muted">
          Tap a child to see their care plan and visits.
        </p>
      </div>
    </section>
  );
}
