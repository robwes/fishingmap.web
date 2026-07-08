// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import MediaManagerPanel from './MediaManagerPanel';

// Tests run without vitest globals, so RTL cannot register this itself.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/** Builds a valid image File for upload tests. */
const pngFile = (name = 'photo.png') => new File(['x'], name, { type: 'image/png' });

const existingImages = [
    { id: 1, name: 'one', path: 'one.png' },
    { id: 2, name: 'two', path: 'two.png' }
];

/** Renders the panel with mocked service-wrapper props and returns them. */
const renderPanel = (props = {}) => {
    const handlers = {
        addImage: vi.fn(async () => ({ id: 99 })),
        removeImage: vi.fn(async () => true),
        refetch: vi.fn(async () => ({ id: 5 })),
        onSaved: vi.fn()
    };
    const utils = render(
        <MediaManagerPanel images={existingImages} {...handlers} {...props} />
    );
    return { ...handlers, ...utils };
};

/** Queues the given files through the hidden file input. */
const uploadFiles = (container, files) => {
    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files } });
};

let blobId = 0;

beforeEach(() => {
    blobId = 0;
    URL.createObjectURL = vi.fn(() => `blob:preview-${++blobId}`);
    URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('MediaManagerPanel staging', () => {
    it('stages a delete with undo instead of deleting immediately', () => {
        const { removeImage } = renderPanel();

        fireEvent.click(screen.getAllByTitle('Remove image')[0]);

        expect(screen.getByTitle('Undo removal')).toBeDefined();
        expect(removeImage).not.toHaveBeenCalled();

        fireEvent.click(screen.getByTitle('Undo removal'));

        expect(screen.queryByTitle('Undo removal')).toBeNull();
        expect(screen.getAllByTitle('Remove image')).toHaveLength(2);
    });

    it('queues valid image files as pending uploads and filters invalid types', () => {
        const { container, addImage } = renderPanel();

        uploadFiles(container, [pngFile(), new File(['x'], 'notes.txt', { type: 'text/plain' })]);

        expect(screen.getAllByText('New')).toHaveLength(1);
        expect(addImage).not.toHaveBeenCalled();
    });

    it('caps uploads at maxImages and hides the add cell when full', () => {
        const { container } = renderPanel({ maxImages: 3 });

        // Two existing images leave one slot; only one of the two files fits.
        uploadFiles(container, [pngFile('a.png'), pngFile('b.png')]);

        expect(screen.getAllByText('New')).toHaveLength(1);
        expect(screen.queryByText('Add')).toBeNull();
    });

    it('cancelling a queued upload revokes its preview URL', () => {
        const { container } = renderPanel();

        uploadFiles(container, [pngFile()]);
        fireEvent.click(screen.getByTitle('Cancel upload'));

        expect(screen.queryByText('New')).toBeNull();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview-1');
    });
});

describe('MediaManagerPanel save flow', () => {
    it('disables Save until there are pending changes', () => {
        renderPanel();

        expect(screen.getByRole('button', { name: 'Save' }).disabled).toBe(true);

        fireEvent.click(screen.getAllByTitle('Remove image')[0]);

        expect(screen.getByRole('button', { name: 'Save' }).disabled).toBe(false);
    });

    it('does not touch the server when the delete confirmation is declined', () => {
        vi.spyOn(window, 'confirm').mockReturnValue(false);
        const { removeImage, refetch } = renderPanel();

        fireEvent.click(screen.getAllByTitle('Remove image')[0]);
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(removeImage).not.toHaveBeenCalled();
        expect(refetch).not.toHaveBeenCalled();
    });

    it('commits staged deletes and uploads, then hands the refetched entity to onSaved', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        const { container, removeImage, addImage, refetch, onSaved } = renderPanel();

        fireEvent.click(screen.getAllByTitle('Remove image')[0]);
        uploadFiles(container, [pngFile()]);
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await screen.findByText('Saved');
        expect(removeImage).toHaveBeenCalledWith(1);
        expect(addImage).toHaveBeenCalledTimes(1);
        expect(refetch).toHaveBeenCalledTimes(1);
        expect(onSaved).toHaveBeenCalledWith({ id: 5 });
        expect(screen.queryByText('New')).toBeNull();
    });

    it('shows the error state when any single operation fails, even if the refetch succeeds', async () => {
        const { container, addImage } = renderPanel();
        addImage.mockResolvedValue(null);

        uploadFiles(container, [pngFile()]);
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await screen.findByText('Failed to save');
        expect(screen.queryByText('Saved')).toBeNull();
    });

    it('keeps the pending changes when the refetch fails, so the user can retry', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        const { removeImage, refetch, onSaved } = renderPanel();
        refetch.mockResolvedValue(null);

        fireEvent.click(screen.getAllByTitle('Remove image')[0]);
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await screen.findByText('Failed to save');
        expect(removeImage).toHaveBeenCalledWith(1);
        expect(onSaved).not.toHaveBeenCalled();
        expect(screen.getByTitle('Undo removal')).toBeDefined();
    });
});
