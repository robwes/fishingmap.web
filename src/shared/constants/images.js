/**
 * Image MIME types accepted by upload inputs across the app, and the
 * matching `accept` attribute value for file inputs. Keep upload components
 * (DragAndDropImage, MediaManagerPanel) on this list so they can't drift.
 */
export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

export const IMAGE_ACCEPT = VALID_IMAGE_TYPES.join(',');
