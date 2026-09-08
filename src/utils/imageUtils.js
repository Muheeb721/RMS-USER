import { getPropertyImage } from './propertyImageCatalog';

export const HERO_IMAGE = 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80&ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aG9tZXxlbnwwfHwwfHw%3D';
export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80&ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aG91c2V8ZW58MHx8MHx8';
export const HOUSE_FALLBACK = 'https://images.unsplash.com/photo-1505691723518-34d640e9f87e?auto=format&fit=crop&w=1200&q=80&ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8aG91c2V8ZW58MHx8MHx8';
export const APARTMENT_FALLBACK = 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80&ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8YXBhcnRtZW50fGVufDB8fDB8fA%3D%3D';
export const FLAT_FALLBACK = 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1200&q=80&ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8ZmxhdHxlbnwwfHwwfHw%3D';
export const INTERIOR_FALLBACK = 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80&ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fGludGVyaW9yfGVufDB8fDB8fA%3D%3D';
export const VIDEO_PLACEHOLDER = 'https://images.unsplash.com/photo-1506619216599-9d16e99f0d23?auto=format&fit=crop&w=1200&q=80&ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fHZpZGVvfGVufDB8fDB8fA%3D%3D';

export function getPrimaryImage(property) {
  try {
    return getPropertyImage(property) || FALLBACK_IMAGE;
  } catch (e) {
    return FALLBACK_IMAGE;
  }
}

export default { getPrimaryImage };
