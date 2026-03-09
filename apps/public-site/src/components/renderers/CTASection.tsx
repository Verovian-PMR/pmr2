interface Props {
  config: Record<string, unknown>;
}

export default function CTASection({ config }: Props) {
  const heading = (config.heading as string) || "Ready to get started?";
  const buttonText = (config.buttonText as string) || "Book an Appointment";
  const bgColor = (config.bgColor as string) || "#E8EEF9";
  const textColor = (config.textColor as string) || "#0F52BA";
  const buttonColor = (config.buttonColor as string) || "#0F52BA";
  const borderRadius = Number(config.borderRadius) || 12;
  const padding = Number(config.padding) || 48;

  return (
    <section style={{ padding: `${padding}px 0` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="text-center"
          style={{ backgroundColor: bgColor, borderRadius: `${borderRadius}px`, padding: `${padding}px 32px` }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: textColor }}>
            {heading}
          </h2>
          <a
            href="/booking"
            className="inline-block px-8 py-3.5 rounded-lg text-white font-semibold text-base transition-all hover:opacity-90 shadow-md"
            style={{ backgroundColor: buttonColor }}
          >
            {buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}
