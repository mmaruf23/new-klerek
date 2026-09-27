const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-400",
  "bg-rose-400",
  "bg-amber-500",
  "bg-blue-500",
  "bg-teal-500",
  "bg-pink-500",
];

/** "Toko Maju — Cabang 2" → "TM" */
export function getInitials(name: string): string {
  return name
    .split(/[\s—–-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Kelas warna background Tailwind yang deterministik per id (id sama → warna sama). */
export function getAvatarColor(id: string): string {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
