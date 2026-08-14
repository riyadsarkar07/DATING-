import * as Location from 'expo-location';
import { GeoPoint } from '../types/user';

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentPosition(): Promise<GeoPoint | null> {
  try {
    const permission = await requestLocationPermission();
    if (!permission) return null;
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(point: GeoPoint): Promise<{ country: string; city: string } | null> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: point.latitude,
      longitude: point.longitude,
    });
    if (results.length === 0) return null;
    const first = results[0];
    return {
      country: first.country ?? '',
      city: first.city ?? first.subregion ?? first.region ?? '',
    };
  } catch {
    return null;
  }
}

export async function detectAndSetLocation(): Promise<GeoPoint | null> {
  const point = await getCurrentPosition();
  return point;
}
