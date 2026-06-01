import { useEffect, useState } from 'react';
import { getMakes } from '../api/client.js';

const DEFAULT_PREFS = {
  budget: 1500000,
  familySize: 4,
  usage: 'city',
  fuelPreference: 'Petrol',
  transmission: 'Any',
  safetyPriority: true,
  annualRunningKm: 12000,
};

function drivingFromUsage(usage) {
  if (usage === 'highway') {
    return { cityDriving: false, highwayDriving: true };
  }
  return { cityDriving: true, highwayDriving: false };
}

function formatInr(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PreferenceForm({ onSubmit, disabled }) {
  const [budget, setBudget] = useState(DEFAULT_PREFS.budget);
  const [annualRunningKm, setAnnualRunningKm] = useState(DEFAULT_PREFS.annualRunningKm);
  const [makes, setMakes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const [formExpanded, setFormExpanded] = useState(true);
  const [collapsedSummary, setCollapsedSummary] = useState('');

  useEffect(() => {
    getMakes()
      .then((data) => setMakes(data.makes ?? []))
      .catch(() => setMakes([]));
  }, []);

  const toggleBrand = (make) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(make)) next.delete(make);
      else next.add(make);
      return next;
    });
  };

  const selectAllBrands = () => setSelectedBrands(new Set(makes));
  const clearBrands = () => setSelectedBrands(new Set());

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const { cityDriving, highwayDriving } = drivingFromUsage(form.get('usage'));
    const preferences = {
      budget,
      familySize: Number(form.get('familySize')),
      cityDriving,
      highwayDriving,
      fuelPreference: form.get('fuelPreference'),
      transmission: form.get('transmission'),
      safetyPriority: form.get('safetyPriority') === 'on',
      annualRunningKm,
      brands: [...selectedBrands],
    };

    const usageLabel = preferences.cityDriving ? 'City' : 'Highway';
    const brandLabel =
      preferences.brands.length === 0
        ? 'All brands'
        : `${preferences.brands.length} brand${preferences.brands.length === 1 ? '' : 's'}`;
    setCollapsedSummary(
      `${formatInr(preferences.budget)} · ${preferences.familySize} seats · ${preferences.fuelPreference} · ${preferences.transmission} · ${usageLabel} · ${brandLabel}`
    );
    setFormExpanded(false);
    setBrandsExpanded(false);
    onSubmit(preferences);
  };

  const fillDemo = () => {
    setBudget(DEFAULT_PREFS.budget);
    setAnnualRunningKm(DEFAULT_PREFS.annualRunningKm);
    setSelectedBrands(new Set());
    setBrandsExpanded(false);
    setFormExpanded(true);

    const form = document.getElementById('preference-form');
    if (!form) return;
    Object.entries(DEFAULT_PREFS).forEach(([key, val]) => {
      if (key === 'budget' || key === 'annualRunningKm') return;
      const el = form.elements[key];
      if (!el) return;
      if (el.type === 'checkbox') el.checked = val;
      else el.value = val;
    });
  };

  return (
    <form id="preference-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setFormExpanded((open) => !open)}
          aria-expanded={formExpanded}
          className="flex-1 flex items-center justify-between gap-2 min-w-0 text-left rounded-lg hover:bg-slate-50 px-1 py-0.5 -mx-1 transition"
        >
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-800">Your preferences</h2>
            {!formExpanded && collapsedSummary && (
              <p className="text-sm text-slate-500 truncate mt-0.5">{collapsedSummary}</p>
            )}
          </div>
          <span
            className={`text-slate-500 text-xs shrink-0 transition-transform ${formExpanded ? 'rotate-180' : ''}`}
            aria-hidden
          >
            ▼
          </span>
        </button>
        <button
          type="button"
          onClick={fillDemo}
          className="text-sm text-indigo-600 hover:text-indigo-800 shrink-0"
        >
          Reset
        </button>
      </div>

      {formExpanded && (
        <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Budget: <span>{formatInr(budget)}</span>
        </label>
        <input
          type="range"
          name="budget"
          min={500000}
          max={5000000}
          step={50000}
          value={budget}
          className="w-full accent-indigo-600"
          onChange={(e) => setBudget(Number(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Family size</label>
          <input
            type="number"
            name="familySize"
            min={1}
            max={8}
            defaultValue={DEFAULT_PREFS.familySize}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Annual running (km)
          </label>
          <input
            type="range"
            name="annualRunningKm"
            min={5000}
            max={50000}
            step={1000}
            value={annualRunningKm}
            className="w-full accent-indigo-600"
            onChange={(e) => setAnnualRunningKm(Number(e.target.value))}
          />
          <span className="text-sm text-slate-500">
            {annualRunningKm.toLocaleString()} km/yr
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fuel preference</label>
          <select
            name="fuelPreference"
            defaultValue={DEFAULT_PREFS.fuelPreference}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="Any">Any</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Electric</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Transmission</label>
          <select
            name="transmission"
            defaultValue={DEFAULT_PREFS.transmission}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="Any">Any</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Usage</label>
          <select
            name="usage"
            defaultValue={DEFAULT_PREFS.usage}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="city">Mostly city driving</option>
            <option value="highway">Highway driving</option>
          </select>
        </div>

        <div className="flex items-center h-full">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="safetyPriority"
              defaultChecked={DEFAULT_PREFS.safetyPriority}
              className="rounded accent-indigo-600 shrink-0"
            />
            <span className="text-sm text-slate-700">Safety is a priority</span>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-slate-300 overflow-hidden">
        <button
          type="button"
          onClick={() => setBrandsExpanded((open) => !open)}
          aria-expanded={brandsExpanded}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left bg-slate-50 hover:bg-slate-100 transition"
        >
          <span className="text-sm font-medium text-slate-700">
            Brands{' '}
            <span className="font-normal text-slate-500">
              {selectedBrands.size === 0
                ? '(all brands)'
                : `(${selectedBrands.size} selected)`}
            </span>
          </span>
          <span
            className={`text-slate-500 text-xs shrink-0 transition-transform ${brandsExpanded ? 'rotate-180' : ''}`}
            aria-hidden
          >
            ▼
          </span>
        </button>

        {brandsExpanded && (
          <div className="border-t border-slate-300 p-3 space-y-2">
            <div className="flex justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={selectAllBrands}
                disabled={makes.length === 0}
                className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={clearBrands}
                disabled={selectedBrands.size === 0}
                className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                Clear
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2">
              {makes.length === 0 ? (
                <p className="text-sm text-slate-500 col-span-full">Loading brands…</p>
              ) : (
                makes.map((make) => (
                  <label
                    key={make}
                    className="flex items-center gap-2 cursor-pointer text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.has(make)}
                      onChange={() => toggleBrand(make)}
                      className="rounded accent-indigo-600 shrink-0"
                    />
                    <span>{make}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-slate-500">
              Leave none selected to include all brands. Select one or more to limit recommendations.
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Get recommendations
      </button>
        </>
      )}
    </form>
  );
}
