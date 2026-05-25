interface ImpactCard {
  label: string;
  value: string;
  valueClass: string;
  sub?: string;
}

interface Props {
  cards: ImpactCard[];
}

export default function EventImpactCards({ cards }: Props) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-bg-primary rounded-[10px] px-4 py-3.5 border border-border-default"
        >
          <div className="text-[9px] font-semibold text-text-muted tracking-[0.08em] mb-1.5 uppercase">
            {card.label}
          </div>
          <div
            className={`text-xl font-bold tracking-tight ${card.valueClass}`}
          >
            {card.value}
          </div>
          {card.sub && (
            <div className="text-[10px] text-text-muted mt-0.5">{card.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
