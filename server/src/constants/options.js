// Enum option lists shared by validators, GET /api/config, and label lookups.
// Values and labels must match docs/contracts.md exactly.

export const businessTypes = [
  { value: 'coffee_shop', label: 'Coffee Shop' },
  { value: 'barbershop', label: 'Barbershop' },
  { value: 'salon', label: 'Salon' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'gym', label: 'Gym' },
  { value: 'dental_clinic', label: 'Dental Clinic' },
  { value: 'laundry_shop', label: 'Laundry Shop' },
  { value: 'convenience_store', label: 'Convenience Store' },
  { value: 'hardware_store', label: 'Hardware Store' },
  { value: 'bakery', label: 'Bakery' }
];

export const difficulties = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'impossible', label: 'Impossible' }
];

export const contactMethods = [
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'messenger', label: 'Facebook Messenger' },
  { value: 'email', label: 'Email' }
];

export const languages = [
  { value: 'english', label: 'English' },
  { value: 'tagalog', label: 'Tagalog' },
  { value: 'taglish', label: 'Taglish' }
];

// Looks up the display label for a businessType slug (falls back to the slug itself).
export function businessLabel(slug) {
  return businessTypes.find((option) => option.value === slug)?.label ?? slug;
}
