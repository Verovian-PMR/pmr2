interface Props {
  config: Record<string, unknown>;
}

export default function Gallery({ config }: Props) {
  const images = (config.images as string[]) || [];
  const displayMode = (config.displayMode as string) || "grid";
  const columns = Number(config.columns) || 3;
  const borderRadius = Number(config.borderRadius) || 8;
  const padding = Number(config.padding) || 32;

  return (
    <section style={{ padding: `${padding}px 0` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-neutral-900 text-center mb-8">Gallery</h2>

        {images.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-neutral-100 flex items-center justify-center"
                style={{ borderRadius: `${borderRadius}px` }}
              >
                <svg className="w-10 h-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
              </div>
            ))}
          </div>
        ) : displayMode === "carousel" ? (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Gallery ${i + 1}`}
                className="h-64 w-auto object-cover shrink-0 snap-start"
                style={{ borderRadius: `${borderRadius}px` }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: undefined }} data-cols={columns}>
            <style>{`@media(min-width:640px){[data-cols="${columns}"]{grid-template-columns:repeat(${columns},1fr)}}`}</style>
            {images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Gallery ${i + 1}`}
                className="w-full aspect-square object-cover"
                style={{ borderRadius: `${borderRadius}px` }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
