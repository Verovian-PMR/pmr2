import { DEFAULT_SETTINGS } from "@/lib/site-config";

interface Props {
  config: Record<string, unknown>;
}

const TEAM_MEMBERS = [
  { name: "Mrs. Sarah Johnson", role: "Pharmacist", initials: "SJ", color: "#3B82F6" },
  { name: "Mr. Michael Chen", role: "Clinical Pharmacist", initials: "MC", color: "#8B5CF6" },
  { name: "Miss Emily Williams", role: "Pharmacist", initials: "EW", color: "#10B981" },
];

export default function TeamGrid({ config }: Props) {
  const columns = Number(config.columns) || 3;
  const bgColor = (config.bgColor as string) || "#FFFFFF";
  const cardBorderRadius = Number(config.cardBorderRadius) || 16;
  const showRole = config.showRole !== false;
  const padding = Number(config.padding) || 48;
  const primary = DEFAULT_SETTINGS.brand.primaryColor;

  return (
    <section style={{ backgroundColor: bgColor, padding: `${padding}px 0` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-neutral-900">
          Our Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ gridTemplateColumns: undefined }} data-cols={columns}>
          <style>{`@media(min-width:768px){[data-cols="${columns}"]{grid-template-columns:repeat(${columns},1fr)}}`}</style>
          {TEAM_MEMBERS.map((member, i) => (
            <div
              key={i}
              className="bg-white border border-neutral-200 p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              style={{ borderRadius: `${cardBorderRadius}px` }}
            >
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: member.color }}
              >
                {member.initials}
              </div>
              <h3 className="text-base font-semibold text-neutral-900">{member.name}</h3>
              {showRole && (
                <p className="text-sm mt-1" style={{ color: primary }}>
                  {member.role}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
