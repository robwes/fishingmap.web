// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

/** Buttons that fire an error toast and a success toast via useToast. */
const ToastTriggers = () => {
    const showToast = useToast();
    return (
        <>
            <button type="button" onClick={() => showToast('Save failed')}>fail</button>
            <button type="button" onClick={() => showToast('Saved', 'success')}>succeed</button>
        </>
    );
};

/** Renders the trigger buttons inside the provider. */
const renderToasts = () => render(
    <ToastProvider>
        <ToastTriggers />
    </ToastProvider>
);

describe('ToastProvider', () => {
    it('shows toasts with the error style by default and success when asked', () => {
        renderToasts();

        fireEvent.click(screen.getByText('fail'));
        fireEvent.click(screen.getByText('succeed'));

        expect(screen.getByText('Save failed').closest('.toast').className).toContain('toast-error');
        expect(screen.getByText('Saved').closest('.toast').className).toContain('toast-success');
    });

    it('auto-dismisses a toast after 5 seconds', () => {
        vi.useFakeTimers();
        renderToasts();

        fireEvent.click(screen.getByText('fail'));
        expect(screen.getByText('Save failed')).toBeDefined();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(screen.queryByText('Save failed')).toBeNull();
    });

    it('dismisses only the clicked toast from the stack', () => {
        renderToasts();

        fireEvent.click(screen.getByText('fail'));
        fireEvent.click(screen.getByText('succeed'));

        fireEvent.click(screen.getAllByLabelText('Dismiss')[0]);

        expect(screen.queryByText('Save failed')).toBeNull();
        expect(screen.getByText('Saved')).toBeDefined();
    });
});
