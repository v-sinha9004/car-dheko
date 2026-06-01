import { useState, useCallback } from 'react';
import { postRecommend } from '../api/client.js';

export function useRecommendations() {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async (preferences) => {
    setStatus('loading');
    setError(null);
    setData(null);

    try {
      const result = await postRecommend(preferences);
      setData(result);
      setStatus('success');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  return { status, data, error, fetchRecommendations, reset };
}
