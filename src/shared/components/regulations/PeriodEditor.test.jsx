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

describe('water qualifier', () => {
    const autumn = { startMonth: 9, startDay: 1, endMonth: 11, endDay: 30 };

    it('labels the picker and names the unqualified case explicitly', () => {
        // Without a label the select is unexplained, and "everywhere" has to read as a
        // choice rather than as a placeholder.
        renderEditor(autumn);

        const select = screen.getByLabelText('Closure applies in');
        expect(select.value).toBe('');
        expect([...select.options].map(option => option.textContent)).toEqual([
            'All waters this rule covers',
            'Rivers and streams',
            'Sea areas',
            'Inland waters',
            'Streams and ponds with no migratory connection',
        ]);
    });

    it('sets the qualifier on the period being edited', () => {
        const onChange = renderEditor(autumn);

        fireEvent.change(screen.getByLabelText('Closure applies in'), {
            target: { value: 'RiversAndStreams' },
        });

        expect(changedPeriod(onChange).appliesToWaterType).toBe('RiversAndStreams');
    });

    it('leaves the other periods alone', () => {
        // One rule can hold a river-only autumn closure and an everywhere winter one.
        const onChange = vi.fn();
        render(<PeriodEditor periods={[autumn, springClosure]} onChange={onChange} />);

        fireEvent.change(screen.getAllByLabelText('Closure applies in')[0], {
            target: { value: 'RiversAndStreams' },
        });

        const [first, second] = onChange.mock.calls[0][0];
        expect(first.appliesToWaterType).toBe('RiversAndStreams');
        expect(second.appliesToWaterType).toBeUndefined();
    });

    it('clears the qualifier back to unqualified', () => {
        // Null is a value here — the closure applies wherever the rule does.
        const onChange = renderEditor({ ...autumn, appliesToWaterType: 'RiversAndStreams' });

        fireEvent.change(screen.getByLabelText('Closure applies in'), { target: { value: '' } });

        expect(changedPeriod(onChange).appliesToWaterType).toBeNull();
    });

    it('puts the qualifier last in the row so it wraps onto its own line', () => {
        // Layout here is DOM order plus one full-width child: the dates and Remove share the
        // first line, and the select takes the second. Reordering these silently changes the
        // layout, and no unit test can see width.
        const { container } = render(<PeriodEditor periods={[autumn]} onChange={vi.fn()} />);
        const row = container.querySelector('.reg-period-row');
        const classOf = (child) => child.className;

        expect([...row.children].map(classOf)).toEqual([
            'reg-period-pair',
            'fa-solid fa-arrow-right reg-period-arrow',
            'reg-period-pair',
            'reg-icon-button',
            'reg-period-waters',
        ]);
    });

    it('warns that a qualified closure is reported rather than filtered', () => {
        renderEditor({ ...autumn, appliesToWaterType: 'RiversAndStreams' });

        expect(screen.getByText(/closed season may apply/)).toBeTruthy();
    });

    it('says nothing extra when the closure is unqualified', () => {
        renderEditor(autumn);

        expect(screen.queryByText(/closed season may apply/)).toBeNull();
    });
});
