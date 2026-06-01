import { Router } from 'express';
import { getAllCars } from '../services/carLoader.js';

const router = Router();

router.get('/', (_req, res) => {
  const cars = getAllCars();
  res.json({ count: cars.length, cars });
});

export default router;
