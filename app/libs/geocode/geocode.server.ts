type ApiResult = {
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
};

type ApiResponse = { results: Array<ApiResult>; status: string; error_message?: string };

type AddressGeocoded = { location: string | null; lat: number | null; lng: number | null };

export async function geocode(location: string | null): Promise<AddressGeocoded> {
  const defaultResult = { location, lat: null, lng: null };
  if (!location) return defaultResult;

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return { location, lat: null, lng: null };

  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${key}`);
    const search = (await response.json()) as ApiResponse;
    if (search.status !== 'OK') return defaultResult;
    if (!search || !search.results || search.results.length === 0) return defaultResult;

    const result = search.results[0];
    return {
      location: result.formatted_address ?? null,
      lat: result.geometry?.location?.lat ?? null,
      lng: result.geometry?.location?.lng ?? null,
    };
  } catch (e) {
    return defaultResult;
  }
}
