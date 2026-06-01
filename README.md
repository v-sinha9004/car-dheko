# Car Dheko — AI Car Buying Copilot

Help confused car buyers go from "I don't know what to buy" to a confident shortlist. The app combines **rule-based filtering/scoring** on a local car dataset with **Gemini** for ranked, explained recommendations.

## Architecture

```
React (Vite) → Express API → cars.json + scorer → top 10 → Gemini → structured JSON → UI
```

1. User submits preferences (budget, family, fuel, transmission, usage, safety).
2. Backend filters and scores all cars deterministically.
3. Top 10 candidates are sent to Gemini with preferences.
4. Gemini returns exactly 3 recommendations with pros, cons, match scores, and comparison insights.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS v4
- **Backend:** Node.js, Express (ESM)
- **Storage:** `server/data/cars.json` (50 Indian market cars)
- **AI:** Google Gemini (auto-fallback across Flash / Flash-Lite models for free tier)

## Setup

### Prerequisites

- Node.js 18+
- [Gemini API key](https://aistudio.google.com/apikey)

### Install

```bash
npm run install:all
```

### Environment

Copy the example env file and add your API key:

```bash
cp .env.example server/.env
```

Edit `server/.env`:

```
GEMINI_API_KEY=your_key_here
PORT=3001
# Optional: preferred model (server tries lighter models first if unset)
# GEMINI_MODEL=gemini-2.0-flash-lite
# Optional: use rule-based fallback when all Gemini models fail
ALLOW_FALLBACK=true
```

### Run (development)

From the project root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

Or run separately:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

## API

### `GET /api/cars`

Returns all cars in the dataset.

### `POST /api/recommend`

**Request:**

```json
{
  "budget": 1500000,
  "familySize": 4,
  "cityDriving": true,
  "highwayDriving": false,
  "fuelPreference": "Petrol",
  "transmission": "Automatic",
  "safetyPriority": true,
  "annualRunningKm": 12000
}
```

**Response:** Gemini-structured JSON with `summary`, `recommendations` (3 items), `comparison`, and `followUpQuestions`.

**Example with curl:**

```bash
curl -X POST http://localhost:3001/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 1500000,
    "familySize": 4,
    "cityDriving": true,
    "highwayDriving": false,
    "fuelPreference": "Petrol",
    "transmission": "Automatic",
    "safetyPriority": true,
    "annualRunningKm": 12000
  }'
```

## Design Choices

- **Rule-based pre-filter:** Keeps Gemini context small, reduces hallucinated car IDs, and ensures budget/fuel/transmission constraints are enforced.
- **Hybrid scoring:** Deterministic weights for price fit, safety, reviews, mileage vs usage; Gemini adds narrative ranking and trade-off analysis.
- **JSON-only Gemini output:** `responseMimeType: application/json` plus server-side validation and one retry.

## Take-Home Assignment Notes

**Time box:** 2–3 hours for MVP.

**Evaluation rubric:**

| Area | What we look for |
|------|------------------|
| Product | Clear UX, useful recommendations, loading/error states |
| AI-native | Smart prompt, structured output, validation, graceful degradation |
| Code | Simple structure, readable services, minimal abstraction |

**Out of scope:** Auth, databases, microservices, tests (optional bonus).

## Tradeoffs & Future Work

- No seat/segment field in dataset — family size is context for Gemini only.
- Single-page app — no routing.
- Production: deploy client (Vercel/Netlify) + server (Render/Fly), env secrets, rate limiting on `/recommend`.
