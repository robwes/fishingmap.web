// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import useDebouncedQuery from './useDebouncedQuery';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('useDebouncedQuery', () => {
    it('exposes the initial data while loading and fetches after the delay', async () => {
        vi.useFakeTimers();
        const queryFn = vi.fn(async () => ['pike']);

        const { result } = renderHook(() => useDebouncedQuery(queryFn, ['q'], { initial: [] }));

        expect(result.current).toEqual({ data: [], isLoading: true });
        expect(queryFn).not.toHaveBeenCalled();

        await act(async () => {
            vi.advanceTimersByTime(250);
        });

        expect(result.current).toEqual({ data: ['pike'], isLoading: false });
    });

    it('collapses rapid dep changes into a single fetch with the latest values', async () => {
        vi.useFakeTimers();
        const queryFn = vi.fn(async () => 'result');

        const { rerender } = renderHook(
            ({ q }) => useDebouncedQuery(() => queryFn(q), [q]),
            { initialProps: { q: 'p' } }
        );

        await act(async () => {
            vi.advanceTimersByTime(100);
        });
        rerender({ q: 'pi' });
        await act(async () => {
            vi.advanceTimersByTime(100);
        });
        rerender({ q: 'pik' });
        await act(async () => {
            vi.advanceTimersByTime(250);
        });

        expect(queryFn).toHaveBeenCalledTimes(1);
        expect(queryFn).toHaveBeenCalledWith('pik');
    });

    it('ignores the result of a superseded fetch, even when it resolves last', async () => {
        vi.useFakeTimers();
        const resolvers = [];
        const queryFn = vi.fn(() => new Promise((resolve) => resolvers.push(resolve)));

        const { result, rerender } = renderHook(
            ({ q }) => useDebouncedQuery(queryFn, [q]),
            { initialProps: { q: 'old' } }
        );

        // First fetch goes in flight, then the deps change and a second
        // fetch fires while the first is still pending.
        await act(async () => {
            vi.advanceTimersByTime(250);
        });
        rerender({ q: 'new' });
        await act(async () => {
            vi.advanceTimersByTime(250);
        });
        expect(resolvers).toHaveLength(2);

        await act(async () => {
            resolvers[1]('new result');
        });
        expect(result.current).toEqual({ data: 'new result', isLoading: false });

        // The stale run resolving afterwards must not clobber the newer data.
        await act(async () => {
            resolvers[0]('stale result');
        });
        expect(result.current.data).toBe('new result');
    });

    it('keeps the previous data when a run returns a falsy sentinel', async () => {
        vi.useFakeTimers();
        const results = [['pike'], null];
        const queryFn = vi.fn(async () => results.shift());

        const { result, rerender } = renderHook(
            ({ q }) => useDebouncedQuery(queryFn, [q]),
            { initialProps: { q: 'first' } }
        );

        await act(async () => {
            vi.advanceTimersByTime(250);
        });
        expect(result.current.data).toEqual(['pike']);

        rerender({ q: 'second' });
        await act(async () => {
            vi.advanceTimersByTime(250);
        });

        expect(result.current).toEqual({ data: ['pike'], isLoading: false });
        expect(queryFn).toHaveBeenCalledTimes(2);
    });
});
