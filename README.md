# Car Dheko — AI Car Buying Copilot

**Live Demo:** [https://car-dheko-echm.vercel.app/](https://car-dheko-echm.vercel.app/)

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
- **Storage:** `server/data/cars.json` (100 Indian market cars with `seats` for family-size filtering)
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

### `GET /api/cars/makes`

Returns sorted unique brand/make names from the dataset.

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
  "annualRunningKm": 12000,
  "brands": ["Maruti", "Hyundai", "Tata"]
}
```

`brands` is optional. Omit it or send `[]` to include all makes. When set, only cars from those makes are scored and recommended.

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

- **Rule-based pre-filter:** Keeps Gemini context small, reduces hallucinated car IDs, and ensures budget, brand, fuel, and transmission constraints are enforced.
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

## Project Reflection

### What did you build and why? What did you deliberately cut?
I built "Car Dheko", an AI-powered car buying copilot. The goal was to solve the overwhelming experience of choosing a car by combining deterministic hard filters (budget, fuel type, transmission) with AI-driven qualitative analysis (matching a car's features to specific user needs like safety or family size). 

I deliberately cut:
- User authentication and accounts (focus was on the core recommendation engine).
- A real database (used a local `cars.json` to speed up development and keep setup simple).
- Multi-page routing (kept it as a single-page app for the MVP).
- Extensive test coverage and CI/CD pipelines.

### What's your tech stack and why did you pick it?
- **Frontend:** React (Vite) and Tailwind CSS v4. Picked for fast iteration, modern developer experience, and rapid UI styling without writing custom CSS.
- **Backend:** Node.js with Express. Chosen for its simplicity in standing up a lightweight API layer and handling JSON requests/responses efficiently.
- **AI:** Google Gemini API. Selected for its excellent structured JSON output capabilities, fast response times (Flash models), and generous free tier.
- **Storage:** Local JSON file. Picked to completely avoid database setup overhead for a 2-3 hour MVP time box.

### What did you delegate to AI tools vs. do manually? Where did the tools help most? Where did they get in the way?
**Delegated to AI:**
- Bootstrapping the React UI components and Tailwind styling layout.
- Generating the initial rule-based filtering logic and scoring algorithms.
- Drafting the complex system prompt for Gemini to ensure structured JSON output.
- Generating the mock `cars.json` dataset.

**Done manually:**
- Designing the architecture (hybrid approach of local filtering + AI to prevent hallucinations).
- Refining the scoring weights to ensure realistic results before sending candidates to Gemini.
- Handling Gemini API fallback logic, retry mechanisms, and error states.
- Connecting the frontend state to backend API endpoints and managing loading states.

**Where tools helped most:** Scaffolding the UI, writing boilerplate Express server code, and rapidly iterating on the Gemini prompt structure.
**Where they got in the way:** Sometimes AI would overcomplicate the filtering logic or hallucinate car models if not strictly constrained by the prompt. Fine-tuning the exact JSON schema response and fixing subtle API integration bugs required manual debugging.

### If you had another 4 hours, what would you add?
- **Visuals:** Integrate an external car image API to show visuals of the recommended cars (currently text-heavy).
- **Testing:** Add unit tests for the filtering/scoring logic and integration tests for the Express API.
- **Database & State:** Move data to PostgreSQL/MongoDB and add user sessions to save past shortlists.
- **Detailed Views:** Add React Router for dedicated "Car Detail" pages showing full specs, price breakdowns, and user reviews.
- **Robustness:** More robust fallback UI and graceful degradation if the Gemini API fails entirely or rate limits.
- **Better searching algorithms:** Spend time on making a more robust and efficient car searching algorithm.