import {
  getCallPreferences,
  saveCallPreferences,
  DEFAULT_CALL_PREFERENCES,
  PAUSE_ALLOWANCE_MIN_MS,
  PAUSE_ALLOWANCE_MAX_MS
} from './callPreferences.js';

const STORAGE_KEY = 'salescoach.callPrefs';

describe('callPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the defaults when nothing is saved', () => {
    expect(getCallPreferences()).toEqual(DEFAULT_CALL_PREFERENCES);
  });

  it('defaults to auto-reply on with a 3 second pause allowance', () => {
    expect(DEFAULT_CALL_PREFERENCES.autoReply).toBe(true);
    expect(DEFAULT_CALL_PREFERENCES.pauseAllowanceMs).toBe(3000);
  });

  it('round-trips saved preferences', () => {
    saveCallPreferences({ autoReply: false, pauseAllowanceMs: 5000, muted: true });
    expect(getCallPreferences()).toEqual({ autoReply: false, pauseAllowanceMs: 5000, muted: true });
  });

  it('merges a patch over the existing preferences without dropping other keys', () => {
    saveCallPreferences({ autoReply: false, pauseAllowanceMs: 8000 });
    saveCallPreferences({ muted: true });

    expect(getCallPreferences()).toEqual({ autoReply: false, pauseAllowanceMs: 8000, muted: true });
  });

  it('clamps a pause allowance above the maximum', () => {
    saveCallPreferences({ pauseAllowanceMs: 999999 });
    expect(getCallPreferences().pauseAllowanceMs).toBe(PAUSE_ALLOWANCE_MAX_MS);
  });

  it('clamps a pause allowance below the minimum', () => {
    saveCallPreferences({ pauseAllowanceMs: 10 });
    expect(getCallPreferences().pauseAllowanceMs).toBe(PAUSE_ALLOWANCE_MIN_MS);
  });

  // A NaN allowance would flow into `Date.now() + ms` and make the countdown fire on its
  // first tick, so non-numeric values must fall back rather than clamp.
  it.each([['abc'], [NaN], [null], [undefined], [{}]])(
    'falls back to the default pause allowance for %p',
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ pauseAllowanceMs: value }));
      expect(getCallPreferences().pauseAllowanceMs).toBe(DEFAULT_CALL_PREFERENCES.pauseAllowanceMs);
    }
  );

  it('falls back to the default for a non-boolean autoReply', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ autoReply: 'yes' }));
    expect(getCallPreferences().autoReply).toBe(DEFAULT_CALL_PREFERENCES.autoReply);
  });

  it('returns the defaults when stored JSON is corrupted', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(getCallPreferences()).toEqual(DEFAULT_CALL_PREFERENCES);
  });

  it('returns the defaults when the stored value is not an object', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['nope']));
    expect(getCallPreferences()).toEqual(DEFAULT_CALL_PREFERENCES);
  });

  it('never throws when storage is unavailable', () => {
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => saveCallPreferences({ muted: true })).not.toThrow();
    expect(getCallPreferences()).toEqual(DEFAULT_CALL_PREFERENCES);

    getItem.mockRestore();
    setItem.mockRestore();
  });
});
