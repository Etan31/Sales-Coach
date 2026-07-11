import { objectionLibrary, getObjectionsForCategories } from './objectionLibrary.js';

const EXPECTED_CATEGORIES = [
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
  it('has all 11 categories, each a non-empty array of strings', () => {
    expect(Object.keys(objectionLibrary).sort()).toEqual([...EXPECTED_CATEGORIES].sort());
    for (const category of EXPECTED_CATEGORIES) {
      expect(Array.isArray(objectionLibrary[category])).toBe(true);
      expect(objectionLibrary[category].length).toBeGreaterThan(0);
      objectionLibrary[category].forEach((line) => expect(typeof line).toBe('string'));
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
