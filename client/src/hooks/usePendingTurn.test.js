import { act, renderHook } from '@testing-library/react';
import usePendingTurn from './usePendingTurn.js';

// Jest's modern fake timers also fake Date.now(), which is what lets the hook's absolute
// deadline be driven forward by advanceTimersByTime.
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

function setup(options = {}) {
  const onCommit = jest.fn();
  const utils = renderHook((props) => usePendingTurn({ onCommit, ...props }), {
    initialProps: options
  });
  return { onCommit, ...utils };
}

describe('usePendingTurn', () => {
  describe('auto mode', () => {
    it('joins appended parts into one draft', () => {
      const { result } = setup();

      act(() => result.current.appendPart('Hi, I noticed your shop'));
      act(() => result.current.appendPart("doesn't have a website"));

      expect(result.current.draft).toBe("Hi, I noticed your shop doesn't have a website");
    });

    it('arms a countdown on an appended part and ticks it down', () => {
      const { result } = setup({ pauseAllowanceMs: 3000 });

      act(() => result.current.appendPart('hello'));
      expect(result.current.isArmed).toBe(true);
      expect(result.current.secondsRemaining).toBe(3);

      act(() => jest.advanceTimersByTime(1000));
      expect(result.current.secondsRemaining).toBe(2);

      act(() => jest.advanceTimersByTime(1000));
      expect(result.current.secondsRemaining).toBe(1);
    });

    it('commits the joined draft once the allowance elapses', () => {
      const { result, onCommit } = setup({ pauseAllowanceMs: 3000 });

      act(() => result.current.appendPart('pricing please'));
      act(() => jest.advanceTimersByTime(3000));

      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommit).toHaveBeenCalledWith('pricing please');
      expect(result.current.draft).toBe('');
      expect(result.current.isArmed).toBe(false);
    });

    // The reported bug: a pause mid-sentence must not end the turn.
    it('does not commit while activity keeps arriving', () => {
      const { result, onCommit } = setup({ pauseAllowanceMs: 3000 });

      act(() => result.current.appendPart('Hi, I noticed'));
      act(() => jest.advanceTimersByTime(2000));

      act(() => result.current.noteActivity());
      act(() => jest.advanceTimersByTime(5000));

      expect(onCommit).not.toHaveBeenCalled();
      expect(result.current.isArmed).toBe(false);
    });

    it('re-arms from full when a further part arrives after a pause', () => {
      const { result, onCommit } = setup({ pauseAllowanceMs: 3000 });

      act(() => result.current.appendPart('Hi, I noticed'));
      act(() => jest.advanceTimersByTime(2500));
      act(() => result.current.appendPart('your shop has no website'));

      expect(result.current.secondsRemaining).toBe(3);

      act(() => jest.advanceTimersByTime(2999));
      expect(onCommit).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(1));
      expect(onCommit).toHaveBeenCalledWith('Hi, I noticed your shop has no website');
    });

    it('arms rather than sending when a text turn requests commit', () => {
      const { result, onCommit } = setup({ pauseAllowanceMs: 3000 });

      act(() => result.current.setDraft('accidental enter'));
      act(() => result.current.requestCommit());

      expect(result.current.isArmed).toBe(true);
      expect(onCommit).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(3000));
      expect(onCommit).toHaveBeenCalledWith('accidental enter');
    });

    it('lets an edit to the draft cancel the countdown', () => {
      const { result, onCommit } = setup({ pauseAllowanceMs: 3000 });

      act(() => result.current.appendPart('web site'));
      act(() => result.current.setDraft('website'));

      expect(result.current.isArmed).toBe(false);
      act(() => jest.advanceTimersByTime(5000));
      expect(onCommit).not.toHaveBeenCalled();
    });

    it('commits the edited text, not the transcribed text', () => {
      const { result, onCommit } = setup({ pauseAllowanceMs: 3000 });

      act(() => result.current.appendPart('web site'));
      act(() => result.current.setDraft('website'));
      act(() => result.current.commitNow());

      expect(onCommit).toHaveBeenCalledWith('website');
    });

    it('applies a changed pause allowance on the next arm', () => {
      const { result, onCommit, rerender } = setup({ pauseAllowanceMs: 3000 });

      rerender({ pauseAllowanceMs: 8000 });
      act(() => result.current.appendPart('take your time'));

      expect(result.current.secondsRemaining).toBe(8);
      act(() => jest.advanceTimersByTime(3000));
      expect(onCommit).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(5000));
      expect(onCommit).toHaveBeenCalledTimes(1);
    });
  });

  describe('manual mode', () => {
    it('never arms a countdown on an appended part', () => {
      const { result, onCommit } = setup({ autoReply: false });

      act(() => result.current.appendPart('hello'));

      expect(result.current.isArmed).toBe(false);
      expect(result.current.secondsRemaining).toBeNull();

      act(() => jest.advanceTimersByTime(60000));
      expect(onCommit).not.toHaveBeenCalled();
    });

    // Manual mode hands the send decision entirely to the seller's click, so an
    // accidental Enter must be harmless and still open to additions.
    it('stages rather than sending when a text turn requests commit', () => {
      const { result, onCommit } = setup({ autoReply: false });

      act(() => result.current.setDraft('accidental enter'));
      act(() => result.current.requestCommit());

      expect(onCommit).not.toHaveBeenCalled();
      expect(result.current.draft).toBe('accidental enter');

      act(() => jest.advanceTimersByTime(60000));
      expect(onCommit).not.toHaveBeenCalled();
    });

    // Turning auto-reply off means "nothing sends without me", which has to include a
    // countdown that was already running when the seller flipped it.
    it('cancels a running countdown when auto-reply is switched off', () => {
      const { result, onCommit, rerender } = setup({ pauseAllowanceMs: 3000, autoReply: true });

      act(() => result.current.appendPart('wait, let me think'));
      expect(result.current.isArmed).toBe(true);

      rerender({ pauseAllowanceMs: 3000, autoReply: false });

      expect(result.current.isArmed).toBe(false);
      act(() => jest.advanceTimersByTime(10000));
      expect(onCommit).not.toHaveBeenCalled();
    });

    it('sends only on an explicit commit', () => {
      const { result, onCommit } = setup({ autoReply: false });

      act(() => result.current.setDraft('send it now'));
      act(() => result.current.requestCommit());
      act(() => result.current.commitNow());

      expect(onCommit).toHaveBeenCalledWith('send it now');
    });
  });

  describe('commitNow', () => {
    it('skips the remaining countdown', () => {
      const { result, onCommit } = setup({ pauseAllowanceMs: 3000 });

      act(() => result.current.appendPart('urgent'));
      act(() => result.current.commitNow());

      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(result.current.isArmed).toBe(false);

      act(() => jest.advanceTimersByTime(5000));
      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    // Guards the stale-ref read that a pre-repaint second call would otherwise make.
    it('sends once when called twice in a row', () => {
      const { result, onCommit } = setup();

      act(() => result.current.setDraft('only once'));
      act(() => {
        result.current.commitNow();
        result.current.commitNow();
      });

      expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it('does not commit an empty or whitespace-only draft', () => {
      const { result, onCommit } = setup();

      act(() => result.current.setDraft('   '));
      act(() => result.current.commitNow());

      expect(onCommit).not.toHaveBeenCalled();
    });
  });

  describe('canCommit gating', () => {
    it('holds a due turn instead of dropping it, then commits when allowed', () => {
      const { result, onCommit, rerender } = setup({ pauseAllowanceMs: 3000, canCommit: false });

      act(() => result.current.appendPart('held turn'));
      act(() => jest.advanceTimersByTime(3000));

      expect(onCommit).not.toHaveBeenCalled();
      expect(result.current.isArmed).toBe(true);

      rerender({ pauseAllowanceMs: 3000, canCommit: true });
      act(() => jest.advanceTimersByTime(500));

      expect(onCommit).toHaveBeenCalledWith('held turn');
      expect(result.current.draft).toBe('');
    });

    it('does not commit on an explicit send while blocked', () => {
      const { result, onCommit } = setup({ canCommit: false });

      act(() => result.current.setDraft('blocked'));
      act(() => result.current.commitNow());

      expect(onCommit).not.toHaveBeenCalled();
      expect(result.current.draft).toBe('blocked');
    });
  });

  describe('lifecycle', () => {
    it('does not commit after unmounting mid-countdown', () => {
      const { result, onCommit, unmount } = setup({ pauseAllowanceMs: 3000 });

      act(() => result.current.appendPart('abandoned'));
      unmount();
      act(() => jest.advanceTimersByTime(10000));

      expect(onCommit).not.toHaveBeenCalled();
    });

    it('discards the draft and the countdown', () => {
      const { result, onCommit } = setup({ pauseAllowanceMs: 3000 });

      act(() => result.current.appendPart('never mind'));
      act(() => result.current.discard());

      expect(result.current.draft).toBe('');
      expect(result.current.isArmed).toBe(false);

      act(() => jest.advanceTimersByTime(5000));
      expect(onCommit).not.toHaveBeenCalled();
    });

    it('ignores empty appended parts', () => {
      const { result } = setup();

      act(() => result.current.appendPart('   '));
      act(() => result.current.appendPart(null));

      expect(result.current.draft).toBe('');
      expect(result.current.isArmed).toBe(false);
    });
  });
});
