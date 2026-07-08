import { describe, it, expect } from 'vitest';
import { formatKm } from './formatDistance';

describe('formatKm', () => {
    it('shows one decimal below 10 km', () => {
        expect(formatKm(0.4)).toBe('0.4 km');
        expect(formatKm(4.26)).toBe('4.3 km');
        expect(formatKm(9.9)).toBe('9.9 km');
    });

    it('rounds to whole kilometers from 10 km up', () => {
        expect(formatKm(10)).toBe('10 km');
        expect(formatKm(10.4)).toBe('10 km');
        expect(formatKm(42.6)).toBe('43 km');
    });
});
