/** Horizontal tracker: dots (ink when reached) + connecting hairlines, label + description. */
export function StepTracker({ steps, reached, declined }: { steps: { label: string; desc: string }[]; reached: number; declined?: boolean }) {
  return (
    <ol className="tracker" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((s, k) => {
        const done = k < reached;
        return (
          <li key={s.label} className={`tracker__step${done ? " is-done" : ""}`} aria-current={k === reached - 1 ? "step" : undefined}>
            <div className="tracker__line">
              <span className={`tracker__dot${declined && k === reached - 1 ? " is-declined" : ""}`} />
              <span className={`tracker__bar${k < reached - 1 ? " is-done" : ""}`} />
            </div>
            <div className="tracker__label">{s.label}</div>
            <div className="tracker__desc">{s.desc}</div>
          </li>
        );
      })}
    </ol>
  );
}
