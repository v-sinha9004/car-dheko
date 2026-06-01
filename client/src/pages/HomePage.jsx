import { useState, useEffect } from 'react';
import PreferenceForm from '../components/PreferenceForm.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import BuyerSummary from '../components/BuyerSummary.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';
import ComparisonSection from '../components/ComparisonSection.jsx';
import FollowUpQuestions from '../components/FollowUpQuestions.jsx';
import { useRecommendations } from '../hooks/useRecommendations.js';
import { getCars } from '../api/client.js';

export default function HomePage() {
  const { status, data, error, fetchRecommendations, reset } = useRecommendations();
  const [carsById, setCarsById] = useState({});
  const [lastPrefs, setLastPrefs] = useState(null);

  useEffect(() => {
    getCars()
      .then(({ cars }) => {
        const map = {};
        cars.forEach((c) => {
          map[c.id] = c;
        });
        setCarsById(map);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (preferences) => {
    setLastPrefs(preferences);
    fetchRecommendations(preferences);
  };

  const handleRetry = () => {
    if (lastPrefs) fetchRecommendations(lastPrefs);
    else reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900">Car Dheko</h1>
          <p className="text-slate-600 mt-1">AI-powered car buying copilot for India</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <PreferenceForm onSubmit={handleSubmit} disabled={status === 'loading'} />
        </section>

        {status === 'loading' && <LoadingState />}

        {status === 'error' && <ErrorState error={error} onRetry={handleRetry} />}

        {status === 'success' && data && (
          <div className="space-y-8">
            <BuyerSummary summary={data.summary} />

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Top recommendations</h2>
              <div className="space-y-6">
                {data.recommendations
                  .sort((a, b) => a.rank - b.rank)
                  .map((rec) => (
                    <RecommendationCard
                      key={rec.carId}
                      recommendation={rec}
                      car={carsById[rec.carId]}
                      rank={rec.rank}
                    />
                  ))}
              </div>
            </section>

            <ComparisonSection comparison={data.comparison} />
            <FollowUpQuestions questions={data.followUpQuestions} />

            <button
              type="button"
              onClick={reset}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Start over with new preferences
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
