import { Router } from 'express';
import { getAllCars } from '../services/carLoader.js';
import { scoreAndRankCars } from '../services/scorer.js';
import { getRecommendations, buildFallbackRecommendations } from '../services/gemini.js';
import { validatePreferences } from '../utils/validatePreferences.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const preferences = validatePreferences(req.body);
    const cars = getAllCars();
    const candidates = scoreAndRankCars(cars, preferences, 10);

    try {
      const result = await getRecommendations(preferences, candidates);
      res.json(result);
    } catch (geminiErr) {
      if (geminiErr.status === 502 && process.env.ALLOW_FALLBACK === 'true') {
        res.json(buildFallbackRecommendations(preferences, candidates));
        return;
      }
      throw geminiErr;
    }
  } catch (err) {
    next(err);
  }
});

export default router;
