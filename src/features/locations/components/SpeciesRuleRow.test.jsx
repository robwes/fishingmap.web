// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SpeciesRuleRow from './SpeciesRuleRow';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
    cleanup();
});

const pike = { id: 1, name: 'Pike' };

// Mid-June: outside the winter closure, inside the summer one.
const summerDay = new Date(2026, 5, 15);

const winterClosure = { startMonth: 12, startDay: 1, endMonth: 1, endDay: 31 };
const summerClosure = { startMonth: 6, startDay: 1, endMonth: 8, endDay: 31 };

/**
 * Builds a resolved species rule, defaulting every restriction to unset.
 * @param {Object} [overrides] - Fields to set on the rule.
 * @returns {Object} A rule shaped like location.speciesRules[].
 */
const rule = (overrides = {}) => ({
    speciesId: 1,
    source: 'National',
    minimumSizeCm: null,
    maximumSizeCm: null,
    bagLimit: null,
    bagLimitBasis: null,
    isCatchAndReleaseOnly: false,
    mustReportCatch: false,
    additionalRules: null,
    protectedPeriods: [],
    ...overrides,
});

/**
 * Renders a row inside a router, since the species name links to its page.
 * @param {Object|undefined} speciesRule - The rule to render, or undefined.
 */
const renderRow = (speciesRule) => {
    const { container } = render(
        <MemoryRouter>
            <ul>
                <SpeciesRuleRow species={pike} rule={speciesRule} today={summerDay} />
            </ul>
        </MemoryRouter>
    );

    return container.querySelector('.species-rule-row');
};

describe('SpeciesRuleRow', () => {
    it('links the species name to its details page', () => {
        renderRow(rule({ minimumSizeCm: 40 }));

        expect(screen.getByRole('link', { name: /Pike/ })).toHaveProperty(
            'href',
            expect.stringContaining('/species/1')
        );
    });

    it('renders the restrictions as facts', () => {
        renderRow(rule({ minimumSizeCm: 40, maximumSizeCm: 70, bagLimit: 6, bagLimitBasis: 'Day', mustReportCatch: true }));

        expect(screen.getByText('40–70 cm')).toBeTruthy();
        expect(screen.getByText('6 per day')).toBeTruthy();
        expect(screen.getByText('Report catch')).toBeTruthy();
    });

    it('says so plainly when a species carries no rule at all', () => {
        const row = renderRow(undefined);

        expect(screen.getByText('No size or bag limits')).toBeTruthy();
        expect(row.className).toContain('is-unregulated');
    });

    it('treats a rule with every field empty as unregulated', () => {
        // An empty rule row carries no information — it must not read as if
        // limits exist but are unknown.
        const row = renderRow(rule());

        expect(screen.getByText('No size or bag limits')).toBeTruthy();
        expect(row.className).toContain('is-unregulated');
    });

    it('flags a species that is closed today and says when it reopens', () => {
        const row = renderRow(rule({ protectedPeriods: [summerClosure] }));

        expect(screen.getByText('Protected now')).toBeTruthy();
        expect(screen.getByText('until 31 Aug')).toBeTruthy();
        expect(row.className).toContain('is-closed');
    });

    it('shows a dormant closure as a fact rather than a flag', () => {
        const row = renderRow(rule({ protectedPeriods: [winterClosure] }));

        expect(screen.getByText(/Protected 1 Dec – 31 Jan/)).toBeTruthy();
        expect(screen.queryByText('Protected now')).toBeNull();
        expect(row.className).not.toContain('is-closed');
    });

    it('does not repeat an in-force closure as a fact chip', () => {
        renderRow(rule({ protectedPeriods: [summerClosure] }));

        expect(screen.getByText('Protected now')).toBeTruthy();
        expect(screen.queryByText(/Protected 1 Jun/)).toBeNull();
    });

    it('marks a rule set on this water as an override', () => {
        const row = renderRow(rule({ source: 'Location', minimumSizeCm: 50 }));

        expect(screen.getByText('This water')).toBeTruthy();
        expect(row.className).toContain('is-override');
    });

    it('names the region an inherited rule came from', () => {
        const row = renderRow(rule({ source: 'Region: Uusimaa ELY', minimumSizeCm: 50 }));

        expect(screen.getByText('Uusimaa ELY')).toBeTruthy();
        expect(row.className).not.toContain('is-override');
    });

    it('shows no source badge for the backend Unknown fallback', () => {
        renderRow(rule({ source: 'Unknown', minimumSizeCm: 50 }));

        expect(screen.queryByText('Unknown')).toBeNull();
        expect(screen.getByText('Min 50 cm')).toBeTruthy();
    });

    it('folds a long additional rule behind a toggle', () => {
        const longText = 'Only single barbless hooks may be used. '.repeat(6);
        renderRow(rule({ minimumSizeCm: 40, additionalRules: longText }));

        expect(screen.getByRole('button', { name: /Read full rule/ })).toBeTruthy();
    });

    it('leaves a short additional rule unfolded', () => {
        renderRow(rule({ minimumSizeCm: 40, additionalRules: 'No live bait.' }));

        expect(screen.getByText('No live bait.')).toBeTruthy();
        expect(screen.queryByRole('button', { name: /Read full rule/ })).toBeNull();
    });
});
