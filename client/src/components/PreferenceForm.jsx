const DEFAULT_PREFS = {
  budget: 1500000,
  familySize: 4,
  cityDriving: true,
  highwayDriving: false,
  fuelPreference: 'Petrol',
  transmission: 'Automatic',
  safetyPriority: true,
  annualRunningKm: 12000,
};

function formatInr(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PreferenceForm({ onSubmit, disabled }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    onSubmit({
      budget: Number(form.get('budget')),
      familySize: Number(form.get('familySize')),
      cityDriving: form.get('cityDriving') === 'on',
      highwayDriving: form.get('highwayDriving') === 'on',
      fuelPreference: form.get('fuelPreference'),
      transmission: form.get('transmission'),
      safetyPriority: form.get('safetyPriority') === 'on',
      annualRunningKm: Number(form.get('annualRunningKm')),
    });
  };

  const fillDemo = () => {
    const form = document.getElementById('preference-form');
    if (!form) return;
    Object.entries(DEFAULT_PREFS).forEach(([key, val]) => {
      const el = form.elements[key];
      if (!el) return;
      if (el.type === 'checkbox') el.checked = val;
      else el.value = val;
    });
  };

  return (
    <form id="preference-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Your preferences</h2>
        <button
          type="button"
          onClick={fillDemo}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Fill demo
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Budget: <span id="budget-label">{formatInr(DEFAULT_PREFS.budget)}</span>
        </label>
        <input
          type="range"
          name="budget"
          min={500000}
          max={5000000}
          step={50000}
          defaultValue={DEFAULT_PREFS.budget}
          className="w-full accent-indigo-600"
          onChange={(e) => {
            document.getElementById('budget-label').textContent = formatInr(Number(e.target.value));
          }}
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
            defaultValue={DEFAULT_PREFS.annualRunningKm}
            className="w-full accent-indigo-600"
            onChange={(e) => {
              const el = document.getElementById('km-label');
              if (el) el.textContent = `${Number(e.target.value).toLocaleString()} km/yr`;
            }}
          />
          <span id="km-label" className="text-sm text-slate-500">
            {DEFAULT_PREFS.annualRunningKm.toLocaleString()} km/yr
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

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="cityDriving"
            defaultChecked={DEFAULT_PREFS.cityDriving}
            className="rounded accent-indigo-600"
          />
          <span className="text-sm text-slate-700">Mostly city driving</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="highwayDriving"
            defaultChecked={DEFAULT_PREFS.highwayDriving}
            className="rounded accent-indigo-600"
          />
          <span className="text-sm text-slate-700">Highway driving</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="safetyPriority"
            defaultChecked={DEFAULT_PREFS.safetyPriority}
            className="rounded accent-indigo-600"
          />
          <span className="text-sm text-slate-700">Safety is a priority</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Get recommendations
      </button>
    </form>
  );
}
