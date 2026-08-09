import React from 'react';
import { MONTH_NAMES } from '@/shared/constants/regulations';
import { getDaysInMonth } from '@/shared/utils/regulationUtils';
import '@/shared/components/regulations/regulationFields.scss';
import './PeriodEditor.scss';

const DEFAULT_PERIOD = { startMonth: 5, startDay: 1, endMonth: 6, endDay: 30 };

/**
 * Edits a rule's protected periods.
 *
 * Periods carry no year — they recur annually — so there are no dates to pick,
 * only month/day pairs. A period whose start falls after its end wraps past new
 * year (Dec 1 → Jan 31), which is legitimate and common for winter closures, so
 * it is called out rather than treated as invalid input.
 * @param {Array<Object>} periods - The current periods.
 * @param {Function} onChange - Called with the next periods array.
 */
function PeriodEditor({ periods, onChange }) {

    /**
     * Replaces one end of one period, keeping the day inside the month.
     *
     * Both directions need clamping: typing 31 into a February field, and
     * switching a month to one that has fewer days than the day already set.
     * Clamping rather than rejecting means the invalid state is never
     * reachable, so there is nothing to warn about.
     * @param {number} index - Index of the period being edited.
     * @param {'start'|'end'} end - Which end of the period to change.
     * @param {{month?: number, day?: number}} change - The new month and/or day.
     */
    const setPeriodEnd = (index, end, change) => {
        onChange(periods.map((period, i) => {
            if (i !== index) {
                return period;
            }

            const month = change.month ?? period[`${end}Month`];
            const day = change.day ?? period[`${end}Day`];
            const lastDay = getDaysInMonth(month);

            return {
                ...period,
                [`${end}Month`]: month,
                [`${end}Day`]: Math.min(Math.max(day, 1), lastDay),
            };
        }));
    };

    return (
        <div className="reg-periods">
            <span className="reg-field-label">Protected periods</span>

            {periods.length === 0 && (
                <p className="reg-empty-note">No protected period — fishing is open all year.</p>
            )}

            {periods.map((period, index) => {
                const wraps = (period.startMonth * 100 + period.startDay)
                    > (period.endMonth * 100 + period.endDay);

                return (
                    <div key={index} className="reg-period-row">
                        <div className="reg-period-pair">
                            <input
                                className="reg-input reg-day"
                                type="number"
                                min="1"
                                max={getDaysInMonth(period.startMonth)}
                                aria-label="Start day"
                                value={period.startDay}
                                onChange={(e) => setPeriodEnd(index, 'start', { day: Number(e.target.value) || 1 })}
                            />
                            <select
                                className="reg-input"
                                aria-label="Start month"
                                value={period.startMonth}
                                onChange={(e) => setPeriodEnd(index, 'start', { month: Number(e.target.value) })}>
                                {MONTH_NAMES.map((month, i) => (
                                    <option key={month} value={i + 1}>{month}</option>
                                ))}
                            </select>
                        </div>

                        <i className="fa-solid fa-arrow-right reg-period-arrow"></i>

                        <div className="reg-period-pair">
                            <input
                                className="reg-input reg-day"
                                type="number"
                                min="1"
                                max={getDaysInMonth(period.endMonth)}
                                aria-label="End day"
                                value={period.endDay}
                                onChange={(e) => setPeriodEnd(index, 'end', { day: Number(e.target.value) || 1 })}
                            />
                            <select
                                className="reg-input"
                                aria-label="End month"
                                value={period.endMonth}
                                onChange={(e) => setPeriodEnd(index, 'end', { month: Number(e.target.value) })}>
                                {MONTH_NAMES.map((month, i) => (
                                    <option key={month} value={i + 1}>{month}</option>
                                ))}
                            </select>
                        </div>

                        {wraps && (
                            <span className="reg-period-wrap-note" title="This period runs across the year end">
                                runs into next year
                            </span>
                        )}

                        <button
                            type="button"
                            className="reg-icon-button"
                            aria-label="Remove protected period"
                            onClick={() => onChange(periods.filter((_, i) => i !== index))}>
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>
                );
            })}

            <button
                type="button"
                className="reg-action is-quiet"
                onClick={() => onChange([...periods, { ...DEFAULT_PERIOD }])}>
                <i className="fa-solid fa-plus"></i>Add protected period
            </button>

            <p className="reg-field-hint">Repeats every year — no dates or years to set.</p>
        </div>
    )
}

export default PeriodEditor;
