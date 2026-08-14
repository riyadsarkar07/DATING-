import { GeoPoint } from '../../types/user';

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function distanceLabel(km: number | null): string {
  if (km === null || km === undefined) return 'Somewhere';
  if (km < 1) return 'Less than 1 km away';
  if (km < 100) return `${Math.round(km)} km away`;
  return `${Math.round(km / 10) * 10} km away`;
}

export function isNearby(km: number | null, maxKm: number): boolean {
  if (km === null || km === undefined) return true;
  return km <= maxKm;
}
