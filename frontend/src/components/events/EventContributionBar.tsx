interface Props {
  contributionPct: number;
}

export default function EventContributionBar({ contributionPct }: Props) {
  return (
    <div className="mt-3">
      <div className="h-1.5 rounded-full bg-border-default overflow-hidden">
        <div
          className="h-full rounded-full bg-accent-amber transition-[width] duration-400 ease-in-out"
          style={{ width: `${Math.min(contributionPct, 100)}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-text-muted">Event spend</span>
        <span className="text-[10px] text-text-muted">Monthly total</span>
      </div>
    </div>
  );
}
