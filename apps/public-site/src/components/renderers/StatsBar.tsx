interface Props {
  config: Record<string, unknown>;
}

const DEMO_STATS = [
  { number: "15+", label: "Years Experience" },
  { number: "10,000+", label: "Patients Served" },
  { number: "20+", label: "Services Offered" },
  { number: "4.9", label: "Patient Rating" },
];

export default function StatsBar({ config }: Props) {
  const bgColor = (config.bgColor as string) || "#0F52BA";
  const textColor = (config.textColor as string) || "#FFFFFF";
  const numberColor = (config.numberColor as string) || "#FFFFFF";
  const borderRadius = Number(config.borderRadius) || 12;
  const padding = Number(config.padding) || 40;

  return (
    <section style={{ padding: `${padding}px 0` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          style={{ backgroundColor: bgColor, borderRadius: `${borderRadius}px`, padding: `${padding}px 32px` }}
        >
          {DEMO_STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-4xl font-bold" style={{ color: numberColor }}>
                {stat.number}
              </p>
              <p className="text-sm mt-1 opacity-80" style={{ color: textColor }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
