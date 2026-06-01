import { Router } from 'express';
import { getAllCars, getAllMakes } from '../services/carLoader.js';

const router = Router();

router.get('/makes', (_req, res) => {
  res.json({ makes: getAllMakes() });
});

router.get('/', (_req, res) => {
  const cars = getAllCars();
  res.json({ count: cars.length, cars });
});

export default router;
