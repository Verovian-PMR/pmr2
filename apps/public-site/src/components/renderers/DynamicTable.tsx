interface Props {
  config: Record<string, unknown>;
}

// Demo rows for display (in production, data comes from API)
const DEMO_ROWS = [
  ["Mon – Fri", "09:00 – 18:00", "Open"],
  ["Saturday", "09:00 – 13:00", "Open"],
  ["Sunday", "Closed", "Closed"],
  ["Bank Holidays", "10:00 – 14:00", "Limited"],
];

export default function DynamicTable({ config }: Props) {
  const headersStr = (config.headers as string) || "Day, Hours, Status";
  const bgColor = (config.bgColor as string) || "#FFFFFF";
  const headerBgColor = (config.headerBgColor as string) || "#0F52BA";
  const headerTextColor = (config.headerTextColor as string) || "#FFFFFF";
  const borderRadius = Number(config.borderRadius) || 12;
  const striped = config.striped !== false;
  const padding = Number(config.padding) || 32;

  const headers = headersStr.split(",").map((h) => h.trim());
  const configRows = Array.isArray(config.rows) ? (config.rows as string[][]) : [];
  const rows = configRows.length > 0 ? configRows : DEMO_ROWS;

  return (
    <section style={{ padding: `${padding}px 0` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto border border-neutral-200" style={{ borderRadius: `${borderRadius}px` }}>
          <table className="w-full" style={{ backgroundColor: bgColor }}>
            <thead>
              <tr style={{ backgroundColor: headerBgColor }}>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-6 py-3.5 text-left text-sm font-semibold"
                    style={{ color: headerTextColor }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={striped && ri % 2 === 1 ? { backgroundColor: "#F9FAFB" } : {}}
                >
                  {headers.map((_, ci) => (
                    <td key={ci} className="px-6 py-3.5 text-sm text-neutral-700">
                      {row[ci] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
