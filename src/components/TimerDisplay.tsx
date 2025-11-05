import type { TimeFormat } from "@/types/timer";

interface TimerDisplayProps {
  time: TimeFormat;
}

export default function TimerDisplay({ time }: TimerDisplayProps) {
  const { d, h, m, s } = time;
  const blocks = [
    { label: "DAYS", value: d },
    { label: "HOURS", value: h },
    { label: "MINUTES", value: m },
    { label: "SECONDS", value: s },
  ];
  return (
    <div className="grid grid-cols-4 gap-6">
      {blocks.map((b) => (
        <div
          key={b.label}
          className="bg-white/10 backdrop-blur-sm border border-white/10 py-8 rounded-2xl"
        >
          <p className="text-6xl md:text-7xl font-bold">
            {b.value.toString().padStart(2, "0")}
          </p>
          <p className="text-sm tracking-widest opacity-80 mt-2">{b.label}</p>
        </div>
      ))}
    </div>
  );
}
