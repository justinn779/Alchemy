/** Renders a 0–10 star rating (0.5 steps) as 10 overlaid star glyphs with partial fill via width-clipping. */
export function RarityStars({ rarity }: { rarity: number | undefined }) {
  if (rarity === undefined) {
    return <span className="text-xs text-parchment-300/30">未知</span>;
  }

  const stars = Array.from({ length: 10 }, (_, i) => {
    const fill = Math.max(0, Math.min(1, rarity - i));
    return (
      <span key={i} className="relative inline-block text-sm leading-none">
        <span className="text-void-600">★</span>
        {fill > 0 && (
          <span
            className="absolute inset-0 overflow-hidden text-ember-400"
            style={{ width: `${fill * 100}%` }}
          >
            ★
          </span>
        )}
      </span>
    );
  });

  return (
    <div className="flex items-center gap-2">
      <div className="flex">{stars}</div>
      <span className="text-xs text-parchment-300/50">{rarity.toFixed(1)} / 10</span>
    </div>
  );
}
