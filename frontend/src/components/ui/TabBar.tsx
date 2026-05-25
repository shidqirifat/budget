interface TabBarItem<T extends string> {
  id: T;
  label: string;
}

interface TabBarProps<T extends string> {
  tabs: TabBarItem<T>[];
  active: T;
  onChange: (id: T) => void;
}

export default function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: TabBarProps<T>) {
  return (
    <div className="flex gap-1.5">
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={[
            "px-5 py-2 rounded-lg cursor-pointer text-[13px] transition-colors",
            active === id
              ? "bg-text-primary text-bg-lime font-bold border-none"
              : "bg-bg-white text-text-secondary font-normal border border-border-default",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
