import { getAllMakes } from '../services/carLoader.js';

const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Any'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'Any'];

export function validatePreferences(body) {
  const errors = [];

  if (typeof body.budget !== 'number' || body.budget < 300000 || body.budget > 50000000) {
    errors.push('budget must be a number between 300000 and 50000000');
  }

  if (!Number.isInteger(body.familySize) || body.familySize < 1 || body.familySize > 8) {
    errors.push('familySize must be an integer between 1 and 8');
  }

  if (!FUEL_TYPES.includes(body.fuelPreference)) {
    errors.push(`fuelPreference must be one of: ${FUEL_TYPES.join(', ')}`);
  }

  if (!TRANSMISSIONS.includes(body.transmission)) {
    errors.push(`transmission must be one of: ${TRANSMISSIONS.join(', ')}`);
  }

  if (typeof body.annualRunningKm !== 'number' || body.annualRunningKm < 0 || body.annualRunningKm > 200000) {
    errors.push('annualRunningKm must be a number between 0 and 200000');
  }

  if (typeof body.cityDriving !== 'boolean') {
    errors.push('cityDriving must be a boolean');
  }

  if (typeof body.highwayDriving !== 'boolean') {
    errors.push('highwayDriving must be a boolean');
  }

  if (!body.cityDriving && !body.highwayDriving) {
    errors.push('at least one of cityDriving or highwayDriving must be true');
  }

  if (typeof body.safetyPriority !== 'boolean') {
    errors.push('safetyPriority must be a boolean');
  }

  let brands = [];
  if (body.brands !== undefined && body.brands !== null) {
    if (!Array.isArray(body.brands)) {
      errors.push('brands must be an array of make names');
    } else {
      const validMakes = new Set(getAllMakes());
      const seen = new Set();
      for (const brand of body.brands) {
        if (typeof brand !== 'string' || !brand.trim()) {
          errors.push('each brand must be a non-empty string');
          break;
        }
        if (!validMakes.has(brand)) {
          errors.push(`unknown brand: ${brand}`);
          break;
        }
        seen.add(brand);
      }
      brands = [...seen];
    }
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.details = errors;
    throw err;
  }

  return {
    budget: body.budget,
    familySize: body.familySize,
    cityDriving: body.cityDriving,
    highwayDriving: body.highwayDriving,
    fuelPreference: body.fuelPreference,
    transmission: body.transmission,
    safetyPriority: body.safetyPriority,
    annualRunningKm: body.annualRunningKm,
    brands,
  };
}
