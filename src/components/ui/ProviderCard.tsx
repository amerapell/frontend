"use client";

/** Payment provider card — selected = black card with white text. */
export function ProviderCard({ name, tag, desc, selected, onSelect, compact, disabled }: {
  name: string;
  tag: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`provider${selected ? " is-on" : ""}${compact ? " provider--compact" : ""}`}
    >
      <span className="provider__top">
        <span>{tag}</span>
        {!compact && <span>{selected ? "SELECTED ●" : "SELECT ○"}</span>}
      </span>
      <span className="provider__name serif">{name}</span>
      <span className="provider__desc">{desc}</span>
    </button>
  );
}
