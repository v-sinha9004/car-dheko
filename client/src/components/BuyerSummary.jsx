export default function BuyerSummary({ summary }) {
  if (!summary) return null;

  return (
    <section className="rounded-xl bg-indigo-50 border border-indigo-100 p-6">
      <h2 className="text-lg font-semibold text-indigo-900 mb-3">Your buyer profile</h2>
      <p className="text-slate-700 leading-relaxed">{summary.buyerProfile}</p>
      <p className="mt-3 text-sm text-indigo-800 font-medium">{summary.recommendationReason}</p>
    </section>
  );
}
