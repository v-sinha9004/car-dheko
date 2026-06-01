export default function ErrorState({ error, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
      <p className="mt-2 text-red-700">{error?.message || 'Failed to get recommendations'}</p>
      {error?.details && (
        <ul className="mt-3 text-sm text-red-600 list-disc list-inside text-left max-w-md mx-auto">
          {(Array.isArray(error.details) ? error.details : [error.details]).map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try again
        </button>
      )}
    </div>
  );
}
