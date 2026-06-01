const BUDGET_BUFFER = 1.05;

function scorePriceFit(price, budget) {
  const ratio = price / budget;
  if (ratio > 1) return 0;
  const ideal = 0.8;
  const distance = Math.abs(ratio - ideal);
  return Math.max(0, 48 * (1 - distance / 0.5));
}

function scoreFuel(car, prefs) {
  if (prefs.fuelPreference === 'Any') return 15;
  return car.fuelType === prefs.fuelPreference ? 15 : 0;
}

function scoreTransmission(car, prefs) {
  if (prefs.transmission === 'Any') return 5;
  return car.transmission === prefs.transmission ? 5 : 0;
}

function scoreSafety(car, prefs) {
  let base = (car.safetyRating / 5) * 20;
  if (prefs.safetyPriority) {
    base = Math.min(20, base * 1.3);
  }
  return base;
}

function scoreReviews(car) {
  return (car.reviewScore / 5) * 2;
}

function scoreMileage(car, prefs) {
  const normalized = Math.min(car.mileage, 30) / 30;
  if (prefs.annualRunningKm > 15000) {
    return normalized * 10;
  }
  return normalized * 5;
}

function scoreUsage(car, prefs, budget) {
  let score = 0;
  if (prefs.highwayDriving) {
    score += Math.min(car.mileage / 25, 1) * 6;
  }
  if (prefs.cityDriving) {
    const compactBonus = car.price < budget * 0.7 ? 4 : 2;
    score += compactBonus;
  }
  return Math.min(10, score);
}

function scoreFamily(car, prefs) {
  if (car.seats < prefs.familySize) return 0;

  if (prefs.familySize >= 6 && car.seats >= 7) return 8;
  if (prefs.familySize >= 5 && car.seats >= 7) return 7;
  if (prefs.familySize >= 4 && car.seats >= 7) return 6;
  if (car.seats >= prefs.familySize && car.reviewScore >= 4) return 5;
  if (car.seats >= prefs.familySize) return 3;
  return 0;
}

function passesHardFilters(car, prefs, brandFilter) {
  if (brandFilter && !brandFilter.has(car.make)) return false;
  if (car.price > prefs.budget * BUDGET_BUFFER) return false;
  if (car.seats < prefs.familySize) return false;
  if (prefs.fuelPreference !== 'Any' && car.fuelType !== prefs.fuelPreference) {
    return false;
  }
  if (prefs.transmission !== 'Any' && car.transmission !== prefs.transmission) {
    return false;
  }
  return true;
}

function buildReasons(car, prefs, breakdown) {
  const reasons = [];
  if (prefs.brands?.length > 0) reasons.push(`${car.make} brand selected`);
  if (car.price <= prefs.budget) reasons.push('Within budget');
  if (prefs.fuelPreference === 'Any' || car.fuelType === prefs.fuelPreference) {
    reasons.push(`Matches ${prefs.fuelPreference === 'Any' ? 'fuel preference' : prefs.fuelPreference}`);
  }
  if (prefs.transmission === 'Any' || car.transmission === prefs.transmission) {
    reasons.push(`Matches ${prefs.transmission === 'Any' ? 'transmission' : prefs.transmission}`);
  }
  if (breakdown.safety >= 16) reasons.push('Strong safety rating');
  if (car.reviewScore >= 4.5) reasons.push('Highly rated by owners');
  if (car.seats >= prefs.familySize && car.seats >= 7) {
    reasons.push(`Fits ${prefs.familySize} with ${car.seats}-seater layout`);
  } else if (car.seats >= prefs.familySize) {
    reasons.push(`Seats ${car.seats} — fits your family of ${prefs.familySize}`);
  }
  return reasons.slice(0, 4);
}

export function scoreAndRankCars(cars, preferences, topN = 10) {
  const brandFilter =
    preferences.brands?.length > 0 ? new Set(preferences.brands) : null;
  const filtered = cars.filter((car) => passesHardFilters(car, preferences, brandFilter));

  if (filtered.length < 3) {
    const err = new Error(
      'Not enough cars match your filters. Try increasing budget, selecting more brands, lowering family size, or setting fuel/transmission to Any.'
    );
    err.status = 400;
    throw err;
  }

  const scored = filtered.map((car) => {
    const breakdown = {
      price: scorePriceFit(car.price, preferences.budget),
      fuel: scoreFuel(car, preferences),
      transmission: scoreTransmission(car, preferences),
      safety: scoreSafety(car, preferences),
      reviews: scoreReviews(car),
      mileage: scoreMileage(car, preferences),
      usage: scoreUsage(car, preferences, preferences.budget),
      family: scoreFamily(car, preferences),
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const ruleScore = Math.round(Math.min(100, total));

    return {
      car,
      score: ruleScore,
      reasons: buildReasons(car, preferences, breakdown),
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topN).map(({ car, score, reasons }) => ({
    id: car.id,
    make: car.make,
    model: car.model,
    variant: car.variant,
    price: car.price,
    fuelType: car.fuelType,
    transmission: car.transmission,
    mileage: car.mileage,
    safetyRating: car.safetyRating,
    reviewScore: car.reviewScore,
    seats: car.seats,
    ruleScore: score,
    ruleReasons: reasons,
  }));
}
