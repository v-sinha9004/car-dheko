async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Request failed');
    error.details = data.details;
    error.status = res.status;
    throw error;
  }
  return data;
}

export async function getCars() {
  const res = await fetch('/api/cars');
  return handleResponse(res);
}

export async function getMakes() {
  const res = await fetch('/api/cars/makes');
  return handleResponse(res);
}

export async function postRecommend(preferences) {
  const res = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  return handleResponse(res);
}
