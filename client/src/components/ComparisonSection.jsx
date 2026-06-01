export default function ComparisonSection({ comparison }) {
  if (!comparison) return null;

  const items = [
    { label: 'Best for safety', value: comparison.winnerForSafety },
    { label: 'Best mileage', value: comparison.winnerForMileage },
    { label: 'Best features', value: comparison.winnerForFeatures },
    { label: 'Best overall', value: comparison.bestOverall },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick comparison</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg p-4 border border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
            <p className="mt-1 font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
