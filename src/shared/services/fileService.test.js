import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fileService } from './fileService';

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('fileService.getImageUrl', () => {
    it('builds the public image URL from the images origin', () => {
        expect(fileService.getImageUrl('locations/5/photo.png'))
            .toBe('http://api.test/api/images/locations/5/photo.png');
    });
});

describe('fileService.getImage', () => {
    it('downloads the image and wraps it in a File with the given name', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => ({
            ok: true,
            blob: async () => new Blob(['image-bytes'])
        })));

        const file = await fileService.getImage('locations/5/photo.png', 'photo.png');

        expect(file).toBeInstanceOf(File);
        expect(file.name).toBe('photo.png');
    });

    it('returns null instead of throwing when the download fails', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })));
        vi.spyOn(console, 'log').mockImplementation(() => {});

        const file = await fileService.getImage('missing.png', 'missing.png');

        expect(file).toBeNull();
    });
});
