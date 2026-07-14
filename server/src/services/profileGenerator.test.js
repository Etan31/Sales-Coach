import { generateBusinessProfile } from './profileGenerator.js';

const REQUIRED_KEYS = [
  'business',
  'ownerName',
  'ownerAge',
  'personality',
  'technologyLevel',
  'budget',
  'website',
  'facebook',
  'marketing',
  'painPoints',
  'allowedObjections',
  'emotion',
  'businessType',
  'industry',
  'ownerPersonality',
  'receptionistAvailability',
  'difficulty',
  'language',
  'technologyConfidence',
  'websiteKnowledge',
  'budgetSensitivity',
  'decisionAuthority',
  'salesOpenness',
  'scriptGuidance',
  'currentBusinessProblems',
  'marketingChannels',
  'customerAcquisition',
  'orderSources',
  'currentBookingSystem',
  'currentSoftware',
  'revenueSources',
  'preferredCommunication',
  'businessReality'
];

// Budget ceilings mirrored from profileGenerator.js's internal BUDGET_RANGES (not exported).
const BUDGET_RANGES = {
  easy: [15000, 30000],
  medium: [8000, 15000],
  hard: [3000, 8000],
  impossible: [0, 3000]
};

describe('generateBusinessProfile', () => {
  it('is deterministic given the same injected rng', () => {
    const rng = () => 0.42;
    const first = generateBusinessProfile('coffee_shop', 'medium', rng);
    const second = generateBusinessProfile('coffee_shop', 'medium', rng);
    expect(second).toEqual(first);
  });

  it('produces different profiles for different rng sequences', () => {
    const a = generateBusinessProfile('coffee_shop', 'medium', () => 0.1);
    const b = generateBusinessProfile('coffee_shop', 'medium', () => 0.9);
    expect(a).not.toEqual(b);
  });

  it('includes every required business_profile key', () => {
    const profile = generateBusinessProfile('barbershop', 'easy', () => 0.5);
    expect(Object.keys(profile)).toEqual(expect.arrayContaining(REQUIRED_KEYS));
    expect(typeof profile.business).toBe('string');
    expect(typeof profile.ownerName).toBe('string');
    expect(typeof profile.ownerAge).toBe('number');
    expect(typeof profile.budget).toBe('number');
    expect(typeof profile.website).toBe('boolean');
    expect(typeof profile.facebook).toBe('boolean');
    expect(Array.isArray(profile.marketing)).toBe(true);
    expect(Array.isArray(profile.painPoints)).toBe(true);
    expect(Array.isArray(profile.allowedObjections)).toBe(true);
    expect(typeof profile.industry).toBe('string');
    expect(typeof profile.ownerPersonality).toBe('object');
    expect(typeof profile.receptionistAvailability).toBe('object');
    expect(typeof profile.scriptGuidance).toBe('string');
    expect(Array.isArray(profile.currentBusinessProblems)).toBe(true);
    expect(Array.isArray(profile.marketingChannels)).toBe(true);
    expect(Array.isArray(profile.customerAcquisition)).toBe(true);
    expect(Array.isArray(profile.orderSources)).toBe(true);
    expect(Array.isArray(profile.currentSoftware)).toBe(true);
    expect(Array.isArray(profile.revenueSources)).toBe(true);
  });

  it.each(['easy', 'medium', 'hard', 'impossible'])('scales budget within the %s range', (difficulty) => {
    const [min, max] = BUDGET_RANGES[difficulty];
    // Sample across the rng domain to exercise the full budget range for this difficulty.
    for (const seed of [0, 0.25, 0.5, 0.75, 0.999]) {
      const profile = generateBusinessProfile('gym', difficulty, () => seed);
      expect(profile.budget).toBeGreaterThanOrEqual(min);
      expect(profile.budget).toBeLessThanOrEqual(max);
    }
  });

  it('harder difficulty yields more/tougher allowedObjections at the high end of the rng domain', () => {
    const highRng = () => 0.999;
    const easy = generateBusinessProfile('salon', 'easy', highRng);
    const medium = generateBusinessProfile('salon', 'medium', highRng);
    const hard = generateBusinessProfile('salon', 'hard', highRng);
    const impossible = generateBusinessProfile('salon', 'impossible', highRng);

    expect(easy.allowedObjections.length).toBeLessThanOrEqual(medium.allowedObjections.length);
    expect(medium.allowedObjections.length).toBeLessThanOrEqual(hard.allowedObjections.length);
    // Impossible always carries its fixed tough core set in the expanded category naming.
    expect(impossible.allowedObjections).toEqual(
      expect.arrayContaining(['budget', 'trust', 'already_have_someone', 'no_need', 'roi', 'scammed_before'])
    );
    expect(impossible.allowedObjections.length).toBeGreaterThanOrEqual(hard.allowedObjections.length - 1);
  });

  it('falls back gracefully for an unknown businessType', () => {
    expect(() => generateBusinessProfile('made_up_business', 'medium', () => 0.5)).not.toThrow();
    const profile = generateBusinessProfile('made_up_business', 'medium', () => 0.5);
    expect(profile.business).toBe('Made Up Business');
    expect(profile.painPoints.length).toBeGreaterThan(0);
    expect(profile.marketing.length).toBeGreaterThan(0);
  });

  it('falls back to medium for an unknown difficulty', () => {
    expect(() => generateBusinessProfile('coffee_shop', 'nightmare', () => 0.5)).not.toThrow();
    const profile = generateBusinessProfile('coffee_shop', 'nightmare', () => 0.5);
    const [min, max] = BUDGET_RANGES.medium;
    expect(profile.budget).toBeGreaterThanOrEqual(min);
    expect(profile.budget).toBeLessThanOrEqual(max);
  });
});
