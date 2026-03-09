interface Props {
  config: Record<string, unknown>;
}

export default function TwoColumnContent({ config }: Props) {
  const leftContent = (config.leftContent as string) || "";
  const rightType = (config.rightType as string) || "image";
  const rightImageUrl = (config.rightImageUrl as string) || "";
  const rightImageLayout = (config.rightImageLayout as string) || "full-width";
  const mapAddress = (config.mapAddress as string) || "";
  const bgColor = (config.bgColor as string) || "#FFFFFF";
  const textColor = (config.textColor as string) || "";
  const padding = Number(config.padding) || 48;

  const mapQuery = encodeURIComponent(mapAddress);

  return (
    <section style={{ backgroundColor: bgColor, padding: `${padding}px 0` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left — Text */}
          <div className="text-base leading-relaxed" style={textColor ? { color: textColor } : undefined}>
            {leftContent.split("\n").map((line, i) => (
              <p key={i} className="mb-3 last:mb-0">{line}</p>
            ))}
          </div>

          {/* Right — Image or Map */}
          <div>
            {rightType === "map" && mapAddress ? (
              <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                <iframe
                  title="Location"
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=-0.13,51.50,-0.10,51.52&layer=mapnik&marker=51.51,-0.115`}
                />
                <div className="bg-neutral-50 px-4 py-3 text-sm text-neutral-600 flex items-center gap-2">
                  <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {mapAddress}
                </div>
              </div>
            ) : rightImageUrl ? (
              <div className={rightImageLayout === "circular" ? "p-8 flex justify-center" : ""}>
                <img
                  src={rightImageUrl}
                  alt=""
                  className={
                    rightImageLayout === "circular"
                      ? "w-64 h-64 rounded-full object-cover shadow-lg"
                      : "w-full rounded-xl object-cover shadow-sm"
                  }
                />
              </div>
            ) : (
              <div className="h-64 rounded-xl bg-neutral-100 flex items-center justify-center">
                <div className="text-center text-neutral-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                  <p className="text-sm">Image placeholder</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
