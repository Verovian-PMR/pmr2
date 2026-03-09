export default function InstancesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Pharmacy Instances</h2>
        <button className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600 transition-colors">
          Provision New Instance
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="grid grid-cols-5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
            <span>Pharmacy</span>
            <span>Subdomain</span>
            <span>Status</span>
            <span>Billing</span>
            <span>Actions</span>
          </div>
        </div>
        <div className="p-8 text-center text-neutral-500 text-sm">
          <p>No instances provisioned yet.</p>
        </div>
      </div>
    </div>
  );
}
