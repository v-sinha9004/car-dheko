import { GoogleGenerativeAI } from '@google/generative-ai';

/** Lightest / cheapest first — best for free-tier quotas. Invalid IDs are skipped at runtime. */
const DEFAULT_MODEL_CHAIN = [
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
];

function getModelChain() {
  const fromList = process.env.GEMINI_MODELS?.split(',').map((m) => m.trim()).filter(Boolean);
  if (fromList?.length) return [...new Set(fromList)];

  const preferred = process.env.GEMINI_MODEL?.trim();
  if (preferred) {
    return [...new Set([preferred, ...DEFAULT_MODEL_CHAIN])];
  }

  return DEFAULT_MODEL_CHAIN;
}

function extractHttpStatus(message = '') {
  const match = message.match(/\]\s*(\d{3})\s/);
  return match ? Number(match[1]) : null;
}

function shouldTryNextModel(error) {
  const message = error?.message ?? '';
  const status = error?.status ?? extractHttpStatus(message);

  if (status === 404 || status === 429 || status === 503) return true;
  if (/not found/i.test(message) && /model/i.test(message)) return true;
  if (/quota|rate.?limit|too many requests/i.test(message)) return true;
  if (/unavailable|overloaded/i.test(message)) return true;

  return false;
}

function isAuthError(error) {
  const message = error?.message ?? '';
  const status = error?.status ?? extractHttpStatus(message);
  return status === 401 || status === 403 || /API key|permission denied|invalid.*key/i.test(message);
}

const RESPONSE_SCHEMA = `{
  "summary": {
    "buyerProfile": "string",
    "recommendationReason": "string"
  },
  "recommendations": [
    {
      "carId": "string",
      "rank": 1,
      "matchScore": 92,
      "whyRecommended": ["string"],
      "pros": ["string"],
      "cons": ["string"],
      "bestFor": "string"
    }
  ],
  "comparison": {
    "winnerForSafety": "string (full car name: make model variant)",
    "winnerForMileage": "string (full car name: make model variant)",
    "winnerForFeatures": "string (full car name: make model variant)",
    "bestOverall": "string (full car name: make model variant)"
  },
  "followUpQuestions": ["string"]
}`;

function stripMarkdownFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

function formatCarName(car) {
  return `${car.make} ${car.model} ${car.variant}`.trim();
}

function validateResponse(data, candidateIds, candidateNames) {
  const errors = [];

  if (!data?.summary?.buyerProfile || !data?.summary?.recommendationReason) {
    errors.push('missing summary fields');
  }

  if (!Array.isArray(data?.recommendations) || data.recommendations.length !== 3) {
    errors.push('recommendations must have exactly 3 items');
  } else {
    data.recommendations.forEach((rec, i) => {
      if (!candidateIds.has(rec.carId)) {
        errors.push(`invalid carId: ${rec.carId}`);
      }
      if (rec.rank !== i + 1) {
        errors.push(`rank must be ${i + 1} for item ${i}`);
      }
      if (typeof rec.matchScore !== 'number' || rec.matchScore < 0 || rec.matchScore > 100) {
        errors.push(`invalid matchScore for ${rec.carId}`);
      }
      if (!Array.isArray(rec.whyRecommended) || !Array.isArray(rec.pros) || !Array.isArray(rec.cons)) {
        errors.push(`missing arrays for ${rec.carId}`);
      }
      if (!rec.bestFor) {
        errors.push(`missing bestFor for ${rec.carId}`);
      }
    });
  }

  const comp = data?.comparison;
  const comparisonFields = [
    'winnerForSafety',
    'winnerForMileage',
    'winnerForFeatures',
    'bestOverall',
  ];
  for (const field of comparisonFields) {
    const value = comp?.[field];
    if (!value || typeof value !== 'string') {
      errors.push(`missing comparison.${field}`);
    } else if (candidateIds.has(value)) {
      errors.push(`comparison.${field} must be car name, not carId`);
    } else if (!candidateNames.has(value)) {
      errors.push(`comparison.${field} must match a candidate display name`);
    }
  }

  if (!Array.isArray(data?.followUpQuestions) || data.followUpQuestions.length < 1) {
    errors.push('followUpQuestions required');
  }

  return errors;
}

