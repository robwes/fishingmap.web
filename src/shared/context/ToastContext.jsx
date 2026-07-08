import React, { useCallback, useContext, useRef, useState } from 'react';
import './ToastContext.scss';

export const ToastContext = React.createContext(() => {});

/**
 * App-wide toast notifications. Services swallow errors and return
 * sentinels, so pages use toasts to tell the user when a mutation failed
 * (or quietly succeeded, for pages with no other feedback). Toasts stack
 * bottom-right, auto-dismiss after 5 seconds, and can be dismissed by hand.
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(0);

    /**
     * Removes a toast from the stack.
     * @param {number} id - The toast's id.
     */
    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    /**
     * Shows a toast notification.
     * @param {string} message - The text to display.
     * @param {'error'|'success'} [type] - Visual style (default 'error').
     */
    const showToast = useCallback((message, type = 'error') => {
        const id = nextId.current++;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => dismissToast(id), 5000);
    }, [dismissToast]);

    return (
        <ToastContext value={showToast}>
            {children}
            <div className="toast-container" role="status" aria-live="polite">
                {toasts.map(t => (
                    <div key={t.id} className={`toast toast-${t.type}`}>
                        <i className={`fas ${t.type === 'error' ? 'fa-circle-exclamation' : 'fa-check-circle'}`} />
                        <span className="toast-message">{t.message}</span>
                        <button
                            type="button"
                            className="toast-close"
                            onClick={() => dismissToast(t.id)}
                            aria-label="Dismiss"
                        >
                            <i className="fas fa-times" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext>
    );
};

export const useToast = () => useContext(ToastContext);
