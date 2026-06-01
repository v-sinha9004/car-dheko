import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.join(__dirname, '..');
const rootDir = path.join(serverDir, '..');

dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(serverDir, '.env'), override: true });
import cors from 'cors';
import carsRouter from './routes/cars.js';
import recommendRouter from './routes/recommend.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/cars', carsRouter);
app.use('/api/recommend', recommendRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
