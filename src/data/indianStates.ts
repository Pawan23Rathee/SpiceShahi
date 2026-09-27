export interface IndianState {
  code: string;
  name: string;
  isHaryana?: boolean;
}

export const INDIAN_STATES: IndianState[] = [
  { code: 'HR', name: 'Haryana', isHaryana: true },
  { code: 'DL', name: 'Delhi' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'PB', name: 'Punjab' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'CH', name: 'Chandigarh' },
  { code: 'UT', name: 'Uttarakhand' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TS', name: 'Telangana' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'WB', name: 'West Bengal' },
  { code: 'BR', name: 'Bihar' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'OR', name: 'Odisha' },
  { code: 'KL', name: 'Kerala' },
  { code: 'AS', name: 'Assam' },
  { code: 'JK', name: 'Jammu & Kashmir' },
  { code: 'GA', name: 'Goa' },
  { code: 'CG', name: 'Chhattisgarh' },
  { code: 'TR', name: 'Tripura' },
  { code: 'ML', name: 'Meghalaya' },
  { code: 'MN', name: 'Manipur' },
  { code: 'NL', name: 'Nagaland' },
  { code: 'MZ', name: 'Mizoram' },
  { code: 'AR', name: 'Arunachal Pradesh' },
  { code: 'SK', name: 'Sikkim' },
  { code: 'PY', name: 'Puducherry' },
  { code: 'LA', name: 'Ladakh' },
  { code: 'AN', name: 'Andaman & Nicobar Islands' },
  { code: 'DN', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: 'LD', name: 'Lakshadweep' },
];

/**
 * Basic heuristics for detecting state from 6-digit Indian PIN code
 * First 2 digits indicate postal circle:
 * 12, 13 -> Haryana
 * 11 -> Delhi
 * 14, 15 -> Punjab
 * 16 -> Chandigarh
 * 17 -> Himachal Pradesh
 * 20 - 28 -> Uttar Pradesh & Uttarakhand
 * 30 - 34 -> Rajasthan
 * 36 - 39 -> Gujarat
 * 40 - 44 -> Maharashtra & Goa
 * 45 - 48 -> Madhya Pradesh & Chhattisgarh
 * 50 - 53 -> Andhra Pradesh & Telangana
 * 56 - 59 -> Karnataka
 * 60 - 64 -> Tamil Nadu & Puducherry
 * 67 - 69 -> Kerala
 * 70 - 74 -> West Bengal
 * 75 - 77 -> Odisha
 * 78 -> Assam
 * 79 -> North East
 * 80 - 85 -> Bihar & Jharkhand
 */
export function getStateFromPincode(pincode: string): string | null {
  const clean = pincode.replace(/\D/g, '');
  if (clean.length < 2) return null;
  const prefix = parseInt(clean.substring(0, 2), 10);

  if (prefix === 12 || prefix === 13) return 'Haryana';
  if (prefix === 11) return 'Delhi';
  if (prefix === 14 || prefix === 15) return 'Punjab';
  if (prefix === 16) return 'Chandigarh';
  if (prefix === 17) return 'Himachal Pradesh';
  if (prefix >= 20 && prefix <= 28) return 'Uttar Pradesh';
  if (prefix >= 30 && prefix <= 34) return 'Rajasthan';
  if (prefix >= 36 && prefix <= 39) return 'Gujarat';
  if (prefix >= 40 && prefix <= 44) return 'Maharashtra';
  if (prefix >= 45 && prefix <= 48) return 'Madhya Pradesh';
  if (prefix >= 50 && prefix <= 53) return 'Telangana';
  if (prefix >= 56 && prefix <= 59) return 'Karnataka';
  if (prefix >= 60 && prefix <= 64) return 'Tamil Nadu';
  if (prefix >= 67 && prefix <= 69) return 'Kerala';
  if (prefix >= 70 && prefix <= 74) return 'West Bengal';
  if (prefix >= 75 && prefix <= 77) return 'Odisha';
  if (prefix === 78) return 'Assam';
  if (prefix >= 80 && prefix <= 85) return 'Bihar';

  return null;
}
