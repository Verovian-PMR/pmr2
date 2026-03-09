interface Props {
  config: Record<string, unknown>;
}

const DEMO_TESTIMONIALS = [
  { name: "Sarah M.", text: "Incredibly professional and friendly staff. The flu vaccination was quick and painless!", rating: 5 },
  { name: "James T.", text: "The medication review helped simplify my daily routine. Highly recommend this service.", rating: 5 },
  { name: "Emma L.", text: "Best pharmacy experience I've had. Easy online booking and zero waiting time.", rating: 4 },
];

export default function Testimonials({ config }: Props) {
  const bgColor = (config.bgColor as string) || "#FAFAFA";
  const textColor = (config.textColor as string) || "#212121";
  const cardBgColor = (config.cardBgColor as string) || "#FFFFFF";
  const borderRadius = Number(config.borderRadius) || 12;
  const padding = Number(config.padding) || 48;

  return (
    <section style={{ backgroundColor: bgColor, padding: `${padding}px 0` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: textColor }}>
          What Our Patients Say
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {DEMO_TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="p-6 border border-neutral-200 shadow-sm"
              style={{ backgroundColor: cardBgColor, borderRadius: `${borderRadius}px` }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg
                    key={si}
                    className="w-4 h-4"
                    fill={si < t.rating ? "#F59E0B" : "#E5E7EB"}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: textColor }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <p className="text-sm font-semibold" style={{ color: textColor }}>
                {t.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
