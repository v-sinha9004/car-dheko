function formatInr(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RecommendationCard({ recommendation, car, rank }) {
  const { matchScore, whyRecommended, pros, cons, bestFor } = recommendation;

  const rankColors = {
    1: 'bg-amber-400 text-amber-950',
    2: 'bg-slate-300 text-slate-800',
    3: 'bg-amber-700 text-amber-50',
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-start justify-between p-5 border-b border-slate-100">
        <div>
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${rankColors[rank] || 'bg-slate-200'}`}
          >
            #{rank}
          </span>
          {car ? (
            <>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                {car.make} {car.model}
              </h3>
              <p className="text-slate-500">{car.variant}</p>
              <p className="mt-1 text-lg font-semibold text-indigo-700">{formatInr(car.price)}</p>
            </>
          ) : (
            <h3 className="mt-2 text-xl font-bold text-slate-900">Car ID: {recommendation.carId}</h3>
          )}
        </div>
        <div className="flex flex-col items-center">
          <div
            className="w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center"
            title="Match score"
          >
            <span className="text-lg font-bold text-indigo-700">{matchScore}</span>
          </div>
          <span className="text-xs text-slate-500 mt-1">Match</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm font-medium text-indigo-700">{bestFor}</p>

        {car && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-slate-100 rounded">{car.fuelType}</span>
            <span className="px-2 py-1 bg-slate-100 rounded">{car.transmission}</span>
            <span className="px-2 py-1 bg-slate-100 rounded">{car.mileage} km/l</span>
            <span className="px-2 py-1 bg-slate-100 rounded">Safety {car.safetyRating}/5</span>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-1">Why recommended</h4>
          <ul className="text-sm text-slate-600 list-disc list-inside space-y-0.5">
            {whyRecommended.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-1">Pros</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside">
              {pros.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-700 mb-1">Cons</h4>
            <ul className="text-sm text-slate-600 list-disc list-inside">
              {cons.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