function buildPrompt(preferences, candidates, isRetry) {
  const system = `You are an expert Indian car buying advisor. Output ONLY valid JSON matching this schema exactly. No markdown. No text outside JSON. Exactly 3 recommendations.

Rules:
- recommendations[].carId: use the candidate id only.
- comparison fields: use the full display name exactly as "make model variant" from the candidates (e.g. "Maruti Swift VXI"). Never use carId in comparison.
- matchScore must be 0-100.

Schema:
${RESPONSE_SCHEMA}`;

  const user = JSON.stringify(
    {
      task: isRetry
        ? 'Fix your previous response to match the schema exactly.'
        : 'Rank and explain the best 3 cars for this buyer from the candidates.',
      preferences,
      candidates,
    },
    null,
    2
  );

  return { system, user };
}

async function callGemini(genAI, modelId, preferences, candidates, isRetry = false) {
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: buildPrompt(preferences, candidates, isRetry).system,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.4,
    },
  });

  const { user } = buildPrompt(preferences, candidates, isRetry);
  const result = await model.generateContent(user);
  const text = result.response.text();
  return JSON.parse(stripMarkdownFences(text));
}

export async function getRecommendations(preferences, candidates) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is not configured');
    err.status = 502;
    throw err;
  }

  const candidateIds = new Set(candidates.map((c) => c.id));
  const candidateNames = new Set(candidates.map(formatCarName));
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelChain = getModelChain();

  let lastErrors = [];

  for (const modelId of modelChain) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const data = await callGemini(genAI, modelId, preferences, candidates, attempt > 0);
        lastErrors = validateResponse(data, candidateIds, candidateNames);

        if (lastErrors.length === 0) {
          console.log(`Gemini recommendations via ${modelId}`);
          return data;
        }
      } catch (e) {
        lastErrors = [e.message];
        console.error(`Gemini attempt failed (${modelId}):`, e.message);

        if (isAuthError(e)) {
          const err = new Error('Invalid or unauthorized Gemini API key');
          err.status = 502;
          err.details = lastErrors;
          throw err;
        }

        if (shouldTryNextModel(e)) {
          break;
        }
      }
    }
  }

  const err = new Error('Recommendation service unavailable');
  err.status = 502;
  err.details = lastErrors;
  err.modelsTried = modelChain;
  throw err;
}

export function buildFallbackRecommendations(preferences, candidates) {
  const top3 = candidates.slice(0, 3);

  return {
    summary: {
      buyerProfile: `Budget-conscious buyer with ₹${preferences.budget.toLocaleString('en-IN')} budget, family of ${preferences.familySize}.`,
      recommendationReason:
        'AI service unavailable — showing top rule-based matches from our scoring engine.',
    },
    recommendations: top3.map((car, i) => ({
      carId: car.id,
      rank: i + 1,
      matchScore: car.ruleScore,
      whyRecommended: car.ruleReasons,
      pros: [
        `${car.safetyRating}/5 safety rating`,
        `${car.reviewScore}/5 owner reviews`,
        `${car.mileage} km/l efficiency`,
      ],
      cons: ['Limited AI analysis available in fallback mode'],
      bestFor: i === 0 ? 'Best overall rule-based match' : `Strong alternative #${i + 1}`,
    })),
    comparison: {
      winnerForSafety: formatCarName(
        [...top3].sort((a, b) => b.safetyRating - a.safetyRating)[0]
      ),
      winnerForMileage: formatCarName([...top3].sort((a, b) => b.mileage - a.mileage)[0]),
      winnerForFeatures: formatCarName([...top3].sort((a, b) => b.reviewScore - a.reviewScore)[0]),
      bestOverall: formatCarName(top3[0]),
    },
    followUpQuestions: [
      'Would you like to compare these on a test drive?',
      'Is resale value important for your decision?',
      'Do you need financing options?',
    ],
  };
}
