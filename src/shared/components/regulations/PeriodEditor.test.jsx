// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import PeriodEditor from './PeriodEditor';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
    cleanup();
});

const springClosure = { startMonth: 4, startDay: 1, endMonth: 5, endDay: 31 };

/**
 * Renders the editor with one period and returns the onChange spy.
 * @param {Object} period - The period to edit.
 * @returns {Function} The onChange mock.
 */
const renderEditor = (period) => {
    const onChange = vi.fn();
    render(<PeriodEditor periods={[period]} onChange={onChange} />);
    return onChange;
};

/** The single period passed to the most recent onChange call. */
const changedPeriod = (onChange) => onChange.mock.calls[0][0][0];

describe('PeriodEditor', () => {
    it('clamps a typed day to the days its month has', () => {
        // A month/day pair has no year, but 31 April is still not a date.
        const onChange = renderEditor(springClosure);

        fireEvent.change(screen.getByLabelText('Start day'), { target: { value: '31' } });

        expect(changedPeriod(onChange).startDay).toBe(30);
    });

    it('pulls the day back when the month changes to a shorter one', () => {
        const onChange = renderEditor({ ...springClosure, startMonth: 1, startDay: 31 });

        // January 31 -> February: the day can no longer stand.
        fireEvent.change(screen.getByLabelText('Start month'), { target: { value: '2' } });

        expect(changedPeriod(onChange)).toMatchObject({ startMonth: 2, startDay: 29 });
    });

    it('allows the end of February', () => {
        const onChange = renderEditor({ ...springClosure, endMonth: 2, endDay: 1 });

        fireEvent.change(screen.getByLabelText('End day'), { target: { value: '29' } });

        expect(changedPeriod(onChange).endDay).toBe(29);
    });

    it('clamps a zero or empty day up to the first of the month', () => {
        const onChange = renderEditor(springClosure);

        fireEvent.change(screen.getByLabelText('Start day'), { target: { value: '0' } });

        expect(changedPeriod(onChange).startDay).toBe(1);
    });

    it('leaves the other end of the period alone', () => {
        const onChange = renderEditor(springClosure);

        fireEvent.change(screen.getByLabelText('Start day'), { target: { value: '15' } });

        expect(changedPeriod(onChange)).toMatchObject({ startDay: 15, endMonth: 5, endDay: 31 });
    });

    it('caps the day input at the month length so the stepper agrees', () => {
        renderEditor({ ...springClosure, startMonth: 2 });

        expect(screen.getByLabelText('Start day').getAttribute('max')).toBe('29');
    });

    it('marks a period that wraps past new year rather than treating it as invalid', () => {
        renderEditor({ startMonth: 12, startDay: 1, endMonth: 1, endDay: 31 });

        expect(screen.getByText('runs into next year')).toBeTruthy();
    });

    it('says so when there is no closed season at all', () => {
        const onChange = vi.fn();
        render(<PeriodEditor periods={[]} onChange={onChange} />);

        expect(screen.getByText(/fishing is open all year/)).toBeTruthy();
    });
});
