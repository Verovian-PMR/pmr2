export default function MonitoringPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Fleet Monitoring</h2>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Instances", value: "0", color: "text-primary-500" },
          { label: "Online", value: "0", color: "text-success-main" },
          { label: "Offline", value: "0", color: "text-error-main" },
          { label: "Avg CPU", value: "0%", color: "text-neutral-700" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-neutral-200 p-6">
            <p className="text-sm text-neutral-500">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-500 text-sm">
        <p>Instance health data will appear here once instances are provisioned.</p>
      </div>
    </div>
  );
}
