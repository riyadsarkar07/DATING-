export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidPhone = (value: string): boolean =>
  /^\+?[0-9]{7,15}$/.test(value.replace(/[\s-]/g, ''));

export const isValidPassword = (value: string): boolean => value.length >= 6;

export const isValidOtp = (value: string): boolean => /^\d{6}$/.test(value);

export const isValidName = (value: string): boolean => value.trim().length >= 2;

export const isValidBio = (value: string): boolean => value.trim().length >= 20;

export const isValidDateOfBirth = (dobMs: number, minAge = 18): boolean => {
  const age = (Date.now() - dobMs) / (365.25 * 86400000);
  return age >= minAge && age <= 120;
};

export const isValidUrl = (value: string): boolean => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return !!url.hostname;
  } catch {
    return false;
  }
};

export const isValidInstagram = (value: string): boolean => {
  if (!value) return true;
  return /^@?[a-zA-Z0-9._]{1,30}$/.test(value.trim());
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
