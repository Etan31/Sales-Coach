import { objectionLibrary, getObjectionsForCategories, PRIMARY_OBJECTION_CATEGORIES } from './objectionLibrary.js';

const LEGACY_CATEGORIES = [
  'budget',
  'facebook',
  'trust',
  'competition',
  'need',
  'maintenance',
  'time',
  'previous_experience',
  'authority',
  'price',
  'risk'
];

describe('objectionLibrary', () => {
  it('has all primary categories, each with at least 15 realistic strings', () => {
    expect(Object.keys(objectionLibrary)).toEqual(expect.arrayContaining(PRIMARY_OBJECTION_CATEGORIES));
    for (const category of PRIMARY_OBJECTION_CATEGORIES) {
      expect(Array.isArray(objectionLibrary[category])).toBe(true);
      expect(objectionLibrary[category].length).toBeGreaterThanOrEqual(15);
      objectionLibrary[category].forEach((line) => expect(typeof line).toBe('string'));
    }
  });

  it('keeps legacy category aliases for older generated profiles', () => {
    expect(Object.keys(objectionLibrary)).toEqual(expect.arrayContaining(LEGACY_CATEGORIES));
    for (const category of LEGACY_CATEGORIES) {
      expect(Array.isArray(objectionLibrary[category])).toBe(true);
      expect(objectionLibrary[category].length).toBeGreaterThan(0);
    }
  });

  describe('getObjectionsForCategories', () => {
    it('returns the flattened union of the requested categories in order', () => {
      const result = getObjectionsForCategories(['budget', 'trust']);
      expect(result).toEqual([...objectionLibrary.budget, ...objectionLibrary.trust]);
    });

    it('ignores unknown categories', () => {
      const result = getObjectionsForCategories(['budget', 'not_a_real_category']);
      expect(result).toEqual([...objectionLibrary.budget]);
    });

    it('returns an empty array for non-array input', () => {
      expect(getObjectionsForCategories(undefined)).toEqual([]);
      expect(getObjectionsForCategories(null)).toEqual([]);
      expect(getObjectionsForCategories('budget')).toEqual([]);
    });

    it('returns an empty array for an empty category list', () => {
      expect(getObjectionsForCategories([])).toEqual([]);
    });
  });
});
