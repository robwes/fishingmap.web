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
    adiposeFin: null,
    minimumSizeCm: null,
    maximumSizeCm: null,
    bagLimit: null,
    bagLimitBasis: null,
    isCatchAndReleaseOnly: false,
    isFullyProtected: false,
    mustReportCatch: false,
    additionalRules: null,
    protectedPeriods: [],
    ...overrides,
});

let container;

/**
 * Renders a row inside a router, since the species name links to its page.
 * @param {...Object} rules - The rules to render; none means an unregulated species.
 * @returns {Element} The row element.
 */
const renderRow = (...rules) => {
    ({ container } = render(
        <MemoryRouter>
            <ul>
                <SpeciesRuleRow species={pike} rules={rules} today={summerDay} />
            </ul>
        </MemoryRouter>
    ));

    return container.querySelector('.species-rule-row');
};

/** The fin-state blocks, in render order. */
const variants = () => [...container.querySelectorAll('.species-rule-variant')];

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
        const row = renderRow();

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

    it('says a fully protected species may not be taken', () => {
        // Distinct from catch and release, which permits fishing for it.
        const row = renderRow(rule({ isFullyProtected: true }));

        expect(screen.getByText('Fully protected')).toBeTruthy();
        expect(screen.getByText('may not be taken')).toBeTruthy();
        expect(screen.queryByText('Catch and release only')).toBeNull();
        // Not "No size or bag limits": full protection is very much a restriction.
        expect(screen.queryByText('No size or bag limits')).toBeNull();
        expect(row.className).toContain('is-closed');
    });

    describe('adipose fin variants', () => {
        const intact = rule({ adiposeFin: 'Intact', isFullyProtected: true });
        const clipped = rule({ adiposeFin: 'Clipped', minimumSizeCm: 50 });

        it('renders one labelled block per fin state under a single species', () => {
            renderRow(intact, clipped);

            // One species heading, not two rows.
            expect(screen.getAllByRole('link', { name: /Pike/ })).toHaveLength(1);
            expect(variants()).toHaveLength(2);
            expect(screen.getByText('Adipose fin intact')).toBeTruthy();
            expect(screen.getByText('Adipose fin clipped')).toBeTruthy();
        });

        it('glosses the fin state, since not every angler knows the term', () => {
            renderRow(intact, clipped);

            expect(screen.getByText('wild fish')).toBeTruthy();
            expect(screen.getByText('hatchery-reared')).toBeTruthy();
        });

        it('states each variant’s own rule against its own label', () => {
            renderRow(intact, clipped);

            expect(variants()[0].textContent).toContain('Fully protected');
            expect(variants()[1].textContent).toContain('Min 50 cm');
        });

        it('gives each variant its own state rather than tinting the whole row', () => {
            const row = renderRow(intact, clipped);

            // Only the protected half is closed; the other is a normal size limit.
            expect(variants()[0].className).toContain('is-closed');
            expect(variants()[1].className).not.toContain('is-closed');
            expect(row.className).not.toContain('is-closed');
        });

        it('names the unqualified rule as covering the remaining fish', () => {
            // An intact-only rule beside a rule for all fish: the second is what
            // applies to clipped fish, so calling it "all" would contradict the first.
            renderRow(intact, rule({ minimumSizeCm: 60 }));

            expect(screen.getByText('All other fish')).toBeTruthy();
        });

        it('leaves a species with one unqualified rule looking exactly as before', () => {
            renderRow(rule({ minimumSizeCm: 40 }));

            expect(variants()).toHaveLength(0);
            expect(screen.queryByText(/Adipose fin/)).toBeNull();
        });

        it('badges each variant with the tier it came from', () => {
            renderRow(
                rule({ adiposeFin: 'Intact', source: 'National', isFullyProtected: true }),
                rule({ adiposeFin: 'Clipped', source: 'Location', minimumSizeCm: 45 })
            );

            expect(variants()[0].textContent).toContain('National');
            expect(variants()[1].textContent).toContain('This water');
            expect(variants()[1].className).toContain('is-override');
        });
    });
});
